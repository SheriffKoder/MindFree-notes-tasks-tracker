/**
 * @file views/home/ui/home-today-list.tsx
 * Client island listing today's activities on the Home dashboard.
 *
 * Purpose: Render the derived Home Today read model as compact rows.
 * Used in: views/home/index.tsx
 * Used for: Read-only slice — quick-record + drawer wiring land in later steps.
 */

"use client";

import { useHomeTodayQuery } from "@/entities/activity/client";
import { ActivityTodayCard } from "@/features/activity/activity-today-card";
import { QueryStatePanel } from "@/shared/react-query";

/**
 * Renders today's activities as a tight, hover-tinted list. Separation is
 * whitespace + hover, not dividers (styling preference, `2-home-today-plan.md`).
 */
export function HomeTodayList() {
  const { today, isPending, isError } = useHomeTodayQuery();

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
      <p className="px-2 py-1.5 text-caption [color:var(--color-fg-muted)]">
        No tasks scheduled for today.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {today.map((item) => (
        <ActivityTodayCard key={item.activity.id} today={item} />
      ))}
    </div>
  );
}
