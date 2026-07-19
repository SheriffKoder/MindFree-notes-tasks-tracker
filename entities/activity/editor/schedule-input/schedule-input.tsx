/**
 * @file entities/activity/editor/schedule-input/schedule-input.tsx
 * Schedule-config orchestrator — switches dropdown inputs by `scheduleType`.
 */

"use client";

import type { ReactNode } from "react";

import { ActivityFormFieldRow } from "@/entities/activity/editor/fields/activity-form-field-row";
import { defaultScheduleConfig } from "@/entities/activity/editor/lib/default-schedule-config";
import { DayMonthPicker } from "@/entities/activity/editor/schedule-input/day-month-picker";
import { DayOfMonthPicker } from "@/entities/activity/editor/schedule-input/day-of-month-picker";
import { OnceDateInput } from "@/entities/activity/editor/schedule-input/once-date-input";
import { WeekdayPicker } from "@/entities/activity/editor/schedule-input/weekday-picker";
import type { ScheduleConfig, ScheduleType, Weekday } from "@/entities/activity/model/types";

export interface ScheduleInputProps {
  scheduleType: ScheduleType;
  scheduleConfig: ScheduleConfig;
  onChange: (scheduleConfig: ScheduleConfig) => void;
  error?: string;
}

function asStringArray(config: ScheduleConfig): string[] {
  return Array.isArray(config) ? config : [];
}

/**
 * Renders exactly one config control per schedule type (or a muted daily note).
 * Callers should seed `scheduleConfig` via `defaultScheduleConfig` on type change.
 */
export function ScheduleInput({
  scheduleType,
  scheduleConfig,
  onChange,
  error,
}: ScheduleInputProps) {
  let body: ReactNode;

  switch (scheduleType) {
    case "once": {
      const value =
        typeof scheduleConfig === "string"
          ? scheduleConfig
          : (defaultScheduleConfig("once") as string);

      body = (
        <OnceDateInput error={error} value={value} onChange={onChange} />
      );
      break;
    }
    case "daily":
      body = (
        <ActivityFormFieldRow label="On">
          <p className="px-2 text-sm [color:var(--color-fg-muted)]">Every day</p>
        </ActivityFormFieldRow>
      );
      break;
    case "weekly": {
      const raw = asStringArray(scheduleConfig);
      const value = (
        raw.length > 0 ? raw : (defaultScheduleConfig("weekly") as string[])
      ) as Weekday[];

      body = (
        <WeekdayPicker error={error} value={value} onChange={onChange} />
      );
      break;
    }
    case "monthly": {
      const raw = asStringArray(scheduleConfig);
      const value =
        raw.length > 0 ? raw : (defaultScheduleConfig("monthly") as string[]);

      body = (
        <DayOfMonthPicker error={error} value={value} onChange={onChange} />
      );
      break;
    }
    case "yearly": {
      const raw = asStringArray(scheduleConfig);
      const value =
        raw.length > 0 ? raw : (defaultScheduleConfig("yearly") as string[]);

      body = (
        <DayMonthPicker error={error} value={value} onChange={onChange} />
      );
      break;
    }
  }

  return body;
}
