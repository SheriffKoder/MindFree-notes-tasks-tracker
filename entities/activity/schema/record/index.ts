/**
 * @file entities/activity/schema/record/index.ts
 * Public surface for activity-record write contracts (Zod).
 *
 * Records are the write side of the Activity entity; their schemas live under
 * `schema/record/` to stay separate from the definition schemas at the layer
 * root. Import record contracts from this barrel.
 *
 * Export index:
 * - upsertActivityRecordBodySchema, UpsertActivityRecordBody,
 *   upsertActivityRecordResponseSchema, UpsertActivityRecordResponse
 *   (upsert-activity-record.schema)
 */

export {
  upsertActivityRecordBodySchema,
  upsertActivityRecordResponseSchema,
} from "@/entities/activity/schema/record/upsert-activity-record.schema";
export type {
  UpsertActivityRecordBody,
  UpsertActivityRecordResponse,
} from "@/entities/activity/schema/record/upsert-activity-record.schema";
