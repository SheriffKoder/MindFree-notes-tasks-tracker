/**
 * @file entities/note/server.ts
 * Server-side note barrel — queries, hydration, and mutation use-cases.
 *
 * Purpose: Single import surface for server-only note operations.
 * Used in: app/api/notes/*, Server Components, route handlers, server actions
 * Used for: SSR hydration, reads, and write use-cases (including date conflict errors).
 *
 * Mutation exports (Step 11):
 * - updateNote, createCalendarNote, createGeneralNote, deleteNote
 * - NoteDateConflictError
 */

export {
  getCalendarNotesResponse,
} from "@/entities/note/queries/get-calendar-notes-response";
export {
  getGeneralNotesResponse,
} from "@/entities/note/queries/get-general-notes-response";
export {
  getNotesPageInitialData,
  type NotesPageInitialData,
} from "@/entities/note/queries/get-notes-page-initial-data";
export { hydrateNotesPageQueries } from "@/entities/note/tanstack/hydrate-notes-page-queries";
export { updateNote } from "@/entities/note/mutations/update-note";
export { createCalendarNote } from "@/entities/note/mutations/create-calendar-note";
export { createGeneralNote } from "@/entities/note/mutations/create-general-note";
export { deleteNote } from "@/entities/note/mutations/delete-note";
export { NoteDateConflictError } from "@/entities/note/mutations/note-date-conflict-error";
