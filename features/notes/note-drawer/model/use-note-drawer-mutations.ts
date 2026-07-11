/**
 * @file features/notes/note-drawer/model/use-note-drawer-mutations.ts
 * Debounced create, PATCH, and calendar delete orchestration for the drawer editor.
 */

"use client";

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
import type { Note } from "@/entities/note";
import {
  hasMeaningfulContent,
  isCalendarDateContext,
  isGeneralCreateRequest,
  resolveCalendarDate,
  shouldDeleteCalendarNoteOnEmptyContent,
} from "@/features/notes/note-drawer/lib/note-mutation-rules";
import type { NoteEditorRequest } from "@/views/notes/model/editor/note-editor-request";

const MUTATION_DEBOUNCE_MS = 600;
const SAVED_STATUS_RESET_MS = 2000;

type PendingMutation =
  | { kind: "patch"; note: Note; values: NoteFormValues }
  | { kind: "create-calendar"; date: string; values: NoteFormValues }
  | { kind: "create-general"; values: NoteFormValues }
  | { kind: "delete"; note: Note };

export interface UseNoteDrawerMutationsOptions {
  note: Note | null;
  isOpen: boolean;
  request: NoteEditorRequest | null;
  activeDate: string | null;
  isDateNavEnabled: boolean;
  /** Switches general create intent to edit mode after the first row exists. */
  onGeneralNoteCreated: (noteId: string) => void;
}

export interface UseNoteDrawerMutationsResult {
  saveStatus: NoteSaveStatus;
  handleChange: (values: NoteFormValues, meta: NoteFormChangeMeta) => void;
  commitKey: number;
}

/**
 * Routes drawer edits to lazy create, PATCH autosave, or calendar delete.
 */
export function useNoteDrawerMutations({
  note,
  isOpen,
  request,
  activeDate,
  isDateNavEnabled,
  onGeneralNoteCreated,
}: UseNoteDrawerMutationsOptions): UseNoteDrawerMutationsResult {
  const { mutate: patchNote } = useUpdateNoteMutation();
  const { mutate: createCalendarNote } = useCreateCalendarNoteMutation();
  const { mutate: createGeneralNote } = useCreateGeneralNoteMutation();
  const { mutate: deleteNote } = useDeleteNoteMutation();

  const [saveStatus, setSaveStatus] = useState<NoteSaveStatus>("idle");
  const [commitKey, setCommitKey] = useState(0);

  const pendingMutationRef = useRef<PendingMutation | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearDebounceTimer = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  const markSaveSuccess = useCallback(() => {
    setSaveStatus("saved");
    setCommitKey((previous) => previous + 1);

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

  const runPendingMutation = useCallback(() => {
    const pending = pendingMutationRef.current;

    if (!pending) {
      return;
    }

    pendingMutationRef.current = null;
    setSaveStatus("saving");

    const mutationOptions = {
      onSuccess: () => {
        markSaveSuccess();
      },
      onError: () => {
        markSaveError();
      },
    };

    switch (pending.kind) {
      case "patch":
        patchNote(
          { note: pending.note, values: pending.values },
          mutationOptions,
        );
        return;
      case "create-calendar":
        createCalendarNote(
          { date: pending.date, values: pending.values },
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

  const handleChange = useCallback(
    (values: NoteFormValues, meta: NoteFormChangeMeta) => {
      const calendarDate = resolveCalendarDate(activeDate, request);
      const inCalendarContext = isCalendarDateContext(
        request,
        activeDate,
        isDateNavEnabled,
      );
      const inGeneralCreate = isGeneralCreateRequest(request);

      if (!note?.id) {
        if (!hasMeaningfulContent(values) || !meta.isValid) {
          if (!hasMeaningfulContent(values)) {
            pendingMutationRef.current = null;
            clearDebounceTimer();
          }

          return;
        }

        if (inCalendarContext && calendarDate) {
          scheduleMutation({
            kind: "create-calendar",
            date: calendarDate,
            values,
          });
          return;
        }

        if (inGeneralCreate) {
          scheduleMutation({ kind: "create-general", values });
        }

        return;
      }

      if (shouldDeleteCalendarNoteOnEmptyContent(note, values, meta)) {
        scheduleMutation({ kind: "delete", note });
        return;
      }

      if (!meta.isDirty || !meta.isValid) {
        if (!meta.isDirty) {
          pendingMutationRef.current = null;
          clearDebounceTimer();
        }

        return;
      }

      scheduleMutation({ kind: "patch", note, values });
    },
    [
      activeDate,
      clearDebounceTimer,
      isDateNavEnabled,
      note,
      request,
      scheduleMutation,
    ],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSaveStatus("idle");
  }, [isOpen, note?.id]);

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
  };
}
