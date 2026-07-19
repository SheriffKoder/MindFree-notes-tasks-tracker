/**
 * @file entities/note/hooks/note-mutation-pending.ts
 * Tracks in-flight note mutation ids so realtime can skip echo events.
 */

const pendingNoteIds = new Set<string>();

/**
 * Marks a note id as having an in-flight TanStack mutation.
 */
export function markNoteMutationPending(noteId: string): void {
  pendingNoteIds.add(noteId);
}

/**
 * Clears the pending flag after a mutation settles.
 */
export function clearNoteMutationPending(noteId: string): void {
  pendingNoteIds.delete(noteId);
}

/**
 * @returns whether a mutation is currently in flight for the note id.
 */
export function isNoteMutationPending(noteId: string): boolean {
  return pendingNoteIds.has(noteId);
}
