/**
 * @file entities/activity/hooks/index.ts
 * Segment barrel for activity TanStack read hooks + write mutations.
 *
 * Function index:
 * - useActivitiesQuery (use-activities-query)
 * - useActivityRecordsQuery (use-activity-records-query)
 * - useCreateActivityMutation (use-create-activity-mutation)
 * - useUpdateActivityMutation (use-update-activity-mutation)
 * - useArchiveActivityMutation, useRestoreActivityMutation (use-archive-activity-mutation)
 * - useDeleteActivityMutation (use-delete-activity-mutation)
 * - mark/clear/is ActivityMutationPending (activity-mutation-pending)
 */

export {
  clearActivityMutationPending,
  isActivityMutationPending,
  markActivityMutationPending,
} from "@/entities/activity/hooks/activity-mutation-pending";
export { useActivitiesQuery } from "@/entities/activity/hooks/use-activities-query";
export { useActivityRecordsQuery } from "@/entities/activity/hooks/use-activity-records-query";
export { useCreateActivityMutation } from "@/entities/activity/hooks/use-create-activity-mutation";
export { useUpdateActivityMutation } from "@/entities/activity/hooks/use-update-activity-mutation";
export {
  useArchiveActivityMutation,
  useRestoreActivityMutation,
} from "@/entities/activity/hooks/use-archive-activity-mutation";
export { useDeleteActivityMutation } from "@/entities/activity/hooks/use-delete-activity-mutation";
