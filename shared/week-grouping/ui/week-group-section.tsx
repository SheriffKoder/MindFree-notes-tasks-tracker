/**
 * @file shared/week-grouping/ui/week-group-section.tsx
 * Collapsible week header with items rendered below it.
 */

import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { formatWeekRangeLabel } from "@/shared/week-grouping/lib/format-week-date-label";
import type { WeekInMonthGroup } from "@/shared/week-grouping/lib/group-by-week-in-month";

export interface WeekGroupSectionProps<T> {
  week: WeekInMonthGroup<T>;
  weekIndex: number;
  defaultOpen: boolean;
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
}

/**
 * One collapsible week block (`<details>`/`<summary>`) with cards below the header.
 */
export function WeekGroupSection<T>({
  week,
  weekIndex,
  defaultOpen,
  getKey,
  renderItem,
}: WeekGroupSectionProps<T>) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <details
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="group"
    >
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center justify-between gap-3 py-3 text-[11px] leading-tight [color:var(--color-fg-muted)] marker:content-none [&::-webkit-details-marker]:hidden",
          weekIndex > 0 && "border-t border-[var(--color-border)]",
        )}
      >
        <span>
          W{week.weekNumber}: {formatWeekRangeLabel(week.rangeStart, week.rangeEnd)}
        </span>
        <ChevronDown
          className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="flex flex-col gap-3 pb-1 pt-3">
        {week.items.map((item) => (
          <div key={getKey(item)}>{renderItem(item)}</div>
        ))}
      </div>
    </details>
  );
}
