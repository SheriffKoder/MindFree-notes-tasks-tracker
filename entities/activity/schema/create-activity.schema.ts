/**
 * @file entities/activity/schema/create-activity.schema.ts
 * Zod contract for POST /api/activities (create a definition).
 *
 * Purpose: Validate create bodies; `kind` is supplied by the calling page
 *          (Tasks → task, Reminders → reminder), never chosen in the drawer.
 * Used in: entities/activity/mutations/create-activity.ts,
 *          app/api/activities/route.ts
 *
 * Exports:
 * - createActivityBodySchema / CreateActivityBody
 * - createActivityResponseSchema / CreateActivityResponse
 */

import { z } from "zod";

import type { Activity } from "@/entities/activity/model/types";
import {
  activityFormObject,
  activityKindSchema,
  addScheduleConfigIssues,
  addWindowIssues,
} from "@/entities/activity/schema/activity-form.schema";

/**
 * Full create body: editable fields + the page-provided `kind`.
 */
export const createActivityBodySchema = activityFormObject
  .extend({ kind: activityKindSchema })
  .superRefine((value, ctx) => {
    addScheduleConfigIssues(value.scheduleType, value.scheduleConfig, ctx);
    addWindowIssues(value.startsAt ?? null, value.endsAt ?? null, ctx);
  });

export type CreateActivityBody = z.infer<typeof createActivityBodySchema>;

/** Successful create response shape. */
export const createActivityResponseSchema = z.object({
  activity: z.custom<Activity>(),
});

export type CreateActivityResponse = z.infer<typeof createActivityResponseSchema>;
