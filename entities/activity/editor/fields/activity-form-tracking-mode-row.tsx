/**
 * @file entities/activity/editor/fields/activity-form-tracking-mode-row.tsx
 * Tracking mode as a DropdownMenu beside its label.
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
import { TRACKING_MODE_LABELS } from "@/entities/activity/editor/lib/form-labels";
import type { TrackingMode } from "@/entities/activity/model/types";
import { cn } from "@/lib/utils";

const TRACKING_MODES = Object.keys(TRACKING_MODE_LABELS) as TrackingMode[];

export interface ActivityFormTrackingModeRowProps {
  trackingMode: TrackingMode;
  error?: string;
  onChange: (trackingMode: TrackingMode) => void;
}

/**
 * Radio menu for the four tracking modes.
 */
export function ActivityFormTrackingModeRow({
  trackingMode,
  error,
  onChange,
}: ActivityFormTrackingModeRowProps) {
  return (
    <ActivityFormFieldRow error={error} label="Type">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Tracking type"
            className={FIELD_MENU_TRIGGER_CLASS}
            size="sm"
            type="button"
            variant="ghost"
          >
            <span className="truncate">{TRACKING_MODE_LABELS[trackingMode]}</span>
            <ChevronDown aria-hidden className="h-3.5 w-3.5 shrink-0 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className={cn(FIELD_MENU_CONTENT_CLASS, "min-w-[12rem]")}
        >
          <DropdownMenuRadioGroup
            value={trackingMode}
            onValueChange={(value) => onChange(value as TrackingMode)}
          >
            {TRACKING_MODES.map((mode) => (
              <DropdownMenuRadioItem key={mode} value={mode}>
                {TRACKING_MODE_LABELS[mode]}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ActivityFormFieldRow>
  );
}
