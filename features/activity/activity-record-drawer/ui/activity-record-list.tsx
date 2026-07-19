/**
 * @file features/activity/activity-record-drawer/ui/activity-record-list.tsx
 * Selected-day records list for the Tasks calendar drawer.
 *
 * Purpose: Present the derived selected-day read model as a header, Add
 *          dropdown, and Home-style record cards.
 * Used in: features/activity/activity-record-drawer/ui/activity-record-drawer.tsx
 *
 * Data ownership lives in `useSelectedDayRecords`: this component only renders
 * loading/error/empty/populated UI for that derived slice.
 */

"use client";

import { ActivityRecordTaskPicker } from "@/features/activity/activity-record-drawer/ui/activity-record-task-picker";
import { useSelectedDayRecords } from "@/features/activity/activity-record-drawer/model/use-selected-day-records";
import { QuickRecordCard } from "@/features/activity/quick-record";
import { QueryStatePanel } from "@/shared/react-query";

export interface ActivityRecordListProps {
  /** Selected calendar day (`YYYY-MM-DD`). */
  date: string;
}

/**
 * Renders the day header, Add picker, and persisted records for `date`.
 */
export function ActivityRecordList({ date }: ActivityRecordListProps) {
  const { items, candidates, isPending, isError } =
    useSelectedDayRecords(date);

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
        <ActivityRecordTaskPicker candidates={candidates} date={date} />
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
              showGoalControls
              today={item}
            />
          ))}
        </div>
      )}
    </div>
  );
}
