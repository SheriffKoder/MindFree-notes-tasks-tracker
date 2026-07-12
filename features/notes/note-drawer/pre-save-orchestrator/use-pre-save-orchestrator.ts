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
  useDeleteNoteMutation,
  useUpdateNoteMutation,
} from "@/entities/note/client";
import type {
  NoteFormChangeMeta,
  NoteFormValues,
  NoteSaveStatus,
} from "@/entities/note/editor/model/types";
import { formatCalendarNoteTitle } from "@/entities/note/editor/lib/format-calendar-note-title";
import type { Note } from "@/entities/note";
import { saveNoteOfflinePending } from "@/entities/note/offline/notes-offline-storage";
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
const SAVED_STATUS_RESET_MS = 2000;

type PendingMutation =
  | {
      kind: "patch";
      note: Note;
      values: NoteFormValues;
      date: string | null;
      replaceExistingOnDate: boolean;
    }
  | {
      kind: "create-calendar";
      date: string;
      values: NoteFormValues;
      replaceExistingOnDate: boolean;
    }
  | { kind: "create-general"; values: NoteFormValues }
  | { kind: "delete"; note: Note };

function formValuesFromPayload(payload: NoteSavePayload): NoteFormValues {
  const { date: _date, ...values } = payload;
  return values;
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
}: UsePreSaveOrchestratorOptions): UsePreSaveOrchestratorResult {
  const queryClient = useQueryClient();
  const { mutate: patchNote } = useUpdateNoteMutation();
  const { mutate: createCalendarNote } = useCreateCalendarNoteMutation();
  const { mutate: createGeneralNote } = useCreateGeneralNoteMutation();
  const { mutate: deleteNote } = useDeleteNoteMutation();

  const [saveStatus, setSaveStatus] = useState<NoteSaveStatus>("idle");
  const [commitKey, setCommitKey] = useState(0);
  const [effectiveDateNavEnabled, setEffectiveDateNavEnabled] = useState(false);
  const [isSavingEnabled, setIsSavingEnabled] = useState(true);
  const [conflict, setConflict] = useState<
    EvaluateNoteSaveResult["conflict"]
  >(null);

  const lastPickedDateRef = useRef<string | null>(null);
  const replaceConfirmedRef = useRef(false);
  const pendingMutationRef = useRef<PendingMutation | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastEvaluationRef = useRef<EvaluateNoteSaveResult | null>(null);
  const lastFormValuesRef = useRef<NoteFormValues | null>(null);
  const lastFormMetaRef = useRef<NoteFormChangeMeta>({
    isDirty: false,
    isValid: true,
  });

  const clearDebounceTimer = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  const markSaveSuccess = useCallback(() => {
    setSaveStatus("saved");
    setCommitKey((previous) => previous + 1);
    replaceConfirmedRef.current = false;

    if (savedResetTimerRef.current) {
      clearTimeout(savedResetTimerRef.current);
    }

    savedResetTimerRef.current = setTimeout(() => {
      setSaveStatus("idle");
    }, SAVED_STATUS_RESET_MS);
  }, []);

  const markSaveError = useCallback(() => {
    setSaveStatus("error");
  }, []);

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

    pendingMutationRef.current = null;
    setSaveStatus("saving");

    /////////////////////////////////
    // Offline — persist locally, keep optimistic cache, skip network
    if (!isOnline()) {
      if (!userId) {
        markSaveError();
        return;
      }

      switch (pending.kind) {
        case "patch":
          saveNoteOfflinePending(userId, queryClient, {
            kind: "patch",
            note: pending.note,
            values: pending.values,
            date: pending.date,
            replaceExistingOnDate: pending.replaceExistingOnDate,
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

      markSaveSuccess();
      return;
    }

    const mutationOptions = {
      onSuccess: () => {
        markSaveSuccess();
      },
      onError: () => {
        markSaveError();
      },
    };

    /////////////////////////////////
    // Dispatch debounced mutation kind chosen by evaluateNoteSave
    switch (pending.kind) {
      case "patch":
        patchNote(
          {
            note: pending.note,
            values: pending.values,
            date: pending.date,
            replaceExistingOnDate: pending.replaceExistingOnDate,
          },
          mutationOptions,
        );
        return;
      case "create-calendar":
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
        createGeneralNote(
          { values: pending.values },
          {
            onSuccess: (serverNote) => {
              markSaveSuccess();
              onGeneralNoteCreated(serverNote.id);
            },
            onError: () => {
              markSaveError();
            },
          },
        );
        return;
      case "delete":
        deleteNote({ note: pending.note }, mutationOptions);
    }
  }, [
    createCalendarNote,
    createGeneralNote,
    deleteNote,
    markSaveError,
    markSaveSuccess,
    onGeneralNoteCreated,
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
            return;
          }

          scheduleMutation({
            kind: "patch",
            note,
            values,
            date: result.payload.date,
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
    [clearDebounceTimer, note, scheduleMutation],
  );

  const evaluate = useCallback(
    (values: NoteFormValues, meta: NoteFormChangeMeta) => {
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

        return;
      }

      /////////////////////////////////
      // 3. Schedule debounced mutation for the chosen action
      scheduleFromEvaluation(result);
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

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    /////////////////////////////////
    // Drawer open — reset save UI, picker refs, and date-nav mode for this context
    setSaveStatus("idle");
    lastPickedDateRef.current = null;
    replaceConfirmedRef.current = false;
    setConflict(null);
    setIsSavingEnabled(true);

    const openingDate =
      note?.date ?? resolveOpeningCalendarDate(activeDate, request);
    setEffectiveDateNavEnabled(openingDate !== null);
  }, [activeDate, isOpen, note?.date, note?.id, request]);

  useEffect(() => {
    return () => {
      clearDebounceTimer();

      if (savedResetTimerRef.current) {
        clearTimeout(savedResetTimerRef.current);
      }
    };
  }, [clearDebounceTimer]);

  return {
    saveStatus,
    handleChange,
    commitKey,
    effectiveDateNavEnabled,
    isSavingEnabled,
    conflict,
    resolveReplace,
    resolveDismiss,
    applyPickedDate,
    reevaluateFromCache,
  };
}
