/**
 * @file entities/note/cache/index.ts
 * Segment barrel for pure Note TanStack cache helpers + sync hub.
 *
 * Function index:
 * - findNoteByIdInCache, findNoteOnDateInCache (find-note-in-cache)
 * - buildOptimistic*, upsert*, remove*, relocate*, home helpers (note-cache-mutations)
 * - mergeFormValuesIntoNote, patch*Cache, resolveOwningQueryKey (patch-note-in-cache)
 * - synchronizeNoteCaches, upsertNoteInOwnerCaches, NoteChange (synchronize-note-caches)
 * - applyRealtimeNoteChange, isRemoteNoteNewer (apply-realtime-note-change)
 */

export {
  findNoteByIdInCache,
  findNoteOnDateInCache,
} from "@/entities/note/cache/find-note-in-cache";
export {
  HOME_STARRED_CACHE_LIMIT,
  applyHomeNoteCreate,
  applyHomeNoteDelete,
  applyHomeNoteUpdate,
  buildOptimisticCalendarNote,
  buildOptimisticGeneralNote,
  buildOptimisticQuickNote,
  patchHomeNotesCache,
  relocateNoteInCache,
  removeCalendarNoteFromCache,
  removeGeneralNoteFromCache,
  removeHomeNoteFromCacheQuery,
  upsertCalendarNoteInCache,
  upsertGeneralNoteInCache,
  upsertHomeNoteInCache,
} from "@/entities/note/cache/note-cache-mutations";
export {
  mergeFormValuesIntoNote,
  patchCalendarNotesCache,
  patchGeneralNotesCache,
  resolveOwningQueryKey,
} from "@/entities/note/cache/patch-note-in-cache";
export {
  synchronizeNoteCaches,
  upsertNoteInOwnerCaches,
  type NoteChange,
} from "@/entities/note/cache/synchronize-note-caches";
export {
  applyRealtimeNoteChange,
  isRemoteNoteNewer,
  type ApplyRealtimeNoteChangeResult,
  type RealtimeNoteChangeEvent,
} from "@/entities/note/cache/apply-realtime-note-change";
