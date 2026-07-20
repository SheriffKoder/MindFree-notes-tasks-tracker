/**
 * @file entities/activity/editor/activity-form.tsx
 * Plain activity config form — composes field sections; no save routing.
 *
 * Purpose: Dumb editor shell; drawer orchestrator owns create/update.
 * Used in: features/activity/activity-drawer (Step 11+)
 * Used for: Controlled definition fields + scheduleConfig emission.
 */

"use client";

import { useEffect } from "react";

import { cn } from "@/lib/utils";
import { ActivityFormStatusBanner } from "@/entities/activity/editor/activity-form-status-banner";
import { ActivityFormColorRow } from "@/entities/activity/editor/fields/activity-form-color-row";
import { ActivityFormGoalRow } from "@/entities/activity/editor/fields/activity-form-goal-row";
import { ActivityFormPeriodGoalRow } from "@/entities/activity/editor/fields/activity-form-period-goal-row";
import { ActivityFormPriorityRow } from "@/entities/activity/editor/fields/activity-form-priority-row";
import { ActivityFormScheduleRow } from "@/entities/activity/editor/fields/activity-form-schedule-row";
import { ActivityFormSection } from "@/entities/activity/editor/fields/activity-form-section";
import { ActivityFormTitleRow } from "@/entities/activity/editor/fields/activity-form-title-row";
import { ActivityFormTrackingModeRow } from "@/entities/activity/editor/fields/activity-form-tracking-mode-row";
import { ActivityFormWindowRow } from "@/entities/activity/editor/fields/activity-form-window-row";
import { useActivityForm } from "@/entities/activity/editor/model/use-activity-form";
import type { ActivityFormProps } from "@/entities/activity/editor/model/types";

/**
 * Controlled activity definition editor for the drawer shell.
 *
 * Layout:
 * - Title (h2) + archive/restore/delete actions + dimmer description
 * - Status banner (upcoming / expired only)
 * - Details: mode-aware count/duration goals + period goal + priority + color,
 *   starts + ends
 * - Tracking: type, schedule, schedule dependents
 */
export function ActivityForm({
  activity,
  kind,
  resetKey,
  commitKey = 0,
  onChange,
  saveStatus = "idle",
  onFooterMetaChange,
  onArchive,
  onRestore,
  onDelete,
  className,
}: ActivityFormProps) {
  const {
    values,
    errors,
    formattedLastEditedAt,
    setTitle,
    setDescription,
    setColor,
    setTrackingMode,
    setScheduleType,
    setScheduleConfig,
    setGoal,
    setGoalDuration,
    setGoalPeriod,
    setPeriodGoal,
    setPeriodGoalDuration,
    setPriority,
    setStartsAt,
    setEndsAt,
  } = useActivityForm({ activity, resetKey, commitKey, onChange });

  useEffect(() => {
    onFooterMetaChange?.({
      formattedLastEditedAt,
      saveStatus,
    });
  }, [formattedLastEditedAt, onFooterMetaChange, saveStatus]);

  const showCountGoal =
    values.trackingMode === "count" || values.trackingMode === "count+duration";
  const showDurationGoal =
    values.trackingMode === "duration" ||
    values.trackingMode === "count+duration";
  /** Boolean uses count-shaped period targets (decision 3). */
  const showPeriodCountGoal =
    values.trackingMode === "boolean" || showCountGoal;
  const isReminder = kind === "reminder";

  return (
    <form
      className={cn(
        "flex min-h-0 w-full flex-1 flex-col gap-6 md:max-w-lg",
        className,
      )}
      noValidate
      onSubmit={(event) => event.preventDefault()}
    >
      <ActivityFormTitleRow
        errors={errors}
        isArchived={Boolean(activity?.archivedAt)}
        values={values}
        onArchive={onArchive}
        onDelete={onDelete}
        onDescriptionChange={setDescription}
        onRestore={onRestore}
        onTitleChange={setTitle}
      />

      <ActivityFormStatusBanner
        archivedAt={activity?.archivedAt ?? null}
        values={values}
      />

      <ActivityFormSection
        description={
          isReminder
            ? "Choose the window when this reminder is active."
            : "Optional goals, period targets, priority, color, and the window when this task is active."
        }
        title="Details"
      >
        {!isReminder ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
            {showCountGoal ? (
              <ActivityFormGoalRow
                error={errors.goal}
                label="Count goal"
                value={values.goal}
                onChange={setGoal}
              />
            ) : null}
            {showDurationGoal ? (
              <ActivityFormGoalRow
                error={errors.goalDuration}
                label="Duration goal (minutes)"
                value={values.goalDuration}
                onChange={setGoalDuration}
              />
            ) : null}
            <ActivityFormPeriodGoalRow
              goalPeriod={values.goalPeriod}
              goalPeriodError={errors.goalPeriod}
              periodGoal={values.periodGoal}
              periodGoalDuration={values.periodGoalDuration}
              periodGoalDurationError={errors.periodGoalDuration}
              periodGoalError={errors.periodGoal}
              showCountGoal={showPeriodCountGoal}
              showDurationGoal={showDurationGoal}
              onGoalPeriodChange={setGoalPeriod}
              onPeriodGoalChange={setPeriodGoal}
              onPeriodGoalDurationChange={setPeriodGoalDuration}
            />
            <ActivityFormPriorityRow
              error={errors.priority}
              priority={values.priority}
              onChange={setPriority}
            />
            <ActivityFormColorRow
              color={values.color}
              error={errors.color}
              onChange={setColor}
            />
          </div>
        ) : null}

        <ActivityFormWindowRow
          endsAt={values.endsAt}
          endsAtError={errors.endsAt}
          startsAt={values.startsAt}
          startsAtError={errors.startsAt}
          onEndsAtChange={setEndsAt}
          onStartsAtChange={setStartsAt}
        />
      </ActivityFormSection>

      <ActivityFormSection
        description={
          isReminder
            ? "Choose which days the reminder appears."
            : "How completion is recorded and which days the schedule covers."
        }
        title={isReminder ? "Schedule" : "Tracking"}
      >
        {!isReminder ? (
          <ActivityFormTrackingModeRow
            error={errors.trackingMode}
            trackingMode={values.trackingMode}
            onChange={setTrackingMode}
          />
        ) : null}

        <ActivityFormScheduleRow
          scheduleConfig={values.scheduleConfig}
          scheduleConfigError={errors.scheduleConfig}
          scheduleType={values.scheduleType}
          scheduleTypeError={errors.scheduleType}
          onScheduleConfigChange={setScheduleConfig}
          onScheduleTypeChange={setScheduleType}
        />
      </ActivityFormSection>
    </form>
  );
}
