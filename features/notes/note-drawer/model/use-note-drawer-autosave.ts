/**
 * @file features/notes/note-drawer/model/use-note-drawer-autosave.ts
 * Debounced PATCH autosave orchestration for the drawer editor.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useUpdateNoteMutation } from "@/entities/note/client";
import type {
  NoteFormChangeMeta,
  NoteFormValues,
  NoteSaveStatus,
} from "@/entities/note/editor/model/types";
import type { Note } from "@/entities/note";

const AUTOSAVE_DEBOUNCE_MS = 600;
const SAVED_STATUS_RESET_MS = 2000;

interface PendingSave {
  note: Note;
  values: NoteFormValues;
}

export interface UseNoteDrawerAutosaveResult {
  /** Transient save feedback for the editor footer. */
  saveStatus: NoteSaveStatus;
  /** Passed to `NoteForm` — schedules debounced PATCH when dirty and valid. */
  handleChange: (values: NoteFormValues, meta: NoteFormChangeMeta) => void;
  /** Incremented after a successful save so the form can snap its dirty baseline. */
  commitKey: number;
}

/**
 * Owns drawer autosave timing — entity mutation handles PATCH and cache updates.
 *
 * Step 10 will extend this hook for lazy create; Step 9 only PATCHes existing rows.
 *
 * Pending debounced saves are not flushed on drawer close — the timer keeps running
 * in this hook (which stays mounted) so a save can still complete after the panel closes.
 */
export function useNoteDrawerAutosave(
  note: Note | null,
  isOpen: boolean,
): UseNoteDrawerAutosaveResult {
  const { mutate } = useUpdateNoteMutation();

  const [saveStatus, setSaveStatus] = useState<NoteSaveStatus>("idle");
  const [commitKey, setCommitKey] = useState(0);

  const pendingSaveRef = useRef<PendingSave | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearDebounceTimer = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  const flushSave = useCallback(() => {
    const pending = pendingSaveRef.current;

    if (!pending) {
      return;
    }

    pendingSaveRef.current = null;
    setSaveStatus("saving");

    mutate(
      { note: pending.note, values: pending.values },
      {
        onSuccess: () => {
          setSaveStatus("saved");
          setCommitKey((previous) => previous + 1);

          if (savedResetTimerRef.current) {
            clearTimeout(savedResetTimerRef.current);
          }

          savedResetTimerRef.current = setTimeout(() => {
            setSaveStatus("idle");
          }, SAVED_STATUS_RESET_MS);
        },
        onError: () => {
          setSaveStatus("error");
        },
      },
    );
  }, [mutate]);

  const scheduleSave = useCallback(
    (values: NoteFormValues, targetNote: Note) => {
      pendingSaveRef.current = { note: targetNote, values };
      clearDebounceTimer();
      debounceTimerRef.current = setTimeout(flushSave, AUTOSAVE_DEBOUNCE_MS);
    },
    [clearDebounceTimer, flushSave],
  );

  const handleChange = useCallback(
    (values: NoteFormValues, meta: NoteFormChangeMeta) => {
      if (!note?.id || !meta.isDirty || !meta.isValid) {
        if (!meta.isDirty) {
          pendingSaveRef.current = null;
          clearDebounceTimer();
        }

        return;
      }

      scheduleSave(values, note);
    },
    [clearDebounceTimer, note, scheduleSave],
  );

  // Reset transient status when opening a different note context.
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
