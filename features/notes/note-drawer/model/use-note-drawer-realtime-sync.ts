/**
 * @file features/notes/note-drawer/model/use-note-drawer-realtime-sync.ts
 * Coordinates dirty-form protection and realtime updates for the note drawer.
 *
 * Purpose: Keep realtime side effects and editor-sync state outside the drawer UI.
 * Used in: features/notes/note-drawer/ui/note-drawer.tsx
 * Used for: Tracking local edits, registering the sync guard, and accepting safe
 *           remote revisions into an idle form.
 *
 * Steps:
 * 1. Wrap form changes to track dirty state and the latest local edit time.
 * 2. Reset the editor timing guard whenever an open drawer context changes.
 * 3. Publish the current editor state for synchronous realtime decisions.
 * 4. Register a stable drawer handler that re-evaluates save rules and syncs fields.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type {
  NoteFormChangeMeta,
  NoteFormValues,
} from "@/entities/note/editor/model/types";
import type { RealtimeNoteChangePayload } from "@/entities/note/tanstack/use-notes-realtime-sync";
import {
  registerNoteEditorSyncState,
  shouldSyncRemoteIntoForm,
} from "@/features/notes/note-drawer/model/note-editor-sync-guard";
import { registerNoteDrawerRealtimeHandler } from "@/features/notes/note-drawer/model/note-realtime-drawer-bridge";

export interface UseNoteDrawerRealtimeSyncOptions {
  isOpen: boolean;
  noteId: string | null;
  resetKey: string;
  onChange: (values: NoteFormValues, meta: NoteFormChangeMeta) => void;
  reevaluateFromCache: () => void;
}

export interface UseNoteDrawerRealtimeSyncResult {
  /** Bumped when the form may safely pull the latest cached note fields. */
  remoteSyncKey: number;
  /** Form change handler that also updates the realtime dirty-state guard. */
  handleChangeWithDirty: (
    values: NoteFormValues,
    meta: NoteFormChangeMeta,
  ) => void;
}

/**
 * Connects an open note form to the drawer's realtime synchronization bridge.
 */
export function useNoteDrawerRealtimeSync({
  isOpen,
  noteId,
  resetKey,
  onChange,
  reevaluateFromCache,
}: UseNoteDrawerRealtimeSyncOptions): UseNoteDrawerRealtimeSyncResult {
  const [remoteSyncKey, setRemoteSyncKey] = useState(0);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const openedAtRef = useRef(0);
  const lastLocalEditAtRef = useRef<number | null>(null);

  const handleChangeWithDirty = useCallback(
    function handleChangeWithDirty(
      values: NoteFormValues,
      meta: NoteFormChangeMeta,
    ) {
      // Track the latest keystroke so remote updates wait for the idle threshold.
      if (meta.isDirty) {
        lastLocalEditAtRef.current = Date.now();
      }

      // Publish dirty changes through state and preserve the original save pipeline.
      setIsFormDirty(meta.isDirty);
      onChange(values, meta);
    },
    [onChange],
  );

  useEffect(
    function resetEditorSyncTiming() {
      // A newly opened editor context starts clean and begins a fresh idle window.
      if (isOpen) {
        openedAtRef.current = Date.now();
        lastLocalEditAtRef.current = null;
        setIsFormDirty(false);
      }
    },
    [isOpen, resetKey],
  );

  useEffect(
    function publishEditorSyncState() {
      // The realtime callback reads this singleton synchronously after cache updates.
      registerNoteEditorSyncState({
        isOpen,
        noteId,
        isDirty: isFormDirty,
        openedAt: openedAtRef.current,
        lastLocalEditAt: lastLocalEditAtRef.current,
      });
    },
    [isFormDirty, isOpen, noteId],
  );

  useEffect(
    function registerRealtimeDrawerSync() {
      // Re-evaluate cache-dependent save gates before optionally pulling remote fields.
      function handleRealtimeChange({
        note: changedNote,
      }: RealtimeNoteChangePayload) {
        reevaluateFromCache();

        if (changedNote && shouldSyncRemoteIntoForm(changedNote.id)) {
          setRemoteSyncKey(function incrementRemoteSyncKey(previous) {
            return previous + 1;
          });
        }
      }

      registerNoteDrawerRealtimeHandler(handleRealtimeChange);

      return function unregisterRealtimeDrawerSync() {
        registerNoteDrawerRealtimeHandler(null);
      };
    },
    [reevaluateFromCache],
  );

  return {
    remoteSyncKey,
    handleChangeWithDirty,
  };
}
