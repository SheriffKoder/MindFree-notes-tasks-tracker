/**
 * @file entities/note/transform/index.ts
 * Public surface for note pure data transforms.
 *
 * Function index:
 * - mapNoteRow (map-note-row)
 * - aggregateMonthNotes, buildCalendarNotesResponse (aggregate-month-notes)
 */

export { mapNoteRow } from "@/entities/note/transform/map-note-row";
export {
  aggregateMonthNotes,
  buildCalendarNotesResponse,
} from "@/entities/note/transform/aggregate-month-notes";
