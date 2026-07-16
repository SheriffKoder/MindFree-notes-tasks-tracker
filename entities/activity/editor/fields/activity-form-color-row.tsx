/**
 * @file entities/activity/editor/fields/activity-form-color-row.tsx
 * Color preset picker as a DropdownMenu beside its label.
 */

"use client";

import { Check, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ActivityFormFieldRow } from "@/entities/activity/editor/fields/activity-form-field-row";
import {
  FIELD_MENU_CONTENT_CLASS,
  FIELD_MENU_TRIGGER_CLASS,
} from "@/entities/activity/editor/lib/form-classes";
import { ACTIVITY_COLOR_PRESETS } from "@/entities/activity/editor/lib/form-labels";
import { cn } from "@/lib/utils";

export interface ActivityFormColorRowProps {
  color: string | null | undefined;
  error?: string;
  onChange: (color: string | null) => void;
}

/**
 * Preset swatches in a menu. Stores hex strings (or null).
 */
export function ActivityFormColorRow({
  color,
  error,
  onChange,
}: ActivityFormColorRowProps) {
  const selected = color ?? null;

  return (
    <ActivityFormFieldRow error={error} label="Color">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Pick color"
            className={FIELD_MENU_TRIGGER_CLASS}
            size="sm"
            type="button"
            variant="ghost"
          >
            {selected ? (
              <span
                aria-hidden
                className="h-3.5 w-3.5 shrink-0 rounded-full border border-[var(--color-border)]"
                style={{ backgroundColor: selected }}
              />
            ) : (
              <span className="text-caption">None</span>
            )}
            <ChevronDown aria-hidden className="h-3.5 w-3.5 shrink-0 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className={cn(FIELD_MENU_CONTENT_CLASS, "min-w-[10rem]")}
        >
          <DropdownMenuItem
            className="gap-2"
            onSelect={() => onChange(null)}
          >
            <span className="flex h-3.5 w-3.5 items-center justify-center">
              {selected === null ? <Check className="h-3.5 w-3.5" /> : null}
            </span>
            None
          </DropdownMenuItem>
          {ACTIVITY_COLOR_PRESETS.map((preset) => {
            const isActive = selected === preset;

            return (
              <DropdownMenuItem
                key={preset}
                className="gap-2"
                onSelect={() => onChange(preset)}
              >
                <span
                  aria-hidden
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 rounded-full border border-[var(--color-border)]",
                  )}
                  style={{ backgroundColor: preset }}
                />
                <span className="flex-1 font-mono text-caption">{preset}</span>
                {isActive ? <Check className="h-3.5 w-3.5 shrink-0" /> : null}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </ActivityFormFieldRow>
  );
}
