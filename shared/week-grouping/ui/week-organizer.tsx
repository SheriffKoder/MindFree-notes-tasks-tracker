/**
 * @file shared/week-grouping/ui/week-organizer.tsx
 * Groups dated items by calendar week and renders collapsible week sections.
 */

import { useMemo, type ReactNode } from "react";

import { groupItemsByWeekInMonth } from "@/shared/week-grouping/lib/group-by-week-in-month";
import type { WeekGroupingConfig } from "@/shared/week-grouping/model/types";
import { UngroupedItemsSection } from "@/shared/week-grouping/ui/ungrouped-items-section";
import { WeekGroupSection } from "@/shared/week-grouping/ui/week-group-section";

export interface WeekOrganizerProps<T> {
  items: T[];
  weekGrouping: WeekGroupingConfig;
  renderItem: (item: T) => ReactNode;
  getKey: (item: T) => string;
}

/**
 * Organizes list items into calendar weeks within a month.
 */
export function WeekOrganizer<T>({
  items,
  weekGrouping,
  renderItem,
  getKey,
}: WeekOrganizerProps<T>) {
  const { month, dateKey, defaultOpen = true } = weekGrouping;

  const { weeks, ungrouped } = useMemo(
    () => groupItemsByWeekInMonth(items, month, dateKey),
    [dateKey, items, month],
  );

  return (
    <>
      {weeks.map((week, weekIndex) => (
        <WeekGroupSection
          key={`${week.rangeStart}-${week.rangeEnd}`}
          week={week}
          weekIndex={weekIndex}
          defaultOpen={defaultOpen}
          getKey={getKey}
          renderItem={renderItem}
        />
      ))}
      <UngroupedItemsSection
        month={month}
        items={ungrouped}
        getKey={getKey}
        renderItem={renderItem}
      />
    </>
  );
}
