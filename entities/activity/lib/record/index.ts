// Function index:
// - isMeaningfulRecord (is-meaningful-record)
// - isRemoteRecordNewer (is-remote-record-newer)
// - buildRecordLookup, recordKey (build-record-lookup)
// - deriveTodayProgress (derive-today-progress)
// - resolveRecordConfiguration (resolve-record-configuration)
export { isMeaningfulRecord } from "@/entities/activity/lib/record/is-meaningful-record";
export { isRemoteRecordNewer } from "@/entities/activity/lib/record/is-remote-record-newer";
export {
  buildRecordLookup,
  recordKey,
} from "@/entities/activity/lib/record/build-record-lookup";
export type { RecordLookup } from "@/entities/activity/lib/record/build-record-lookup";
export { deriveTodayProgress } from "@/entities/activity/lib/record/derive-today-progress";
export { resolveRecordConfiguration } from "@/entities/activity/lib/record/resolve-record-configuration";
export type { RecordConfiguration } from "@/entities/activity/lib/record/resolve-record-configuration";
