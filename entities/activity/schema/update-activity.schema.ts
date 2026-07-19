/**
 * @file entities/activity/schema/update-activity.schema.ts
 * Zod contract for PATCH /api/activities/:id (edit / archive / restore).
 *
 * Purpose: Validate partial edits from the config drawer's autosave, plus
 *          archive/restore via `archivedAt`.
 * Used in: entities/activity/mutations/update-activity.ts,
 *          entities/activity/mutations/archive-activity.ts,
 *          app/api/activities/[id]/route.ts
 *
 * Exports:
 * - updateActivityBodySchema / UpdateActivityBody
 * - updateActivityResponseSchema / UpdateActivityResponse
 */

import { z } from "zod";

import type { Activity } from "@/entities/activity/model/types";
import {
  activityFormObject,
  addScheduleConfigIssues,
  addWindowIssues,
} from "@/entities/activity/schema/activity-form.schema";

/**
 * Partial PATCH body — any subset of editable fields plus archive intent.
 * `scheduleType` and `scheduleConfig` must be updated together.
 */
export const updateActivityBodySchema = activityFormObject
  .partial()
  .extend({ archivedAt: z.string().nullable().optional() })
  .superRefine((value, ctx) => {
    const hasType = value.scheduleType !== undefined;
    const hasConfig = value.scheduleConfig !== undefined;

    if (hasType !== hasConfig) {
      ctx.addIssue({
        code: "custom",
        path: [hasType ? "scheduleConfig" : "scheduleType"],
        message: "Schedule type and config must be updated together.",
      });
    } else if (hasType && hasConfig) {
      addScheduleConfigIssues(value.scheduleType!, value.scheduleConfig!, ctx);
    }

    addWindowIssues(value.startsAt ?? null, value.endsAt ?? null, ctx);
  });

export type UpdateActivityBody = z.infer<typeof updateActivityBodySchema>;

/** Successful PATCH response shape. */
export const updateActivityResponseSchema = z.object({
  activity: z.custom<Activity>(),
});

export type UpdateActivityResponse = z.infer<typeof updateActivityResponseSchema>;
