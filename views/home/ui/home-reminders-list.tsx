/**
 * @file views/home/ui/home-reminders-list.tsx
 * Client island listing today's reminders on the Home dashboard.
 *
 * Same derivation pattern as HomeTodayList, scoped to `kind="reminder"`.
 * Rows use boolean quick-record (toggle done / delete on empty).
 */

"use client";

import { useHomeTodayQuery } from "@/entities/activity/client";
import { QuickRecordCard } from "@/features/activity/quick-record";
import { QueryStatePanel } from "@/shared/react-query";

/**
 * Renders today's reminders as a tight list with boolean toggle controls.
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

  return (
    <div className="flex min-h-24 flex-col gap-0.5">
      {today.map((item) => (
        <QuickRecordCard key={item.activity.id} today={item} />
      ))}
    </div>
  );
}
