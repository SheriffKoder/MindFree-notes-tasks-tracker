/**
 * @file entities/note/queries/index.ts
 * Segment barrel for note server read use-cases.
 *
 * Function index:
 * - getCalendarNotesResponse (get-calendar-notes-response)
 * - getGeneralNotesResponse  (get-general-notes-response)
 * - getHomeNotesResponse     (get-home-notes-response)
 * - getNotesPageInitialData, NotesPageInitialData (get-notes-page-initial-data)
 */

export { getCalendarNotesResponse } from "@/entities/note/queries/get-calendar-notes-response";
export { getGeneralNotesResponse } from "@/entities/note/queries/get-general-notes-response";
export { getHomeNotesResponse } from "@/entities/note/queries/get-home-notes-response";
export {
  getNotesPageInitialData,
  type NotesPageInitialData,
} from "@/entities/note/queries/get-notes-page-initial-data";
