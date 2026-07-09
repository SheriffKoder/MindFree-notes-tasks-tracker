/**
 * @file shared/view-switcher/lib/note-views-config.ts
 * Notes page view ids, labels, icons, and defaults.
 */

import { CalendarDays, FileText, List, type LucideIcon } from "lucide-react";

/**
 * Supported Notes page view identifiers (URL `?view=` values).
 */
export type NotesViewId = "calendar" | "month-notes" | "general-notes";

/**
 * Configuration for a single Notes page view mode.
 */
export interface NotesViewDefinition {
  /** URL search param value. */
  id: NotesViewId;
  /** Short label shown below the mobile icon. */
  label: string;
  /** Hover tooltip describing the view (desktop) or next cycle target (mobile). */
  title: string;
  /** Icon shown in the view switcher. */
  icon: LucideIcon;
}

/**
 * Ordered list of Notes page views (mobile cycle follows this order).
 */
export const NOTE_VIEWS: readonly NotesViewDefinition[] = [
  {
    id: "calendar",
    label: "Calendar",
    title: "Calendar view",
    icon: CalendarDays,
  },
  {
    id: "month-notes",
    label: "Month",
    title: "Month notes",
    icon: List,
  },
  {
    id: "general-notes",
    label: "General",
    title: "General notes",
    icon: FileText,
  },
] as const;

/** Default view when `?view=` is missing or invalid. */
export const DEFAULT_NOTES_VIEW: NotesViewId = "calendar";
