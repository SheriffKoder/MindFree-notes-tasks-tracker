/**
 * @file entities/note/repository/index.ts
 * Public surface for the Note repository (Supabase data access, RLS-scoped).
 *
 * One responsibility per file; import from this barrel.
 *
 * Function index:
 * - getAuthenticatedUserId  (get-authenticated-user-id)
 * - getCalendarNotesForMonth (get-calendar-notes)
 * - getGeneralNotes         (get-general-notes)
 * - getAllNotes             (get-all-notes)
 * - getQuickNote            (get-quick-note)
 * - getStarredNotes         (get-starred-notes)
 * - createCalendarNote      (create-calendar-note)
 * - createGeneralNote, createQuickNote (create-general-note)
 * - updateNoteById, findCalendarNoteByDate, replaceNoteOnDate (update-note)
 * - deleteNoteById          (delete-note)
 */

export { getAuthenticatedUserId } from "@/entities/note/repository/get-authenticated-user-id";
export { getCalendarNotesForMonth } from "@/entities/note/repository/get-calendar-notes";
export { getGeneralNotes } from "@/entities/note/repository/get-general-notes";
export { getAllNotes } from "@/entities/note/repository/get-all-notes";
export { getQuickNote } from "@/entities/note/repository/get-quick-note";
export { getStarredNotes } from "@/entities/note/repository/get-starred-notes";
export { createCalendarNote } from "@/entities/note/repository/create-calendar-note";
export {
  createGeneralNote,
  createQuickNote,
} from "@/entities/note/repository/create-general-note";
export {
  findCalendarNoteByDate,
  replaceNoteOnDate,
  updateNoteById,
} from "@/entities/note/repository/update-note";
export { deleteNoteById } from "@/entities/note/repository/delete-note";
