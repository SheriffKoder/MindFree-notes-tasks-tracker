/**
 * @file features/notes/note-drawer/model/use-note-drawer-realtime-sync.ts
 * Coordinates dirty-form protection and realtime updates for the note drawer.
 *
 * Purpose: Keep realtime side effects and editor-sync state outside the drawer UI.
 * Used in: features/notes/note-drawer/ui/note-drawer.tsx
 * Used for: Synchronous dirty publish, clean remote pulls, dirty remote banner.
 *
 * Steps:
 * 1. Wrap form changes to publish dirty synchronously into the sync guard.
 * 2. Reset pending/banner state whenever an open drawer context changes.
 * 3. On realtime: clean → pull form; dirty + newer remote → pending + banner.
 * 4. Reload accepts the remote revision and bumps formReloadKey; Keep dismisses UI.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type {
  NoteFormChangeMeta,
  NoteFormValues,
} from "@/entities/note/editor/model/types";
import type { RealtimeNoteChangePayload } from "@/entities/note/client";
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
  /** Called when a remote revision is safely pulled into the open form. */
  onRemoteFormSync?: (serverRevision: number) => void;
  /** Bumps the single drawer formReloadKey owned by the orchestrator. */
  bumpFormReloadKey?: () => void;
  /** Server-confirmed revision the open form content is based on. */
  getConfirmedRevision?: () => number | null;
}

export interface UseNoteDrawerRealtimeSyncResult {
  /** Form change handler that also updates the realtime dirty-state guard. */
  handleChangeWithDirty: (
    values: NoteFormValues,
    meta: NoteFormChangeMeta,
  ) => void;
  /**
   * Newer remote revision while the form is dirty.
   * Null when there is no outstanding remote update for this open form.
   */
  pendingRemoteRevision: number | null;
  /** True when the dirty-form remote banner should render. */
  showRemoteUpdateBanner: boolean;
  /** Discard local fields and load the cached remote note into the form. */
  reloadRemoteForm: () => void;
  /** Hide the banner; keep pending so a later save can still 409 correctly. */
  dismissRemoteBanner: () => void;
}

/**
 * @returns whether remoteRevision is strictly newer than the confirmed form token.
 */
function isRemoteNewerThanConfirmed(
  remoteRevision: number,
  confirmedRevision: number | null | undefined,
): boolean {
  if (confirmedRevision == null) {
    return true;
  }

  return remoteRevision > confirmedRevision;
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
  onRemoteFormSync,
  bumpFormReloadKey,
  getConfirmedRevision,
}: UseNoteDrawerRealtimeSyncOptions): UseNoteDrawerRealtimeSyncResult {
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [pendingRemoteRevision, setPendingRemoteRevision] = useState<
    number | null
  >(null);
  const [isRemoteBannerDismissed, setIsRemoteBannerDismissed] = useState(false);

  const isFormDirtyRef = useRef(false);
  const pendingRemoteRevisionRef = useRef<number | null>(null);
  const onRemoteFormSyncRef = useRef(onRemoteFormSync);
  const bumpFormReloadKeyRef = useRef(bumpFormReloadKey);
  const getConfirmedRevisionRef = useRef(getConfirmedRevision);
  onRemoteFormSyncRef.current = onRemoteFormSync;
  bumpFormReloadKeyRef.current = bumpFormReloadKey;
  getConfirmedRevisionRef.current = getConfirmedRevision;

  /////////////////////////////////
  // Keep refs aligned for sync-path reads outside React render.
  isFormDirtyRef.current = isFormDirty;
  pendingRemoteRevisionRef.current = pendingRemoteRevision;

  const publishEditorSyncState = useCallback(
    function publishEditorSyncState(nextIsDirty: boolean) {
      // Realtime reads this singleton synchronously after cache updates.
      registerNoteEditorSyncState({
        isOpen,
        noteId,
        isDirty: nextIsDirty,
      });
    },
    [isOpen, noteId],
  );

  const pullRemoteIntoForm = useCallback(function pullRemoteIntoForm(
    serverRevision: number,
  ) {
    onRemoteFormSyncRef.current?.(serverRevision);
    setPendingRemoteRevision(null);
    pendingRemoteRevisionRef.current = null;
    setIsRemoteBannerDismissed(false);
    bumpFormReloadKeyRef.current?.();
  }, []);

  const handleChangeWithDirty = useCallback(
    function handleChangeWithDirty(
      values: NoteFormValues,
      meta: NoteFormChangeMeta,
    ) {
      /////////////////////////////////
      // Publish dirty before onChange so a concurrent realtime event sees truth.
      isFormDirtyRef.current = meta.isDirty;
      setIsFormDirty(meta.isDirty);
      publishEditorSyncState(meta.isDirty);

      /////////////////////////////////
      // Clean again with a pending remote → pull immediately (policy: clean always syncs).
      if (
        !meta.isDirty &&
        pendingRemoteRevisionRef.current != null &&
        shouldSyncRemoteIntoForm(noteId ?? "")
      ) {
        pullRemoteIntoForm(pendingRemoteRevisionRef.current);
      }

      onChange(values, meta);
    },
    [noteId, onChange, publishEditorSyncState, pullRemoteIntoForm],
  );

  const reloadRemoteForm = useCallback(
    function reloadRemoteForm() {
      const pending = pendingRemoteRevisionRef.current;

      if (pending == null) {
        return;
      }

      // Explicit Reload: accept the remote revision and force a form field pull.
      pullRemoteIntoForm(pending);
      isFormDirtyRef.current = false;
      setIsFormDirty(false);
      publishEditorSyncState(false);
    },
    [publishEditorSyncState, pullRemoteIntoForm],
  );

  const dismissRemoteBanner = useCallback(function dismissRemoteBanner() {
    // Keep pending so PATCH still sends the older confirmed token → 409 if needed.
    setIsRemoteBannerDismissed(true);
  }, []);

  useEffect(
    function resetEditorSyncContext() {
      // A newly opened editor context starts clean with no pending remote banner.
      if (isOpen) {
        isFormDirtyRef.current = false;
        pendingRemoteRevisionRef.current = null;
        setIsFormDirty(false);
        setPendingRemoteRevision(null);
        setIsRemoteBannerDismissed(false);
        registerNoteEditorSyncState({
          isOpen: true,
          noteId,
          isDirty: false,
        });
      } else {
        registerNoteEditorSyncState({
          isOpen: false,
          noteId: null,
          isDirty: false,
        });
      }
    },
    [isOpen, noteId, resetKey],
  );

  useEffect(
    function publishOpenNoteIdentity() {
      // Keep open/noteId in the singleton when dirty has not changed via keystrokes.
      registerNoteEditorSyncState({
        isOpen,
        noteId,
        isDirty: isFormDirtyRef.current,
      });
    },
    [isOpen, noteId],
  );

  useEffect(
    function registerRealtimeDrawerSync() {
      // Re-evaluate cache-dependent save gates before optionally pulling remote fields.
      function handleRealtimeChange({
        note: changedNote,
      }: RealtimeNoteChangePayload) {
        reevaluateFromCache();

        if (!changedNote || !noteId || changedNote.id !== noteId) {
          return;
        }

        const remoteRevision = changedNote.revision;
        const confirmedRevision =
          getConfirmedRevisionRef.current?.() ?? null;

        if (
          !isRemoteNewerThanConfirmed(remoteRevision, confirmedRevision)
        ) {
          return;
        }

        if (shouldSyncRemoteIntoForm(changedNote.id)) {
          pullRemoteIntoForm(remoteRevision);
          return;
        }

        /////////////////////////////////
        // Dirty form: never overwrite fields; surface pending + banner instead.
        if (isFormDirtyRef.current) {
          setPendingRemoteRevision(remoteRevision);
          pendingRemoteRevisionRef.current = remoteRevision;
          // A newer remote after Keep editing should re-show the banner.
          setIsRemoteBannerDismissed(false);
        }
      }

      registerNoteDrawerRealtimeHandler(handleRealtimeChange);

      return function unregisterRealtimeDrawerSync() {
        registerNoteDrawerRealtimeHandler(null);
      };
    },
    [noteId, pullRemoteIntoForm, reevaluateFromCache],
  );

  return {
    handleChangeWithDirty,
    pendingRemoteRevision,
    showRemoteUpdateBanner:
      pendingRemoteRevision != null && !isRemoteBannerDismissed,
    reloadRemoteForm,
    dismissRemoteBanner,
  };
}
