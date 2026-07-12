/**
 * @file features/notes/note-drawer/model/note-editor-sync-guard.ts
 * Drawer editor state for realtime → form sync decisions.
 *
 * Purpose: Block remote form pulls while dirty; allow server wins after idle.
 * Used in: note-drawer.tsx, use-notes-realtime-sync.ts (via shouldSyncRemoteIntoForm)
 */

/** Ms without local edits before an idle open drawer accepts remote form sync. */
export const REMOTE_SYNC_IDLE_MS = 3000;

export interface NoteEditorSyncState {
  isOpen: boolean;
  noteId: string | null;
  isDirty: boolean;
  openedAt: number;
  lastLocalEditAt: number | null;
}

let editorSyncState: NoteEditorSyncState = {
  isOpen: false,
  noteId: null,
  isDirty: false,
  openedAt: 0,
  lastLocalEditAt: null,
};

/**
 * Updates the singleton drawer sync guard (one drawer per app session).
 */
export function registerNoteEditorSyncState(state: NoteEditorSyncState): void {
  editorSyncState = state;
}

/**
 * @returns whether a remote update may replace the open editor fields.
 */
export function shouldSyncRemoteIntoForm(noteId: string): boolean {
  if (!editorSyncState.isOpen || editorSyncState.noteId !== noteId) {
    return false;
  }

  if (editorSyncState.isDirty) {
    return false;
  }

  const idleAnchor =
    editorSyncState.lastLocalEditAt ?? editorSyncState.openedAt;

  return Date.now() - idleAnchor >= REMOTE_SYNC_IDLE_MS;
}
