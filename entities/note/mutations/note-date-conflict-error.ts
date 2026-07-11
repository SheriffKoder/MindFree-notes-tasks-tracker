/**
 * @file entities/note/mutations/note-date-conflict-error.ts
 * Typed error when a calendar day already has another note.
 *
 * Purpose: Signal one-note-per-day conflicts from server use-cases to API routes.
 * Used in: entities/note/mutations/update-note.ts, create-calendar-note.ts;
 *          app/api/notes/[id]/route.ts, app/api/notes/calendar/route.ts
 * Used for: Returning 409 with `conflictingNoteId` when replace is not confirmed.
 *
 * Exports:
 * - NoteDateConflictError: domain error with `date` and `conflictingNoteId`
 */

export class NoteDateConflictError extends Error {
  readonly date: string;
  readonly conflictingNoteId: string;

  constructor(date: string, conflictingNoteId: string) {
    super("A note already exists on this date.");
    this.name = "NoteDateConflictError";
    this.date = date;
    this.conflictingNoteId = conflictingNoteId;
  }
}
