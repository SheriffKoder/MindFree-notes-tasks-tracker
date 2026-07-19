/**
 * @file features/activity/activity-page/lib/activity-page-copy.ts
 * Kind-aware copy for the shared activity page shell.
 */

import type { ActivityKind } from "@/entities/activity/model/types";

/** Page-owned title/subtitle plus derived aria and loading strings. */
export interface ActivityPageCopy {
  title: string;
  subtitle: string;
  controlsAriaLabel: string;
  calendarAriaLabel: string;
  listAriaLabel: string;
  addAriaLabel: string;
  filterAriaLabel: string;
  filterShowLabel: string;
  filterEmptyLabel: string;
  filterShowAllLabel: string;
  viewAriaLabel: string;
  viewListTitle: string;
  loadActivitiesError: string;
  loadActivitiesLoading: string;
  loadRecordsError: string;
  loadRecordsLoading: string;
}

/**
 * Builds display/aria copy for one activity-page mount.
 */
export function buildActivityPageCopy(
  kind: ActivityKind,
  title: string,
  subtitle: string,
): ActivityPageCopy {
  const singular = kind === "task" ? "task" : "reminder";
  const plural = kind === "task" ? "tasks" : "reminders";
  const Singular = kind === "task" ? "Task" : "Reminder";

  return {
    title,
    subtitle,
    controlsAriaLabel: `${title} controls`,
    calendarAriaLabel: `${title} calendar`,
    listAriaLabel: `${title} list`,
    addAriaLabel: `Add ${singular}`,
    filterAriaLabel: `Filter calendar by ${singular}`,
    filterShowLabel: `Show ${plural}`,
    filterEmptyLabel: `No ${plural} yet`,
    filterShowAllLabel: `Show all ${plural}`,
    viewAriaLabel: `${title} view`,
    viewListTitle: `${Singular} list`,
    loadActivitiesError: `Could not load ${plural}.`,
    loadActivitiesLoading: `Loading ${plural}…`,
    loadRecordsError: `Could not load ${singular} records.`,
    loadRecordsLoading: `Loading ${singular} records…`,
  };
}
