/**
 * @file views/home/ui/home-reminders-list.tsx
 * Client island listing today's reminders on the Home dashboard.
 *
 * Same derivation pattern as HomeTodayList, scoped to `kind="reminder"`.
 * Rows use boolean quick-record (toggle done / delete on empty).
 */

"use client";

import { useHomeTodayQuery } from "@/entities/activity/client";
import { QueryStatePanel } from "@/shared/react-query";
import { HomeTodayPriorityList } from "@/views/home/ui/home-today-priority-list";

/**
 * Renders today's reminders grouped by priority (same buckets as tasks).
 * Reminders currently always store `priority: null`, so they land in Other.
 */
export function HomeRemindersList() {
  const { today, isPending, isError } = useHomeTodayQuery("reminder");

  if (isError) {
    return (
      <QueryStatePanel
        message="Failed to load today's reminders."
        variant="error"
      />
    );
  }

  if (isPending) {
    return <QueryStatePanel message="Loading reminders…" />;
  }

  if (today.length === 0) {
    return (
      <div className="flex min-h-24 flex-col items-center justify-center">
        <p className="px-2 py-1.5 text-center text-caption [color:var(--color-fg-muted)]">
          No reminders scheduled for today.
        </p>
      </div>
    );
  }

  return <HomeTodayPriorityList items={today} />;
}
