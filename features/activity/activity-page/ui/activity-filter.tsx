/**
 * @file features/activity/activity-page/ui/activity-filter.tsx
 * Definition-selection filter for the activity calendar (dropdown + reset).
 */

"use client";

import { Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Activity } from "@/entities/activity/client";
import { useActivityFilter } from "@/features/activity/activity-page/model/activity-filter-context";
import { cn } from "@/lib/utils";

export interface ActivityFilterProps {
  /** Activities available to filter (from the definitions cache). */
  activities: readonly Activity[];
  filterAriaLabel: string;
  filterShowLabel: string;
  filterEmptyLabel: string;
  filterShowAllLabel: string;
  className?: string;
}

/**
 * Renders a multi-select beside the toolbar. The trigger reflects an active
 * filter via the `secondary` variant.
 */
export function ActivityFilter({
  activities,
  filterAriaLabel,
  filterShowLabel,
  filterEmptyLabel,
  filterShowAllLabel,
  className,
}: ActivityFilterProps) {
  const {
    isShown,
    isFiltered,
    showIncomplete,
    toggle,
    toggleShowIncomplete,
    reset,
  } = useActivityFilter();

  return (
    <div
      className={cn(
        "flex shrink-0 items-center rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_88%,transparent)] p-2 shadow-sm",
        className,
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={filterAriaLabel}
            className="shrink-0"
            size="icon"
            title={filterAriaLabel}
            type="button"
            variant={isFiltered ? "secondary" : "ghost"}
          >
            <Filter
              aria-hidden
              className="h-4 w-4 [color:var(--color-fg-muted)]"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Display</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={showIncomplete}
            onCheckedChange={() => toggleShowIncomplete()}
            onSelect={(event) => event.preventDefault()}
          >
            Show incomplete
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>{filterShowLabel}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {activities.length === 0 ? (
            <DropdownMenuItem disabled>{filterEmptyLabel}</DropdownMenuItem>
          ) : (
            activities.map((activity) => (
              <DropdownMenuCheckboxItem
                key={activity.id}
                checked={isShown(activity.id)}
                onCheckedChange={() => toggle(activity.id)}
                onSelect={(event) => event.preventDefault()}
              >
                <span className="flex min-w-0 items-center gap-2">
                  {activity.color ? (
                    <span
                      aria-hidden
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: activity.color }}
                    />
                  ) : null}
                  <span className="truncate">{activity.title}</span>
                </span>
              </DropdownMenuCheckboxItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={!isFiltered}
            onSelect={(event) => {
              event.preventDefault();
              reset();
            }}
          >
            {filterShowAllLabel}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
