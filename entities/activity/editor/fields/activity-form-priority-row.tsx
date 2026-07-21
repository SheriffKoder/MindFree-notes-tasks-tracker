/**
 * @file entities/activity/editor/fields/activity-form-priority-row.tsx
 * Task priority as a DropdownMenu beside its label (optional; null = unset).
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
import { PRIORITY_LABELS } from "@/entities/activity/editor/lib/form-labels";
import type { ActivityPriority } from "@/entities/activity/model/types";
import { cn } from "@/lib/utils";

/** Radio value for unset priority — DropdownMenuRadioGroup needs a string. */
const NONE_VALUE = "none";

const PRIORITY_OPTIONS: {
  value: typeof NONE_VALUE | ActivityPriority;
  label: string;
}[] = [
  { value: NONE_VALUE, label: PRIORITY_LABELS.none },
  { value: "low", label: PRIORITY_LABELS.low },
  { value: "medium", label: PRIORITY_LABELS.medium },
  { value: "high", label: PRIORITY_LABELS.high },
];

export interface ActivityFormPriorityRowProps {
  priority: ActivityPriority | null | undefined;
  error?: string;
  onChange: (priority: ActivityPriority | null) => void;
}

/**
 * Optional Low / Medium / High priority; "No priority" stores `null`.
 */
export function ActivityFormPriorityRow({
  priority,
  error,
  onChange,
}: ActivityFormPriorityRowProps) {
  const radioValue = priority ?? NONE_VALUE;

  return (
    <ActivityFormFieldRow error={error} label="Priority">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Priority"
            className={FIELD_MENU_TRIGGER_CLASS}
            size="sm"
            type="button"
            variant="ghost"
          >
            <span className="truncate">
              {priority ? PRIORITY_LABELS[priority] : PRIORITY_LABELS.none}
            </span>
            <ChevronDown aria-hidden className="h-3.5 w-3.5 shrink-0 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className={cn(FIELD_MENU_CONTENT_CLASS, "min-w-[10rem]")}
        >
          <DropdownMenuRadioGroup
            value={radioValue}
            onValueChange={(value) => {
              onChange(
                value === NONE_VALUE ? null : (value as ActivityPriority),
              );
            }}
          >
            {PRIORITY_OPTIONS.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ActivityFormFieldRow>
  );
}
