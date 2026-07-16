/**
 * @file entities/activity/editor/index.ts
 * Activity config form — types, hook, and UI.
 *
 * Function index:
 * - useActivityForm (model/use-activity-form)
 * - ActivityForm (activity-form)
 * - ScheduleInput (schedule-input)
 * - defaultScheduleConfig (lib/default-schedule-config)
 */

export { ActivityForm } from "@/entities/activity/editor/activity-form";
export { defaultScheduleConfig } from "@/entities/activity/editor/lib/default-schedule-config";
export type {
  ActivityFormChangeMeta,
  ActivityFormFieldErrors,
  ActivityFormProps,
  ActivityFormValues,
  UseActivityFormOptions,
  UseActivityFormResult,
} from "@/entities/activity/editor/model/types";
export { useActivityForm } from "@/entities/activity/editor/model/use-activity-form";
export { ScheduleInput } from "@/entities/activity/editor/schedule-input";
