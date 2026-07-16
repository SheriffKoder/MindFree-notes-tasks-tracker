/**
 * @file entities/activity/editor/activity-form.tsx
 * Plain activity config form — composes field rows; no save routing.
 *
 * Purpose: Dumb editor shell; drawer orchestrator owns create/update.
 * Used in: features/activity/activity-drawer (Step 11+)
 * Used for: Controlled definition fields + scheduleConfig emission.
 */

"use client";

import { cn } from "@/lib/utils";
import { ActivityFormColorRow } from "@/entities/activity/editor/fields/activity-form-color-row";
import { ActivityFormGoalRow } from "@/entities/activity/editor/fields/activity-form-goal-row";
import { ActivityFormScheduleRow } from "@/entities/activity/editor/fields/activity-form-schedule-row";
import { ActivityFormTitleRow } from "@/entities/activity/editor/fields/activity-form-title-row";
import { ActivityFormTrackingModeRow } from "@/entities/activity/editor/fields/activity-form-tracking-mode-row";
import { ActivityFormWindowRow } from "@/entities/activity/editor/fields/activity-form-window-row";
import { ActivityFormStatusBanner } from "@/entities/activity/editor/activity-form-status-banner";
import { useActivityForm } from "@/entities/activity/editor/model/use-activity-form";
import type { ActivityFormProps } from "@/entities/activity/editor/model/types";

/**
 * Controlled activity definition editor for the drawer shell.
 *
 * Layout:
 * - Status banner (upcoming / expired only)
 * - Title + description
 * - Color presets
 * - Tracking mode
 * - Schedule type + config input
 * - Goal
 * - Validity window
 */
export function ActivityForm({
  activity,
  resetKey,
  commitKey = 0,
  onChange,
  className,
}: ActivityFormProps) {
  const {
    values,
    errors,
    setTitle,
    setDescription,
    setColor,
    setTrackingMode,
    setScheduleType,
    setScheduleConfig,
    setGoal,
    setStartsAt,
    setEndsAt,
  } = useActivityForm({ activity, resetKey, commitKey, onChange });

  const showGoal = values.trackingMode !== "boolean";

  return (
    <form
      className={cn("flex min-h-0 flex-1 flex-col gap-5", className)}
      noValidate
      onSubmit={(event) => event.preventDefault()}
    >
      <ActivityFormStatusBanner
        archivedAt={activity?.archivedAt ?? null}
        values={values}
      />

      <ActivityFormTitleRow
        errors={errors}
        values={values}
        onDescriptionChange={setDescription}
        onTitleChange={setTitle}
      />

      <ActivityFormColorRow
        color={values.color}
        error={errors.color}
        onChange={setColor}
      />

      <ActivityFormTrackingModeRow
        error={errors.trackingMode}
        trackingMode={values.trackingMode}
        onChange={setTrackingMode}
      />

      <ActivityFormScheduleRow
        scheduleConfig={values.scheduleConfig}
        scheduleConfigError={errors.scheduleConfig}
        scheduleType={values.scheduleType}
        scheduleTypeError={errors.scheduleType}
        onScheduleConfigChange={setScheduleConfig}
        onScheduleTypeChange={setScheduleType}
      />

      {showGoal ? (
        <ActivityFormGoalRow
          error={errors.goal}
          goal={values.goal}
          onChange={setGoal}
        />
      ) : null}

      <ActivityFormWindowRow
        endsAt={values.endsAt}
        endsAtError={errors.endsAt}
        startsAt={values.startsAt}
        startsAtError={errors.startsAt}
        onEndsAtChange={setEndsAt}
        onStartsAtChange={setStartsAt}
      />
    </form>
  );
}
