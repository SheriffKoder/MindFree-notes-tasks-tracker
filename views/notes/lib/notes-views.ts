/**
 * @file views/notes/lib/notes-views.ts
 * Notes page view ids and view-switcher config.
 *
 * Owned by the Notes view slice so page-specific view business logic stays out
 * of `shared/` (project-structure §4). Consumed by the generic
 * `shared/view-switcher`.
 */

import { CalendarDays, FileText, List } from "lucide-react";

import type { ViewConfig } from "@/shared/view-switcher";

/** Supported Notes page view identifiers (URL `?view=` values). */
export type NotesViewId = "calendar" | "month-notes" | "general-notes";

/** Notes page view-switcher configuration. */
export const NOTES_VIEW_CONFIG: ViewConfig<NotesViewId> = {
  ariaLabel: "Notes view",
  defaultView: "calendar",
  views: [
    { id: "calendar", label: "Calendar", title: "Calendar view", icon: CalendarDays },
    {
      id: "month-notes",
      label: "Month",
      title: "Month notes",
      icon: List,
      desktopClassName: "xl:hidden",
    },
    {
      id: "general-notes",
      label: "General",
      title: "General notes",
      icon: FileText,
    },
  ],
};
