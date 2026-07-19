/**
 * @file entities/activity/editor/index.ts
 * Activity config form — types, hook, and UI.
 *
 * Function index:
 * - useActivityForm (model/use-activity-form)
 * - ActivityForm (activity-form)
 * - ActivityFormLastSaved (activity-form-last-saved)
 * - ScheduleInput (schedule-input)
 * - defaultScheduleConfig (lib/default-schedule-config)
 * - formatActivityLastEditedAt (lib/format-last-edited)
 */

export { ActivityForm } from "@/entities/activity/editor/activity-form";
export { ActivityFormLastSaved } from "@/entities/activity/editor/activity-form-last-saved";
export { defaultScheduleConfig } from "@/entities/activity/editor/lib/default-schedule-config";
export { formatActivityLastEditedAt } from "@/entities/activity/editor/lib/format-last-edited";
export type {
  ActivityFormChangeMeta,
  ActivityFormFieldErrors,
  ActivityFormFooterMeta,
  ActivityFormProps,
  ActivityFormValues,
  ActivitySaveStatus,
  UseActivityFormOptions,
  UseActivityFormResult,
} from "@/entities/activity/editor/model/types";
export { useActivityForm } from "@/entities/activity/editor/model/use-activity-form";
export { ScheduleInput } from "@/entities/activity/editor/schedule-input";
