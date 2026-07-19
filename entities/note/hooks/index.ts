/**
 * @file entities/note/hooks/index.ts
 * Segment barrel for note React read hooks, write mutations, and realtime sync.
 *
 * Function index:
 * - useCalendarNotesQuery (use-calendar-notes-query)
 * - useGeneralNotesQuery  (use-general-notes-query)
 * - useHomeNotesQuery     (use-home-notes-query)
 * - useCreateCalendarNoteMutation (use-create-calendar-note-mutation)
 * - useCreateGeneralNoteMutation  (use-create-general-note-mutation)
 * - useCreateQuickNoteMutation    (use-create-quick-note-mutation)
 * - useUpdateNoteMutation         (use-update-note-mutation)
 * - useDeleteNoteMutation         (use-delete-note-mutation)
 * - useNotesRealtimeSync          (use-notes-realtime-sync)
 * - mark/clear/is NoteMutationPending (note-mutation-pending)
 */

export { useCalendarNotesQuery } from "@/entities/note/hooks/use-calendar-notes-query";
export { useGeneralNotesQuery } from "@/entities/note/hooks/use-general-notes-query";
export { useHomeNotesQuery } from "@/entities/note/hooks/use-home-notes-query";
export { useCreateCalendarNoteMutation } from "@/entities/note/hooks/use-create-calendar-note-mutation";
export type { CreateCalendarNoteMutationInput } from "@/entities/note/hooks/use-create-calendar-note-mutation";
export { useCreateGeneralNoteMutation } from "@/entities/note/hooks/use-create-general-note-mutation";
export type { CreateGeneralNoteMutationInput } from "@/entities/note/hooks/use-create-general-note-mutation";
export { useCreateQuickNoteMutation } from "@/entities/note/hooks/use-create-quick-note-mutation";
export type { CreateQuickNoteMutationInput } from "@/entities/note/hooks/use-create-quick-note-mutation";
export { useUpdateNoteMutation } from "@/entities/note/hooks/use-update-note-mutation";
export type { UpdateNoteMutationInput } from "@/entities/note/hooks/use-update-note-mutation";
export { useDeleteNoteMutation } from "@/entities/note/hooks/use-delete-note-mutation";
export type { DeleteNoteMutationInput } from "@/entities/note/hooks/use-delete-note-mutation";
export { useNotesRealtimeSync } from "@/entities/note/hooks/use-notes-realtime-sync";
export type {
  RealtimeNoteChangePayload,
  UseNotesRealtimeSyncOptions,
} from "@/entities/note/hooks/use-notes-realtime-sync";
export {
  clearNoteMutationPending,
  isNoteMutationPending,
  markNoteMutationPending,
} from "@/entities/note/hooks/note-mutation-pending";
