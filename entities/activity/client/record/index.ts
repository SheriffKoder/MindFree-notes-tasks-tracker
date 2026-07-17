/**
 * @file entities/activity/client/record/index.ts
 * Public surface for activity-record client write fetchers.
 *
 * Re-exported by `entities/activity/client.ts` (public path unchanged).
 *
 * Function index:
 * - fetchUpsertActivityRecord, fetchDeleteActivityRecord (activity-records-mutation)
 */

export {
  fetchDeleteActivityRecord,
  fetchUpsertActivityRecord,
} from "@/entities/activity/client/record/activity-records-mutation";
export type { DeleteActivityRecordBody } from "@/entities/activity/client/record/activity-records-mutation";
