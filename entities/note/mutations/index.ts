/**
 * @file entities/note/mutations/index.ts
 * Segment barrel for note server write use-cases.
 *
 * Function index:
 * - createCalendarNote (create-calendar-note)
 * - createGeneralNote  (create-general-note)
 * - createQuickNote    (create-quick-note)
 * - updateNote         (update-note)
 * - deleteNote         (delete-note)
 */

export { createCalendarNote } from "@/entities/note/mutations/create-calendar-note";
export { createGeneralNote } from "@/entities/note/mutations/create-general-note";
export { createQuickNote } from "@/entities/note/mutations/create-quick-note";
export { updateNote } from "@/entities/note/mutations/update-note";
export { deleteNote } from "@/entities/note/mutations/delete-note";
