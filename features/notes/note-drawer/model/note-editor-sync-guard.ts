/**
 * @file features/notes/note-drawer/model/note-editor-sync-guard.ts
 * Drawer editor state for realtime → form sync decisions.
 *
 * Purpose: Allow remote form pulls only when the open drawer is clean.
 * Used in: use-note-drawer-realtime-sync.ts (via shouldSyncRemoteIntoForm)
 *
 * Steps:
 * 1. Store the mounted drawer's open/note/dirty snapshot in a singleton.
 * 2. Answer whether a remote note id may replace open form fields (dirty-only).
 */

export interface NoteEditorSyncState {
  isOpen: boolean;
  noteId: string | null;
  isDirty: boolean;
}

let editorSyncState: NoteEditorSyncState = {
  isOpen: false,
  noteId: null,
  isDirty: false,
};

/**
 * Updates the singleton drawer sync guard (one drawer per app session).
 * Call synchronously on local edits so realtime cannot race a stale clean flag.
 */
export function registerNoteEditorSyncState(state: NoteEditorSyncState): void {
  editorSyncState = state;
}

/**
 * @returns whether a remote update may replace the open editor fields.
 * Clean open drawers always sync; dirty drawers never overwrite local typing.
 */
export function shouldSyncRemoteIntoForm(noteId: string): boolean {
  if (!editorSyncState.isOpen || editorSyncState.noteId !== noteId) {
    return false;
  }

  return !editorSyncState.isDirty;
}
