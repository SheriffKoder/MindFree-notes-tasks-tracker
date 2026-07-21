/**
 * @file views/home/ui/home-today-list.tsx
 * Client island listing today's activities on the Home dashboard.
 *
 * Purpose: Render the derived Home Today read model as compact rows, each with
 *          inline quick-record controls injected into the card's `recordSlot`.
 * Used in: views/home/index.tsx
 */

"use client";

import { useHomeTodayQuery } from "@/entities/activity/client";
import { QueryStatePanel } from "@/shared/react-query";
import { HomeTodayPriorityList } from "@/views/home/ui/home-today-priority-list";

/**
 * Renders today's tasks grouped by priority (High → Medium → Low → Other).
 * Separation is whitespace + hover, not dividers.
 */
export function HomeTodayList() {
  // Realtime + offline: shared islands in views/home/index.tsx
  // (HomeActivityRealtime / HomeActivityOffline — not inside both Today lists).

  const { today, isPending, isError } = useHomeTodayQuery("task");

  if (isError) {
    return (
      <QueryStatePanel message="Failed to load today's tasks." variant="error" />
    );
  }

  if (isPending) {
    return <QueryStatePanel message="Loading tasks…" />;
  }

  if (today.length === 0) {
    return (
      <div className="flex min-h-24 flex-col items-center justify-center">
        <p className="px-2 py-1.5 text-center text-caption [color:var(--color-fg-muted)]">
          No tasks scheduled for today.
        </p>
      </div>
    );
  }

  return <HomeTodayPriorityList items={today} />;
}
