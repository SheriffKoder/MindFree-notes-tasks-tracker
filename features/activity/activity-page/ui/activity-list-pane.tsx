/**
 * @file features/activity/activity-page/ui/activity-list-pane.tsx
 * Activity list pane — NOT a filter consumer; stays stable when the filter toggles.
 */

"use client";

import { memo } from "react";

import type { Activity } from "@/entities/activity";
import { ActivityGroups } from "@/features/activity/activity-groups";

export interface ActivityListPaneProps {
  activities: Activity[];
  /** Empty-state copy for the Active section (kind-aware from the page). */
  activeEmptyLabel: string;
  /** Opens the config drawer for an activity. */
  onActivityClick?: (activity: Activity) => void;
}

/**
 * Renders active/inactive activity groups from definitions only (no record data).
 */
export const ActivityListPane = memo(function ActivityListPane({
  activities,
  activeEmptyLabel,
  onActivityClick,
}: ActivityListPaneProps) {
  return (
    <ActivityGroups
      activities={activities}
      activeEmptyLabel={activeEmptyLabel}
      onActivityClick={onActivityClick}
    />
  );
});
