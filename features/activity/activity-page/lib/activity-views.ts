/**
 * @file features/activity/activity-page/lib/activity-views.ts
 * Activity page view ids and view-switcher factory.
 */

import { CalendarDays, List } from "lucide-react";

import type { ViewConfig } from "@/shared/view-switcher";

/** Supported activity-page view identifiers (URL `?view=` values). */
export type ActivityViewId = "calendar" | "list";

/**
 * Builds the view-switcher config for one activity-page mount.
 */
export function buildActivityViewConfig(
  ariaLabel: string,
  listTitle: string,
): ViewConfig<ActivityViewId> {
  return {
    ariaLabel,
    defaultView: "calendar",
    views: [
      {
        id: "calendar",
        label: "Calendar",
        title: "Calendar view",
        icon: CalendarDays,
      },
      {
        id: "list",
        label: "List",
        title: listTitle,
        icon: List,
      },
    ],
  };
}
