/**
 * @file entities/note/server.ts
 * Server-side note barrel — queries, hydration, and mutation use-cases.
 *
 * Purpose: Single import surface for server-only note operations.
 * Used in: app/api/notes/*, Server Components, route handlers, server actions
 * Used for: SSR hydration, reads, and write use-cases (including date conflict errors).
 *
 * Segment sources (Step 10):
 * - `@/entities/note/queries` — read use-cases
 * - `@/entities/note/mutations` — write use-cases
 * - `@/entities/note/hydration` — SSR cache seeders
 * - `@/entities/note/errors` — NoteDateConflictError
 * - `@/entities/note/repository` — getAuthenticatedUserId
 */

export {
  getCalendarNotesResponse,
  getGeneralNotesResponse,
  getHomeNotesResponse,
  getNotesPageInitialData,
  type NotesPageInitialData,
} from "@/entities/note/queries";
export {
  seedHomeNotesCache,
  seedNotesPageCache,
} from "@/entities/note/hydration";
export {
  createCalendarNote,
  createGeneralNote,
  createQuickNote,
  deleteNote,
  updateNote,
} from "@/entities/note/mutations";
export { NoteDateConflictError } from "@/entities/note/errors";
export { getAuthenticatedUserId } from "@/entities/note/repository";
