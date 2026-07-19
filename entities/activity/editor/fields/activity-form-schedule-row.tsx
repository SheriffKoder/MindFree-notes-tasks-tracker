/**
 * @file entities/activity/editor/fields/activity-form-schedule-row.tsx
 * Schedule type dropdown + config dependents.
 */

"use client";

import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ActivityFormFieldRow } from "@/entities/activity/editor/fields/activity-form-field-row";
import {
  FIELD_MENU_CONTENT_CLASS,
  FIELD_MENU_TRIGGER_CLASS,
} from "@/entities/activity/editor/lib/form-classes";
import { SCHEDULE_TYPE_LABELS } from "@/entities/activity/editor/lib/form-labels";
import { ScheduleInput } from "@/entities/activity/editor/schedule-input";
import type { ScheduleConfig, ScheduleType } from "@/entities/activity/model/types";
import { cn } from "@/lib/utils";

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
    <div className="flex flex-col gap-2">
      <ActivityFormFieldRow error={scheduleTypeError} label="Schedule">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label="Schedule type"
              className={FIELD_MENU_TRIGGER_CLASS}
              size="sm"
              type="button"
              variant="ghost"
            >
              <span className="truncate">
                {SCHEDULE_TYPE_LABELS[scheduleType]}
              </span>
              <ChevronDown
                aria-hidden
                className="h-3.5 w-3.5 shrink-0 opacity-60"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className={cn(FIELD_MENU_CONTENT_CLASS, "min-w-[10rem]")}
          >
            <DropdownMenuRadioGroup
              value={scheduleType}
              onValueChange={(value) =>
                onScheduleTypeChange(value as ScheduleType)
              }
            >
              {SCHEDULE_TYPES.map((type) => (
                <DropdownMenuRadioItem key={type} value={type}>
                  {SCHEDULE_TYPE_LABELS[type]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ActivityFormFieldRow>

      <ScheduleInput
        error={scheduleConfigError}
        scheduleConfig={scheduleConfig}
        scheduleType={scheduleType}
        onChange={onScheduleConfigChange}
      />
    </div>
  );
}
