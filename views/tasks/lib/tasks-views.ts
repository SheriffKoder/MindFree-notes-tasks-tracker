/**
 * @file views/tasks/lib/tasks-views.ts
 * Tasks page view ids and view-switcher config.
 *
 * Owned by the Tasks view slice (each page owns its view config); consumed by
 * the generic `shared/view-switcher`.
 */

import { CalendarDays, List } from "lucide-react";

import type { ViewConfig } from "@/shared/view-switcher";

/** Supported Tasks page view identifiers (URL `?view=` values). */
export type TasksViewId = "calendar" | "list";

/** Tasks page view-switcher configuration. */
export const TASKS_VIEW_CONFIG: ViewConfig<TasksViewId> = {
  ariaLabel: "Tasks view",
  defaultView: "calendar",
  views: [
    { id: "calendar", label: "Calendar", title: "Calendar view", icon: CalendarDays },
    { id: "list", label: "List", title: "Task list", icon: List },
  ],
};
