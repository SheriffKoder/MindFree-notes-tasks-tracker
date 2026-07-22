/**
 * @file entities/note/lib/is-optimistic-note-id.ts
 * Detects client-temp note ids that are not server UUIDs.
 */

/**
 * Whether `noteId` is a cache-only optimistic placeholder (not a Postgres uuid).
 *
 * Optimistic creates use ids like `optimistic-calendar-YYYY-MM-DD`,
 * `optimistic-general`, and `optimistic-quick`. Autosave must treat these as
 * unpersisted and POST create — never PATCH/DELETE by id.
 */
export function isOptimisticNoteId(noteId: string): boolean {
  return noteId.startsWith("optimistic-");
}
