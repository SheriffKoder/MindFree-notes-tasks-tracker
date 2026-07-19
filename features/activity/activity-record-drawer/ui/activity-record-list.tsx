/**
 * @file features/activity/activity-record-drawer/ui/activity-record-list.tsx
 * Selected-day records list for the Tasks calendar drawer.
 *
 * Purpose: Join canonical task + month-record caches for one date and render
 *          Home-style rows with inline quick-record controls.
 * Used in: features/activity/activity-record-drawer/ui/activity-record-drawer.tsx
 */

"use client";

import { useMemo } from "react";

import {
  buildRecordLookup,
  buildRecordedDayActivities,
} from "@/entities/activity";
import {
  useActivitiesQuery,
  useActivityRecordsQuery,
} from "@/entities/activity/client";
import { QuickRecordCard } from "@/features/activity/quick-record";
import { QueryStatePanel } from "@/shared/react-query";

export interface ActivityRecordListProps {
  /** Selected calendar day (`YYYY-MM-DD`). */
  date: string;
}

/**
 * Renders persisted records for `date` as compact Today-style cards.
 */
export function ActivityRecordList({ date }: ActivityRecordListProps) {
  const month = date.slice(0, 7);
  const activitiesQuery = useActivitiesQuery("task");
  const recordsQuery = useActivityRecordsQuery(month);

  const activities = activitiesQuery.data?.activities;
  const records = recordsQuery.data?.records;

  const items = useMemo(() => {
    if (!activities || !records) {
      return [];
    }

    return buildRecordedDayActivities(
      activities,
      buildRecordLookup(records),
      date,
    );
  }, [activities, date, records]);

  if (activitiesQuery.isError || recordsQuery.isError) {
    return (
      <QueryStatePanel message="Failed to load day records." variant="error" />
    );
  }

  if (activitiesQuery.isPending || recordsQuery.isPending) {
    return <QueryStatePanel message="Loading records…" />;
  }

  if (items.length === 0) {
    return (
      <p className="px-2 py-1.5 text-caption [color:var(--color-fg-muted)]">
        No records for this day.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {items.map((item) => (
        <QuickRecordCard key={item.activity.id} date={date} today={item} />
      ))}
    </div>
  );
}
