/**
 * @file features/notes/note-drawer/pre-save-orchestrator/use-pre-save-orchestrator.ts
 * Thin hook — refs, debounce, TanStack mutations; rules live in evaluate-note-save.
 *
 * Purpose: Bridge dumb NoteForm onChange events to debounced TanStack writes.
 * Used in: features/notes/note-drawer/ui/note-drawer.tsx
 * Used for: Step 11 autosave orchestration, conflict UI state, and date-picker refs.
 *
 * Function index:
 * - usePreSaveOrchestrator: main hook returned to the drawer island
 * - applyPickedDate: record lastPickedDate and return formatted title for the form
 * - resolveReplace / resolveDismiss: conflict footer actions
 *
 * Steps (handleChange):
 * 1. evaluate — run pure pipeline; sync nav/saving/conflict UI state.
 * 2. Gate — skip scheduling when saving disabled or action is noop.
 * 3. scheduleFromEvaluation — enqueue debounced patch/create/delete mutation.
 */

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  useCreateCalendarNoteMutation,
  useCreateGeneralNoteMutation,
  useCreateQuickNoteMutation,
  useDeleteNoteMutation,
  useUpdateNoteMutation,
} from "@/entities/note/client";
import {
  STALE_WRITE_ERROR_CODE,
  type PatchNoteError,
} from "@/entities/note/client/patch-note";
import type {
  NoteFormChangeMeta,
  NoteFormValues,
  NoteSaveStatus,
} from "@/entities/note/editor/model/types";
import { formatCalendarNoteTitle } from "@/entities/note/editor/lib/format-calendar-note-title";
import type { Note } from "@/entities/note";
import { saveNoteOfflinePending } from "@/entities/note/offline";
import { findNoteOnDateInCache } from "@/features/notes/note-drawer/lib/find-note-in-cache";
import { isOnline } from "@/shared/offline-queue";
import {
  evaluateNoteSave,
  resolveOpeningCalendarDate,
} from "@/features/notes/note-drawer/pre-save-orchestrator/evaluate-note-save";
import type {
  EvaluateNoteSaveResult,
  NoteSavePayload,
  UsePreSaveOrchestratorOptions,
  UsePreSaveOrchestratorResult,
} from "@/features/notes/note-drawer/pre-save-orchestrator/types";

const MUTATION_DEBOUNCE_MS = 600;
const SAVE_STATUS_IDLE_MS = 2000;
const SAVED_STATUS_RESET_MS = 2000;

type PendingMutation =
  | {
      kind: "patch";
      note: Note;
      values: NoteFormValues;
      date: string | null;
      isQuick?: boolean;
      replaceExistingOnDate: boolean;
    }
  | {
      kind: "create-calendar";
      date: string;
      values: NoteFormValues;
      replaceExistingOnDate: boolean;
    }
  | { kind: "create-general"; values: NoteFormValues }
  | { kind: "create-quick"; values: NoteFormValues }
  | { kind: "delete"; note: Note };

function formValuesFromPayload(payload: NoteSavePayload): NoteFormValues {
  const { date: _date, isQuick: _isQuick, ...values } = payload;
  return values;
}

function formatMutationErrorFeedback(error: unknown, kind: string): string {
  if (!(error instanceof Error)) {
    return `${kind} failed · unknown error`;
  }

  const patchError = error as PatchNoteError;
  const parts = [
    kind,
    patchError.status != null ? String(patchError.status) : null,
    patchError.code ?? null,
    patchError.message || "request failed",
  ].filter(Boolean);

  if (patchError.code === STALE_WRITE_ERROR_CODE && patchError.note) {
    parts.push(`server=${patchError.note.lastEditedAt}`, "form reloaded");
  }

  return parts.join(" · ");
}

/**
 * Orchestrates drawer saves via evaluateNoteSave — no business rules here.
 */
export function usePreSaveOrchestrator({
  note,
  isOpen,
  request,
  activeDate,
  isDateNavEnabled,
  userId,
  onGeneralNoteCreated,
  onQuickNoteCreated,
}: UsePreSaveOrchestratorOptions): UsePreSaveOrchestratorResult {
  const queryClient = useQueryClient();
  const { mutate: patchNote } = useUpdateNoteMutation();
  const { mutate: createCalendarNote } = useCreateCalendarNoteMutation();
  const { mutate: createGeneralNote } = useCreateGeneralNoteMutation();
  const { mutate: createQuickNote } = useCreateQuickNoteMutation();
  const { mutate: deleteNote } = useDeleteNoteMutation();

  const [saveStatus, setSaveStatus] = useState<NoteSaveStatus>("idle");
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [commitKey, setCommitKey] = useState(0);
  const [formSyncKey, setFormSyncKey] = useState(0);
  const [effectiveDateNavEnabled, setEffectiveDateNavEnabled] = useState(false);
  const [isSavingEnabled, setIsSavingEnabled] = useState(true);
  const [conflict, setConflict] = useState<
    EvaluateNoteSaveResult["conflict"]
  >(null);

  const saveStatusRef = useRef<NoteSaveStatus>("idle");
  const actualSaveStatusRef = useRef<NoteSaveStatus>("idle");
  const lastPickedDateRef = useRef<string | null>(null);
  const replaceConfirmedRef = useRef(false);
  const pendingMutationRef = useRef<PendingMutation | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastEvaluationRef = useRef<EvaluateNoteSaveResult | null>(null);
  const lastFormValuesRef = useRef<NoteFormValues | null>(null);
  const lastFormMetaRef = useRef<NoteFormChangeMeta>({
    isDirty: false,
    isValid: true,
  });
  /** Last server-confirmed version the open form content is based on. */
  const confirmedLastEditedAtRef = useRef<string | null>(null);
  /** Prevents overlapping PATCHes from racing the concurrency token. */
  const patchInFlightRef = useRef(false);

  const clearDebounceTimer = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const clearSavedResetTimer = useCallback(() => {
    if (savedResetTimerRef.current) {
      clearTimeout(savedResetTimerRef.current);
      savedResetTimerRef.current = null;
    }
  }, []);

  const setGatedStatus = useCallback((nextStatus: NoteSaveStatus) => {
    saveStatusRef.current = nextStatus;
    setSaveStatus(nextStatus);
  }, []);

  const startSavedResetTimer = useCallback(() => {
    clearSavedResetTimer();
    savedResetTimerRef.current = setTimeout(() => {
      if (saveStatusRef.current === "saved") {
        setGatedStatus("idle");
        setSaveFeedback(null);
      }
    }, SAVED_STATUS_RESET_MS);
  }, [clearSavedResetTimer, setGatedStatus]);

  const startIdleTimer = useCallback(() => {
    clearIdleTimer();
    idleTimerRef.current = setTimeout(() => {
      clearIdleTimer();

      if (actualSaveStatusRef.current === "saved") {
        setGatedStatus("saved");
        startSavedResetTimer();
      }
    }, SAVE_STATUS_IDLE_MS);
  }, [clearIdleTimer, setGatedStatus, startSavedResetTimer]);

  const markSaveSuccess = useCallback((feedback?: string) => {
    actualSaveStatusRef.current = "saved";
    setCommitKey((previous) => previous + 1);
    replaceConfirmedRef.current = false;
    setSaveFeedback(feedback ?? "Saved");

    if (saveStatusRef.current === "saving") {
      startIdleTimer();
      return;
    }

    setGatedStatus("saved");
    startSavedResetTimer();
  }, [setGatedStatus, startIdleTimer, startSavedResetTimer]);

  const markSaveError = useCallback(
    (feedback: string) => {
      actualSaveStatusRef.current = "error";
      clearIdleTimer();
      clearSavedResetTimer();
      setSaveFeedback(feedback);
      setGatedStatus("error");
    },
    [clearIdleTimer, clearSavedResetTimer, setGatedStatus],
  );

  const acceptRemoteFormSync = useCallback((serverLastEditedAt: string) => {
    confirmedLastEditedAtRef.current = serverLastEditedAt;
    setSaveFeedback(`Remote sync · confirmed=${serverLastEditedAt}`);
  }, []);

  const handlePatchError = useCallback(
    (error: unknown) => {
      const patchError = error as PatchNoteError;

      if (
        patchError.code === STALE_WRITE_ERROR_CODE &&
        patchError.note
      ) {
        confirmedLastEditedAtRef.current = patchError.note.lastEditedAt;
        setFormSyncKey((previous) => previous + 1);
      }

      markSaveError(formatMutationErrorFeedback(error, "PATCH"));
    },
    [markSaveError],
  );

  const findNoteOnDate = useCallback(
    (date: string, excludeNoteId?: string): Note | null =>
      findNoteOnDateInCache(queryClient, date, excludeNoteId),
    [queryClient],
  );

  const runPendingMutation = useCallback(() => {
    const pending = pendingMutationRef.current;

    if (!pending) {
      return;
    }

    /////////////////////////////////
    // Serialize PATCHes — overlapping sends race expectedLastEditedAt.
    if (pending.kind === "patch" && patchInFlightRef.current) {
      return;
    }

    pendingMutationRef.current = null;
    actualSaveStatusRef.current = "saving";
    setGatedStatus("saving");
    clearIdleTimer();
    clearSavedResetTimer();

    /////////////////////////////////
    // Offline — persist locally, keep optimistic cache, skip network
    if (!isOnline()) {
      if (!userId) {
        markSaveError("Offline save blocked · no userId");
        return;
      }

      setSaveFeedback(`Saving offline · ${pending.kind}`);

      switch (pending.kind) {
        case "patch":
          saveNoteOfflinePending(userId, queryClient, {
            kind: "patch",
            note: pending.note,
            values: pending.values,
            date: pending.date,
            isQuick: pending.isQuick,
            replaceExistingOnDate: pending.replaceExistingOnDate,
            expectedLastEditedAt:
              confirmedLastEditedAtRef.current ?? pending.note.lastEditedAt,
          });
          break;
        case "create-calendar":
          saveNoteOfflinePending(userId, queryClient, {
            kind: "create-calendar",
            values: pending.values,
            date: pending.date,
            replaceExistingOnDate: pending.replaceExistingOnDate,
          });
          break;
        case "create-general":
          saveNoteOfflinePending(userId, queryClient, {
            kind: "create-general",
            values: pending.values,
          });
          break;
        case "create-quick":
          saveNoteOfflinePending(userId, queryClient, {
            kind: "create-quick",
            values: pending.values,
          });
          break;
        case "delete":
          saveNoteOfflinePending(userId, queryClient, {
            kind: "delete",
            note: pending.note,
            values: {
              title: pending.note.title,
              content: pending.note.content,
              starred: pending.note.starred,
              isImportant: pending.note.isImportant,
            },
          });
          break;
      }

      if (pending.kind === "create-general") {
        onGeneralNoteCreated("optimistic-general");
      }

      if (pending.kind === "create-quick") {
        onQuickNoteCreated("optimistic-quick");
      }

      markSaveSuccess(`Saved offline · ${pending.kind}`);
      return;
    }

    const mutationOptions = {
      onSuccess: () => {
        markSaveSuccess(`Saved · ${pending.kind}`);
      },
      onError: (error: unknown) => {
        markSaveError(formatMutationErrorFeedback(error, pending.kind));
      },
    };

    const flushQueuedPatch = () => {
      if (pendingMutationRef.current?.kind === "patch") {
        runPendingMutation();
      }
    };

    /////////////////////////////////
    // Dispatch debounced mutation kind chosen by evaluateNoteSave
    switch (pending.kind) {
      case "patch": {
        const expectedLastEditedAt = confirmedLastEditedAtRef.current;

        if (!expectedLastEditedAt) {
          markSaveError(
            "PATCH blocked · confirmedLastEditedAt is null (token never seeded)",
          );
          return;
        }

        setSaveFeedback(`Saving… · PATCH · expected=${expectedLastEditedAt}`);
        patchInFlightRef.current = true;
        patchNote(
          {
            note: pending.note,
            values: pending.values,
            date: pending.date,
            isQuick: pending.isQuick,
            replaceExistingOnDate: pending.replaceExistingOnDate,
            expectedLastEditedAt,
          },
          {
            onSuccess: (serverNote) => {
              confirmedLastEditedAtRef.current = serverNote.lastEditedAt;
              patchInFlightRef.current = false;
              markSaveSuccess(
                `Saved · PATCH · confirmed=${serverNote.lastEditedAt}`,
              );
              flushQueuedPatch();
            },
            onError: (error) => {
              patchInFlightRef.current = false;
              handlePatchError(error);
            },
          },
        );
        return;
      }
      case "create-calendar":
        setSaveFeedback(`Saving… · create-calendar · ${pending.date}`);
        createCalendarNote(
          {
            date: pending.date,
            values: pending.values,
            replaceExistingOnDate: pending.replaceExistingOnDate,
          },
          mutationOptions,
        );
        return;
      case "create-general":
        setSaveFeedback("Saving… · create-general");
        createGeneralNote(
          { values: pending.values },
          {
            onSuccess: (serverNote) => {
              confirmedLastEditedAtRef.current = serverNote.lastEditedAt;
              markSaveSuccess(
                `Saved · create-general · confirmed=${serverNote.lastEditedAt}`,
              );
              onGeneralNoteCreated(serverNote.id);
            },
            onError: (error) => {
              markSaveError(
                formatMutationErrorFeedback(error, "create-general"),
              );
            },
          },
        );
        return;
      case "create-quick":
        setSaveFeedback("Saving… · create-quick");
        createQuickNote(
          { values: pending.values },
          {
            onSuccess: (serverNote) => {
              confirmedLastEditedAtRef.current = serverNote.lastEditedAt;
              markSaveSuccess(
                `Saved · create-quick · confirmed=${serverNote.lastEditedAt}`,
              );
              onQuickNoteCreated(serverNote.id);
            },
            onError: (error) => {
              markSaveError(formatMutationErrorFeedback(error, "create-quick"));
            },
          },
        );
        return;
      case "delete":
        setSaveFeedback("Saving… · delete");
        deleteNote({ note: pending.note }, mutationOptions);
    }
  }, [
    createCalendarNote,
    createGeneralNote,
    createQuickNote,
    deleteNote,
    handlePatchError,
    markSaveError,
    markSaveSuccess,
    onGeneralNoteCreated,
    onQuickNoteCreated,
    patchNote,
    queryClient,
    userId,
  ]);

  const scheduleMutation = useCallback(
    (mutation: PendingMutation) => {
      pendingMutationRef.current = mutation;
      clearDebounceTimer();
      debounceTimerRef.current = setTimeout(
        runPendingMutation,
        MUTATION_DEBOUNCE_MS,
      );
    },
    [clearDebounceTimer, runPendingMutation],
  );

  const scheduleFromEvaluation = useCallback(
    (result: EvaluateNoteSaveResult) => {
      const values = formValuesFromPayload(result.payload);

      /////////////////////////////////
      // Map pipeline action → debounced TanStack mutation payload
      switch (result.action) {
        case "patch":
          if (!note) {
            markSaveError("PATCH skipped · note is null");
            return;
          }

          if (!confirmedLastEditedAtRef.current) {
            markSaveError(
              "PATCH skipped · confirmedLastEditedAt is null (token never seeded)",
            );
            return;
          }

          scheduleMutation({
            kind: "patch",
            note,
            values,
            date: result.payload.date,
            isQuick: result.payload.isQuick,
            replaceExistingOnDate: result.replaceExistingOnDate,
          });
          return;
        case "create-calendar": {
          const date = result.payload.date;

          if (!date) {
            return;
          }

          scheduleMutation({
            kind: "create-calendar",
            date,
            values,
            replaceExistingOnDate: result.replaceExistingOnDate,
          });
          return;
        }
        case "create-general":
          scheduleMutation({ kind: "create-general", values });
          return;
        case "create-quick":
          scheduleMutation({ kind: "create-quick", values });
          return;
        case "delete":
          if (!note) {
            return;
          }

          scheduleMutation({ kind: "delete", note });
          return;
        case "noop":
          pendingMutationRef.current = null;
          clearDebounceTimer();
      }
    },
    [clearDebounceTimer, markSaveError, note, scheduleMutation],
  );

  const evaluate = useCallback(
    (
      values: NoteFormValues,
      meta: NoteFormChangeMeta,
      options?: { promoteToQuick?: boolean },
    ) => {
      /////////////////////////////////
      // Run pure pipeline — no side effects beyond syncing drawer UI state
      const result = evaluateNoteSave({
        values,
        meta,
        note,
        request,
        activeDate,
        isDateNavEnabled,
        lastPickedDate: lastPickedDateRef.current,
        replaceConfirmed: replaceConfirmedRef.current,
        promoteToQuick: options?.promoteToQuick,
        findNoteOnDate,
      });

      lastEvaluationRef.current = result;
      setEffectiveDateNavEnabled(result.effectiveDateNavEnabled);
      setIsSavingEnabled(result.isSavingEnabled);
      setConflict(result.conflict);

      return result;
    },
    [activeDate, findNoteOnDate, isDateNavEnabled, note, request],
  );

  const handleChange = useCallback(
    (values: NoteFormValues, meta: NoteFormChangeMeta) => {
      lastFormValuesRef.current = values;
      lastFormMetaRef.current = meta;

      /////////////////////////////////
      // 1. Evaluate form change through the pre-save pipeline
      const result = evaluate(values, meta);

      /////////////////////////////////
      // 2. Gate — do not schedule when blocked (conflict) or action is noop
      if (!result.isSavingEnabled || result.action === "noop") {
        if (!result.isSavingEnabled) {
          pendingMutationRef.current = null;
          clearDebounceTimer();
        }

        if (result.action === "noop" && !meta.isDirty) {
          pendingMutationRef.current = null;
          clearDebounceTimer();
        }

        if (actualSaveStatusRef.current === "saved") {
          startIdleTimer();
        }

        return;
      }

      /////////////////////////////////
      // 3. Schedule debounced mutation for the chosen action
      scheduleFromEvaluation(result);
      startIdleTimer();
    },
    [clearDebounceTimer, evaluate, scheduleFromEvaluation],
  );

  const resolveReplace = useCallback(() => {
    /////////////////////////////////
    // User confirmed replace — allow conflict gate to pass on re-evaluation
    replaceConfirmedRef.current = true;
    setConflict(null);

    const last = lastEvaluationRef.current;

    if (!last) {
      return;
    }

    /////////////////////////////////
    // Re-run pipeline with replaceConfirmed; schedule if now unblocked
    const reevaluated = evaluate(
      formValuesFromPayload(last.payload),
      { isDirty: true, isValid: true },
    );

    if (reevaluated.isSavingEnabled && reevaluated.action !== "noop") {
      scheduleFromEvaluation(reevaluated);
    }
  }, [evaluate, scheduleFromEvaluation]);

  const resolveDismiss = useCallback(() => {
    /////////////////////////////////
    // User declined replace — keep autosave blocked while day stays occupied
    replaceConfirmedRef.current = false;

    const last = lastEvaluationRef.current;

    if (!last) {
      setConflict(null);
      setIsSavingEnabled(true);
      return;
    }

    const reevaluated = evaluate(
      formValuesFromPayload(last.payload),
      { isDirty: true, isValid: true },
    );

    // Hide the banner until the next edit; autosave stays blocked while occupied.
    setConflict(null);
    setIsSavingEnabled(reevaluated.isSavingEnabled);
  }, [evaluate]);

  const applyPickedDate = useCallback((isoDate: string) => {
    /////////////////////////////////
    // Record picker intent for resolveDate; reset replace consent on new pick
    lastPickedDateRef.current = isoDate;
    replaceConfirmedRef.current = false;
    return formatCalendarNoteTitle(isoDate);
  }, []);

  const reevaluateFromCache = useCallback(() => {
    const values = lastFormValuesRef.current;
    const meta = lastFormMetaRef.current;

    if (!values) {
      return;
    }

    /////////////////////////////////
    // Remote cache changed — refresh conflict/nav/saving gates only.
    evaluate(values, meta);
  }, [evaluate]);

  const promoteToQuick = useCallback(() => {
    if (!note?.id || note.isQuick) {
      return;
    }

    const values = lastFormValuesRef.current;

    if (!values) {
      return;
    }

    clearDebounceTimer();
    lastPickedDateRef.current = null;

    const result = evaluate(values, { isDirty: true, isValid: true }, {
      promoteToQuick: true,
    });

    if (!result.isSavingEnabled || result.action !== "patch") {
      return;
    }

    scheduleFromEvaluation(result);
    runPendingMutation();
  }, [
    clearDebounceTimer,
    evaluate,
    note,
    runPendingMutation,
    scheduleFromEvaluation,
  ]);

  useEffect(() => {
    if (!isOpen || !note?.id) {
      confirmedLastEditedAtRef.current = null;
      patchInFlightRef.current = false;
      return;
    }

    /////////////////////////////////
    // Seed concurrency token from the note at context open — not on optimistic cache bumps.
    confirmedLastEditedAtRef.current = note.lastEditedAt;
  }, [isOpen, note?.id]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    /////////////////////////////////
    // Drawer open — reset save UI, picker refs, and date-nav mode for this context
    setSaveStatus("idle");
    setSaveFeedback(null);
    saveStatusRef.current = "idle";
    actualSaveStatusRef.current = "idle";
    clearIdleTimer();
    clearSavedResetTimer();
    lastPickedDateRef.current = null;
    replaceConfirmedRef.current = false;
    setConflict(null);
    setIsSavingEnabled(true);
    setFormSyncKey(0);

    const openingDate =
      note?.date ?? resolveOpeningCalendarDate(activeDate, request);
    setEffectiveDateNavEnabled(openingDate !== null);
  }, [activeDate, clearIdleTimer, clearSavedResetTimer, isOpen, note?.date, note?.id, request]);

  useEffect(() => {
    return () => {
      clearDebounceTimer();
      clearIdleTimer();
      clearSavedResetTimer();
    };
  }, [clearDebounceTimer, clearIdleTimer, clearSavedResetTimer]);

  return {
    saveStatus,
    saveFeedback,
    handleChange,
    commitKey,
    formSyncKey,
    effectiveDateNavEnabled,
    isSavingEnabled,
    conflict,
    resolveReplace,
    resolveDismiss,
    applyPickedDate,
    reevaluateFromCache,
    acceptRemoteFormSync,
    promoteToQuick,
  };
}
