/**
 * @file features/activity/activity-record-drawer/ui/activity-record-list.tsx
 * Selected-day records list for the activity calendar drawer.
 */

"use client";

import type { ActivityKind } from "@/entities/activity/model/types";
import { useSelectedDayRecords } from "@/features/activity/activity-record-drawer/model/use-selected-day-records";
import { ActivityRecordTaskPicker } from "@/features/activity/activity-record-drawer/ui/activity-record-task-picker";
import { QuickRecordCard } from "@/features/activity/quick-record";
import { QueryStatePanel } from "@/shared/react-query";

export interface ActivityRecordListProps {
  /** Selected calendar day (`YYYY-MM-DD`). */
  date: string;
  /** Definition kind owned by the mounting page. */
  kind: ActivityKind;
}

/**
 * Renders the day header, Add picker, and persisted records for `date`.
 */
export function ActivityRecordList({ date, kind }: ActivityRecordListProps) {
  const { items, candidates, isPending, isError } = useSelectedDayRecords(
    date,
    kind,
  );
  // Goal editors are task-only; reminders are boolean (toggle) with null goals.
  const showGoalControls = kind === "task";

  if (isError) {
    return (
      <QueryStatePanel message="Failed to load day records." variant="error" />
    );
  }

  if (isPending) {
    return <QueryStatePanel message="Loading records…" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-h2">{date}</h2>
        <ActivityRecordTaskPicker
          candidates={candidates}
          date={date}
          kind={kind}
        />
      </div>

      {items.length === 0 ? (
        <p className="px-2 py-1.5 text-caption [color:var(--color-fg-muted)]">
          No records for this day.
        </p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {items.map((item) => (
            <QuickRecordCard
              key={item.activity.id}
              date={date}
              showGoalControls={showGoalControls}
              today={item}
            />
          ))}
        </div>
      )}
    </div>
  );
}
