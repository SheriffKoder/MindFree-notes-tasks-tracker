/**
 * @file entities/activity/editor/fields/activity-form-schedule-row.tsx
 * Schedule type select + config input orchestrator.
 */

"use client";

import { Label } from "@/components/ui/label";
import type { ScheduleConfig, ScheduleType } from "@/entities/activity/model/types";
import { FIELD_SELECT_CLASS } from "@/entities/activity/editor/lib/form-classes";
import { SCHEDULE_TYPE_LABELS } from "@/entities/activity/editor/lib/form-labels";
import { ScheduleInput } from "@/entities/activity/editor/schedule-input";

const SCHEDULE_TYPES = Object.keys(SCHEDULE_TYPE_LABELS) as ScheduleType[];

export interface ActivityFormScheduleRowProps {
  scheduleType: ScheduleType;
  scheduleConfig: ScheduleConfig;
  scheduleTypeError?: string;
  scheduleConfigError?: string;
  onScheduleTypeChange: (scheduleType: ScheduleType) => void;
  onScheduleConfigChange: (scheduleConfig: ScheduleConfig) => void;
}

/**
 * Recurrence type selector plus the matching scheduleConfig control.
 */
export function ActivityFormScheduleRow({
  scheduleType,
  scheduleConfig,
  scheduleTypeError,
  scheduleConfigError,
  onScheduleTypeChange,
  onScheduleConfigChange,
}: ActivityFormScheduleRowProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor="activity-schedule-type">Schedule</Label>
        <select
          aria-invalid={Boolean(scheduleTypeError)}
          className={FIELD_SELECT_CLASS}
          id="activity-schedule-type"
          name="scheduleType"
          value={scheduleType}
          onChange={(event) =>
            onScheduleTypeChange(event.target.value as ScheduleType)
          }
        >
          {SCHEDULE_TYPES.map((type) => (
            <option key={type} value={type}>
              {SCHEDULE_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
        {scheduleTypeError ? (
          <p className="text-caption [color:var(--color-error)]" role="alert">
            {scheduleTypeError}
          </p>
        ) : null}
      </div>

      <ScheduleInput
        error={scheduleConfigError}
        scheduleConfig={scheduleConfig}
        scheduleType={scheduleType}
        onChange={onScheduleConfigChange}
      />
    </div>
  );
}
