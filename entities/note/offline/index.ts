/**
 * @file entities/note/offline/index.ts
 * Segment barrel for note offline queue adapters and flush → NoteChange mapping.
 *
 * Function index:
 * - createNotesOfflineSyncAdapter, saveNoteOfflinePending, applyNoteOfflinePending
 * - buildNoteOfflineKey, toNoteOfflineWrite, NOTE_OFFLINE_* (notes-offline-storage)
 * - noteChangeFromOfflineFlush (note-change-from-offline)
 */

export {
  NOTE_OFFLINE_ENTITY,
  NOTE_OFFLINE_QUICK_KEY,
  applyNoteOfflinePending,
  buildNoteOfflineKey,
  createNotesOfflineSyncAdapter,
  saveNoteOfflinePending,
  toNoteOfflineWrite,
  type NoteOfflineOperation,
  type NoteOfflinePayload,
  type NoteOfflinePendingInput,
} from "@/entities/note/offline/notes-offline-storage";
export { noteChangeFromOfflineFlush } from "@/entities/note/offline/note-change-from-offline";
