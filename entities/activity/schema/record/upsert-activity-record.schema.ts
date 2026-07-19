/**
 * @file entities/activity/schema/record/upsert-activity-record.schema.ts
 * Zod contract for POST /api/activity-records (upsert today's record).
 *
 * Purpose: Validate a record write body keyed by `(taskId, date)`. Values are
 *          absolute (the recorded total for the day), never deltas, and never
 *          negative. There is no completion flag — completion is derived.
 * Used in: entities/activity/mutations/record/upsert-activity-record.ts,
 *          app/api/activity-records/route.ts
 *
 * Exports:
 * - upsertActivityRecordBodySchema / UpsertActivityRecordBody
 * - upsertActivityRecordResponseSchema / UpsertActivityRecordResponse
 */

import { z } from "zod";

import type { ActivityRecord } from "@/entities/activity/model/types";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Absolute record write body. `count`/`duration` are the day's totals, not
 * increments; `(taskId, date)` is the natural key the repository upserts on.
 *
 * Tracking-mode and goal snapshots are **not** part of this contract —
 * PostgreSQL derives and preserves them from the owning task on first insert.
 */
export const upsertActivityRecordBodySchema = z.object({
  taskId: z.string().uuid(),
  date: z.string().regex(ISO_DATE_PATTERN, "Date must be YYYY-MM-DD."),
  count: z.number().int().nonnegative(),
  duration: z.number().int().nonnegative(),
  description: z.string().nullable().optional(),
});

export type UpsertActivityRecordBody = z.infer<
  typeof upsertActivityRecordBodySchema
>;

/** Successful upsert response shape. */
export const upsertActivityRecordResponseSchema = z.object({
  record: z.custom<ActivityRecord>(),
});

export type UpsertActivityRecordResponse = z.infer<
  typeof upsertActivityRecordResponseSchema
>;
