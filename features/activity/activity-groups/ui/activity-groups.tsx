/**
 * @file features/activity/activity-groups/ui/activity-groups.tsx
 * Active/inactive collapsible split for the Tasks list view.
 */

"use client";

import { ChevronDown } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";

import type { Activity } from "@/entities/activity";
import { ActivityListCard } from "@/features/activity/activity-list-card";
import { groupActivities } from "@/features/activity/activity-groups/lib/group-activities";
import { getTodayIsoDate } from "@/shared/calendar";
import { ListView } from "@/shared/list-view";

export interface ActivityGroupsProps {
  activities: Activity[];
  /** Reference day for grouping and status chips; defaults to today. */
  todayIso?: string;
  /** Empty-state copy for the Active section (kind-aware from the page). */
  activeEmptyLabel?: string;
  onActivityClick?: (activity: Activity) => void;
}

function getActivityKey(activity: Activity): string {
  return activity.id;
}

interface ActivityGroupSectionProps {
  title: string;
  items: Activity[];
  todayIso: string;
  emptyText: string;
  onActivityClick?: (activity: Activity) => void;
}

function ActivityGroupSection({
  title,
  items,
  todayIso,
  emptyText,
  onActivityClick,
}: ActivityGroupSectionProps) {
  const renderItem = useCallback(
    (activity: Activity) => (
      <ActivityListCard
        activity={activity}
        todayIso={todayIso}
        onClick={onActivityClick ? () => onActivityClick(activity) : undefined}
      />
    ),
    [onActivityClick, todayIso],
  );

  return (
    <section>
      <p className="py-3 text-[11px] leading-tight [color:var(--color-fg-muted)]">
        {title}
      </p>
      {items.length > 0 ? (
        <ListView
          layout="list"
          items={items}
          renderItem={renderItem}
          getKey={getActivityKey}
        />
      ) : (
        <p className="px-1 pb-1 text-caption [color:var(--color-fg-muted)]">
          {emptyText}
        </p>
      )}
    </section>
  );
}

interface InactiveActivityGroupSectionProps {
  items: Activity[];
  todayIso: string;
  onActivityClick?: (activity: Activity) => void;
}

function InactiveActivityGroupSection({
  items,
  todayIso,
  onActivityClick,
}: InactiveActivityGroupSectionProps) {
  const [open, setOpen] = useState(false);

  const renderItem = useCallback(
    (activity: Activity) => (
      <ActivityListCard
        activity={activity}
        todayIso={todayIso}
        onClick={onActivityClick ? () => onActivityClick(activity) : undefined}
      />
    ),
    [onActivityClick, todayIso],
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <details
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="group/inactive border-t border-[var(--color-border)]"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3 text-[11px] leading-tight [color:var(--color-fg-muted)] marker:content-none [&::-webkit-details-marker]:hidden">
        <span>Inactive</span>
        <ChevronDown
          className="h-4 w-4 shrink-0 transition-transform duration-200 group-open/inactive:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="pb-1 pt-3">
        <ListView
          layout="list"
          items={items}
          renderItem={renderItem}
          getKey={getActivityKey}
        />
      </div>
    </details>
  );
}

/**
 * Renders active (`active` + `upcoming`) expanded on top and inactive
 * (`expired` + `archived`) collapsed below.
 */
export const ActivityGroups = memo(function ActivityGroups({
  activities,
  todayIso: todayIsoProp,
  activeEmptyLabel = "No active tasks",
  onActivityClick,
}: ActivityGroupsProps) {
  const todayIso = todayIsoProp ?? getTodayIsoDate();

  const { active, inactive } = useMemo(
    () => groupActivities(activities, todayIso),
    [activities, todayIso],
  );

  return (
    <div className="flex flex-col">
      <ActivityGroupSection
        title="Active"
        items={active}
        todayIso={todayIso}
        emptyText={activeEmptyLabel}
        onActivityClick={onActivityClick}
      />
      <InactiveActivityGroupSection
        items={inactive}
        todayIso={todayIso}
        onActivityClick={onActivityClick}
      />
    </div>
  );
});
