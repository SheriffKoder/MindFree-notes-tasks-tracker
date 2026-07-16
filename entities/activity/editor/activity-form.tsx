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
 * - Details: goal + color, starts + ends
 * - Tracking: type, schedule, schedule dependents
 */
export function ActivityForm({
  activity,
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
    setStartsAt,
    setEndsAt,
  } = useActivityForm({ activity, resetKey, commitKey, onChange });

  useEffect(() => {
    onFooterMetaChange?.({
      formattedLastEditedAt,
      saveStatus,
    });
  }, [formattedLastEditedAt, onFooterMetaChange, saveStatus]);

  const showGoal = values.trackingMode !== "boolean";

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
        description="Optional goal, color, and the window when this task is active."
        title="Details"
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
          {showGoal ? (
            <ActivityFormGoalRow
              error={errors.goal}
              goal={values.goal}
              onChange={setGoal}
            />
          ) : null}
          <ActivityFormColorRow
            color={values.color}
            error={errors.color}
            onChange={setColor}
          />
        </div>

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
        description="How completion is recorded and which days the schedule covers."
        title="Tracking"
      >
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
      </ActivityFormSection>
    </form>
  );
}
