/**
 * @file views/tasks/ui/tasks-list-pane.tsx
 * Tasks list pane — NOT a filter consumer; stays stable when the filter toggles.
 */

"use client";

import { memo } from "react";

import type { Activity } from "@/entities/activity";
import { ActivityGroups } from "@/features/activity/activity-groups";

export interface TasksListPaneProps {
  activities: Activity[];
  /** Opens the config drawer for a task (Step 11). */
  onActivityClick?: (activity: Activity) => void;
}

/**
 * Renders active/inactive activity groups from definitions only (no record data).
 */
export const TasksListPane = memo(function TasksListPane({
  activities,
  onActivityClick,
}: TasksListPaneProps) {
  return (
    <ActivityGroups activities={activities} onActivityClick={onActivityClick} />
  );
});
