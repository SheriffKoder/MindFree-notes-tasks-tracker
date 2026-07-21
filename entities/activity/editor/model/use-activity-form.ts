/**
 * @file entities/activity/editor/model/use-activity-form.ts
 * Local field state, dirty tracking, and validation for the activity config form.
 *
 * Purpose: Own form state only — no network I/O or save routing.
 * Used in: entities/activity/editor/activity-form.tsx
 * Used for: Controlled fields, dirty/valid meta, and reset on context switch.
 *
 * Steps (on resetKey / activity id change):
 * 1. Seed values from the loaded activity or empty defaults.
 * 2. Emit onChange with isDirty/isValid meta on every field update.
 * 3. Snap dirty baseline on commitKey without overwriting current inputs.
 * 4. Pull remote fields only when remoteSyncKey bumps (idle/clean guard).
 */

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { Activity, ScheduleConfig } from "@/entities/activity/model/types";
import {
  activityFormObject,
  addScheduleConfigIssues,
  addWindowIssues,
} from "@/entities/activity/schema/activity-form.schema";
import { defaultScheduleConfig } from "@/entities/activity/editor/lib/default-schedule-config";
import { formatActivityLastEditedAt } from "@/entities/activity/editor/lib/format-last-edited";
import { normalizeActivityGoals } from "@/entities/activity/editor/model/normalize-activity-goals";
import { normalizePeriodGoals } from "@/entities/activity/editor/model/normalize-period-goals";
import type {
  ActivityFormFieldErrors,
  ActivityFormValues,
  UseActivityFormOptions,
  UseActivityFormResult,
} from "@/entities/activity/editor/model/types";

/** Full create/edit validation: base object + schedule/window refinements. */
const activityFormSchema = activityFormObject.superRefine((value, ctx) => {
  addScheduleConfigIssues(value.scheduleType, value.scheduleConfig, ctx);
  addWindowIssues(value.startsAt ?? null, value.endsAt ?? null, ctx);
});

const EMPTY_VALUES: ActivityFormValues = {
  title: "",
  description: null,
  color: null,
  trackingMode: "boolean",
  scheduleType: "daily",
  scheduleConfig: null,
  goal: null,
  goalDuration: null,
  goalPeriod: null,
  periodGoal: null,
  periodGoalDuration: null,
  priority: null,
  startsAt: null,
  endsAt: null,
};

const FORM_FIELD_KEYS = new Set<keyof ActivityFormValues>([
  "title",
  "description",
  "color",
  "trackingMode",
  "scheduleType",
  "scheduleConfig",
  "goal",
  "goalDuration",
  "goalPeriod",
  "periodGoal",
  "periodGoalDuration",
  "priority",
  "startsAt",
  "endsAt",
]);

function activityToFormValues(activity: Activity | null): ActivityFormValues {
  if (!activity) {
    return EMPTY_VALUES;
  }

  return {
    title: activity.title,
    description: activity.description,
    color: activity.color,
    trackingMode: activity.trackingMode,
    scheduleType: activity.scheduleType,
    scheduleConfig: activity.scheduleConfig,
    goal: activity.goal,
    goalDuration: activity.goalDuration,
    goalPeriod: activity.goalPeriod,
    periodGoal: activity.periodGoal,
    periodGoalDuration: activity.periodGoalDuration,
    priority: activity.priority,
    startsAt: activity.startsAt,
    endsAt: activity.endsAt,
  };
}

function scheduleConfigsEqual(
  left: ScheduleConfig,
  right: ScheduleConfig,
): boolean {
  if (left === right) {
    return true;
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    return (
      left.length === right.length && left.every((value, i) => value === right[i])
    );
  }

  return false;
}

function valuesAreEqual(
  left: ActivityFormValues,
  right: ActivityFormValues,
): boolean {
  return (
    left.title === right.title &&
    left.description === right.description &&
    left.color === right.color &&
    left.trackingMode === right.trackingMode &&
    left.scheduleType === right.scheduleType &&
    scheduleConfigsEqual(left.scheduleConfig, right.scheduleConfig) &&
    (left.goal ?? null) === (right.goal ?? null) &&
    (left.goalDuration ?? null) === (right.goalDuration ?? null) &&
    (left.goalPeriod ?? null) === (right.goalPeriod ?? null) &&
    (left.periodGoal ?? null) === (right.periodGoal ?? null) &&
    (left.periodGoalDuration ?? null) === (right.periodGoalDuration ?? null) &&
    (left.priority ?? null) === (right.priority ?? null) &&
    left.startsAt === right.startsAt &&
    left.endsAt === right.endsAt
  );
}

function getFieldErrors(values: ActivityFormValues): ActivityFormFieldErrors {
  const result = activityFormSchema.safeParse(values);

  if (result.success) {
    return {};
  }

  const errors: ActivityFormFieldErrors = {};

  for (const issue of result.error.issues) {
    const field = issue.path[0];

    if (
      typeof field === "string" &&
      FORM_FIELD_KEYS.has(field as keyof ActivityFormValues)
    ) {
      errors[field as keyof ActivityFormValues] ??= issue.message;
    }
  }

  return errors;
}

/**
 * Manages controlled activity config state derived from an optional existing row.
 *
 * Resets fields only on `resetKey` / activity id changes — not on optimistic
 * cache updates — so autosave does not wipe in-progress typing.
 */
export function useActivityForm({
  activity,
  resetKey,
  commitKey = 0,
  remoteSyncKey = 0,
  onChange,
}: UseActivityFormOptions): UseActivityFormResult {
  const activityKey = activity?.id ?? "draft";
  const initialValues = useMemo(
    () => activityToFormValues(activity),
    [activityKey, resetKey],
  );

  const [baselineValues, setBaselineValues] =
    useState<ActivityFormValues>(initialValues);
  const [values, setValues] = useState<ActivityFormValues>(initialValues);
  const [errors, setErrors] = useState<ActivityFormFieldErrors>({});

  const valuesRef = useRef(values);
  valuesRef.current = values;

  const activityRef = useRef(activity);
  activityRef.current = activity;

  // Context switch — reload fields from the resolved activity or empty draft.
  useEffect(() => {
    const nextValues = activityToFormValues(activity);
    setBaselineValues(nextValues);
    setValues(nextValues);
    setErrors({});
  }, [activityKey, resetKey]);

  // Remote sync — pull cached activity fields only when remoteSyncKey bumps
  // (not on every cache write).
  useEffect(() => {
    if (remoteSyncKey === 0) {
      return;
    }

    const nextValues = activityToFormValues(activityRef.current);
    setBaselineValues(nextValues);
    setValues(nextValues);
    setErrors({});
  }, [remoteSyncKey]);

  // Successful autosave — snap baseline without overwriting current inputs.
  useEffect(() => {
    if (commitKey === 0) {
      return;
    }

    setBaselineValues(valuesRef.current);
  }, [commitKey]);

  const isDirty = useMemo(
    () => !valuesAreEqual(values, baselineValues),
    [baselineValues, values],
  );

  const isValid = useMemo(
    () => activityFormSchema.safeParse(values).success,
    [values],
  );

  const formattedLastEditedAt = useMemo(
    () => formatActivityLastEditedAt(activity?.updatedAt),
    [activity?.updatedAt],
  );

  const updateValues = useCallback((nextValues: ActivityFormValues) => {
    setValues(nextValues);
    setErrors(getFieldErrors(nextValues));
  }, []);

  useEffect(() => {
    onChange?.(values, { isDirty, isValid });
  }, [isDirty, isValid, onChange, values]);

  const setTitle = useCallback(
    (title: string) => {
      updateValues({ ...values, title });
    },
    [updateValues, values],
  );

  const setDescription = useCallback(
    (description: string | null) => {
      updateValues({ ...values, description });
    },
    [updateValues, values],
  );

  const setColor = useCallback(
    (color: string | null) => {
      updateValues({ ...values, color });
    },
    [updateValues, values],
  );

  const setTrackingMode = useCallback(
    (trackingMode: ActivityFormValues["trackingMode"]) => {
      updateValues({
        ...values,
        trackingMode,
        ...normalizeActivityGoals(trackingMode, values),
        ...normalizePeriodGoals(trackingMode, values),
      });
    },
    [updateValues, values],
  );

  const setScheduleType = useCallback(
    (scheduleType: ActivityFormValues["scheduleType"]) => {
      updateValues({
        ...values,
        scheduleType,
        scheduleConfig: defaultScheduleConfig(scheduleType),
      });
    },
    [updateValues, values],
  );

  const setScheduleConfig = useCallback(
    (scheduleConfig: ActivityFormValues["scheduleConfig"]) => {
      updateValues({ ...values, scheduleConfig });
    },
    [updateValues, values],
  );

  const setGoal = useCallback(
    (goal: number | null) => {
      updateValues({ ...values, goal });
    },
    [updateValues, values],
  );

  const setGoalDuration = useCallback(
    (goalDuration: number | null) => {
      updateValues({ ...values, goalDuration });
    },
    [updateValues, values],
  );

  const setGoalPeriod = useCallback(
    (goalPeriod: ActivityFormValues["goalPeriod"]) => {
      updateValues({
        ...values,
        ...normalizePeriodGoals(values.trackingMode, {
          ...values,
          goalPeriod,
        }),
      });
    },
    [updateValues, values],
  );

  const setPeriodGoal = useCallback(
    (periodGoal: number | null) => {
      updateValues({ ...values, periodGoal });
    },
    [updateValues, values],
  );

  const setPeriodGoalDuration = useCallback(
    (periodGoalDuration: number | null) => {
      updateValues({ ...values, periodGoalDuration });
    },
    [updateValues, values],
  );

  const setPriority = useCallback(
    (priority: ActivityFormValues["priority"]) => {
      updateValues({ ...values, priority });
    },
    [updateValues, values],
  );

  const setStartsAt = useCallback(
    (startsAt: string | null) => {
      updateValues({ ...values, startsAt });
    },
    [updateValues, values],
  );

  const setEndsAt = useCallback(
    (endsAt: string | null) => {
      updateValues({ ...values, endsAt });
    },
    [updateValues, values],
  );

  return {
    values,
    errors,
    isDirty,
    isValid,
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
  };
}
