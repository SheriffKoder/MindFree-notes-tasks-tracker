/**
 * @file entities/note/server.ts
 * Server-side note read exports — repository-backed queries and SSR hydration.
 *
 * Import from here in Server Components, route handlers, and server actions.
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
