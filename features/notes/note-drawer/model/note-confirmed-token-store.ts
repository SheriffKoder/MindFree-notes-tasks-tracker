/**
 * @file features/notes/note-drawer/model/note-confirmed-token-store.ts
 * Per-note server-confirmed `revision` tokens for drawer concurrency.
 *
 * Purpose: Seed and compare against values that came from the server — never
 * invented by optimistic cache merges (`mergeFormValuesIntoNote` does not bump
 * revision).
 * Used in: use-pre-save-orchestrator.ts
 *
 * Updated on: PATCH success, 409 body, remote form accept, create success.
 */

const confirmedRevisionsByNoteId = new Map<string, number>();

/**
 * Records a server-confirmed concurrency revision for a note id.
 */
export function setNoteConfirmedToken(
  noteId: string,
  revision: number,
): void {
  confirmedRevisionsByNoteId.set(noteId, revision);
}

/**
 * @returns the last server-confirmed revision for the note, if known this session.
 */
export function getNoteConfirmedToken(noteId: string): number | null {
  return confirmedRevisionsByNoteId.get(noteId) ?? null;
}

/**
 * Clears a stored token when the note context is torn down.
 */
export function clearNoteConfirmedToken(noteId: string): void {
  confirmedRevisionsByNoteId.delete(noteId);
}
