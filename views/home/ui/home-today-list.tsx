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
import { QuickRecordCard } from "@/features/activity/quick-record";
import { QueryStatePanel } from "@/shared/react-query";

/**
 * Renders today's activities as a tight, hover-tinted list. Separation is
 * whitespace + hover, not dividers (styling preference, `2-home-today-plan.md`).
 */
export function HomeTodayList() {
  // Phase 5 — mount useActivityRealtimeSync(...) here (mirrors
  // useNotesRealtimeSync in views/home/ui/home-notes-section.tsx).
  // Phase 6 — mount useOfflineSync(userId, [activityOfflineAdapter]) here
  // (mirrors createNotesOfflineSyncAdapter + useOfflineSync in the same file).

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

  return (
    <div className="flex min-h-24 flex-col gap-0.5">
      {today.map((item) => (
        <QuickRecordCard key={item.activity.id} today={item} />
      ))}
    </div>
  );
}
