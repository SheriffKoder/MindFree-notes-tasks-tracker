/**
 * @file entities/activity/schema/activity-form.schema.ts
 * Base Zod contracts for activity definitions.
 *
 * Purpose: Shared editable fields + enum/config validators reused by the
 *          create and update body schemas.
 * Used in: entities/activity/schema/create-activity.schema.ts,
 *          entities/activity/schema/update-activity.schema.ts
 * Used for: Validating drawer form fields, schedule config shape per type, and
 *           the validity window.
 *
 * Exports:
 * - activityKindSchema, trackingModeSchema, scheduleTypeSchema, scheduleConfigSchema
 * - goalPeriodSchema, activityPrioritySchema
 * - activityFormObject (raw ZodObject; compose with .extend / .partial)
 * - addScheduleConfigIssues, addWindowIssues (superRefine helpers)
 */

import { z } from "zod";

import { WEEKDAYS } from "@/entities/activity/model/types";
import type { ScheduleConfig, ScheduleType } from "@/entities/activity/model/types";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAY_OF_MONTH_PATTERN = /^(0[1-9]|[12]\d|3[01])$/;
const DAY_MONTH_PATTERN = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])$/;

/** Task or reminder. */
export const activityKindSchema = z.enum(["task", "reminder"]);

/** How completion is recorded. */
export const trackingModeSchema = z.enum([
  "boolean",
  "count",
  "duration",
  "count+duration",
]);

/** Optional Progress period unit (`null` = due-day goals only). */
export const goalPeriodSchema = z.enum(["week", "month"]);

/** Optional task priority (`null` = unset). */
export const activityPrioritySchema = z.enum(["low", "medium", "high"]);

/** Recurrence pattern. */
export const scheduleTypeSchema = z.enum([
  "once",
  "daily",
  "weekly",
  "monthly",
  "yearly",
]);

/** Raw config union; shape-per-type is enforced by {@link addScheduleConfigIssues}. */
export const scheduleConfigSchema = z.union([
  z.null(),
  z.string(),
  z.array(z.string()),
]);

/**
 * Editable definition fields shared by create and update. Kept as a raw object
 * so callers can `.extend()` (create adds `kind`) or `.partial()` (update).
 */
export const activityFormObject = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(200, "Title must be 200 characters or fewer."),
  description: z
    .string()
    .max(2000, "Description must be 2,000 characters or fewer.")
    .nullable()
    .optional(),
  color: z
    .string()
    .max(32, "Color must be 32 characters or fewer.")
    .nullable()
    .optional(),
  trackingMode: trackingModeSchema,
  scheduleType: scheduleTypeSchema,
  scheduleConfig: scheduleConfigSchema,
  goal: z.number().int().positive().nullable().optional(),
  goalDuration: z.number().int().positive().nullable().optional(),
  goalPeriod: goalPeriodSchema.nullable().optional(),
  periodGoal: z.number().int().positive().nullable().optional(),
  periodGoalDuration: z.number().int().positive().nullable().optional(),
  priority: activityPrioritySchema.nullable().optional(),
  startsAt: z
    .string()
    .regex(ISO_DATE_PATTERN, "Start date must be YYYY-MM-DD.")
    .nullable()
    .optional(),
  endsAt: z
    .string()
    .regex(ISO_DATE_PATTERN, "End date must be YYYY-MM-DD.")
    .nullable()
    .optional(),
});

function isStringArray(value: ScheduleConfig): value is string[] {
  return Array.isArray(value);
}

/**
 * Adds issues when `scheduleConfig` does not match the shape required by
 * `scheduleType` (afterthoughts §7).
 */
export function addScheduleConfigIssues(
  scheduleType: ScheduleType,
  scheduleConfig: ScheduleConfig,
  ctx: z.RefinementCtx,
): void {
  const path = ["scheduleConfig"] as const;

  switch (scheduleType) {
    case "once": {
      if (typeof scheduleConfig !== "string" || !ISO_DATE_PATTERN.test(scheduleConfig)) {
        ctx.addIssue({
          code: "custom",
          path: [...path],
          message: 'A one-time schedule needs a single "YYYY-MM-DD" date.',
        });
      }
      return;
    }
    case "daily": {
      if (scheduleConfig !== null) {
        ctx.addIssue({
          code: "custom",
          path: [...path],
          message: "A daily schedule must have a null config.",
        });
      }
      return;
    }
    case "weekly": {
      const valid =
        isStringArray(scheduleConfig) &&
        scheduleConfig.length > 0 &&
        scheduleConfig.every((day) =>
          (WEEKDAYS as readonly string[]).includes(day),
        );
      if (!valid) {
        ctx.addIssue({
          code: "custom",
          path: [...path],
          message: 'A weekly schedule needs weekday codes like ["mon", "tue"].',
        });
      }
      return;
    }
    case "monthly": {
      const valid =
        isStringArray(scheduleConfig) &&
        scheduleConfig.length > 0 &&
        scheduleConfig.every((day) => DAY_OF_MONTH_PATTERN.test(day));
      if (!valid) {
        ctx.addIssue({
          code: "custom",
          path: [...path],
          message: 'A monthly schedule needs day-of-month values like ["01", "15"].',
        });
      }
      return;
    }
    case "yearly": {
      const valid =
        isStringArray(scheduleConfig) &&
        scheduleConfig.length > 0 &&
        scheduleConfig.every((day) => DAY_MONTH_PATTERN.test(day));
      if (!valid) {
        ctx.addIssue({
          code: "custom",
          path: [...path],
          message: 'A yearly schedule needs "DD/MM" values like ["25/01"].',
        });
      }
      return;
    }
  }
}

/**
 * Adds an issue when the validity window is inverted (`endsAt` before `startsAt`).
 * ISO `YYYY-MM-DD` strings compare correctly lexicographically.
 */
export function addWindowIssues(
  startsAt: string | null,
  endsAt: string | null,
  ctx: z.RefinementCtx,
): void {
  if (startsAt && endsAt && startsAt > endsAt) {
    ctx.addIssue({
      code: "custom",
      path: ["endsAt"],
      message: "End date must be on or after the start date.",
    });
  }
}
