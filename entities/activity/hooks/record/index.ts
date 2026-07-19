/**
 * @file entities/activity/hooks/record/index.ts
 * Public surface for activity-record TanStack write hooks + in-flight tracker.
 *
 * Records are the write side of the Activity entity; their hooks live under
 * `hooks/record/` beside the definition mutations. Re-exported by
 * `hooks/index.ts`.
 *
 * Function index:
 * - useUpsertActivityRecordMutation (use-upsert-activity-record-mutation)
 * - useDeleteActivityRecordMutation (use-delete-activity-record-mutation)
 * - mark/clear/is RecordMutationPending (record-mutation-pending)
 */

export { useUpsertActivityRecordMutation } from "@/entities/activity/hooks/record/use-upsert-activity-record-mutation";
export { useDeleteActivityRecordMutation } from "@/entities/activity/hooks/record/use-delete-activity-record-mutation";
export {
  clearRecordMutationPending,
  isRecordMutationPending,
  markRecordMutationPending,
} from "@/entities/activity/hooks/record/record-mutation-pending";
export type { UpsertActivityRecordMutationInput } from "@/entities/activity/hooks/record/use-upsert-activity-record-mutation";
export type { DeleteActivityRecordMutationInput } from "@/entities/activity/hooks/record/use-delete-activity-record-mutation";
