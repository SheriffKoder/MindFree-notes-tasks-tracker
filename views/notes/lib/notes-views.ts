/**
 * @file views/notes/lib/notes-views.ts
 * Notes page view ids and view-switcher config builders.
 *
 * Owned by the Notes view slice so page-specific view business logic stays out
 * of `shared/` (project-structure §4). Consumed by the generic
 * `shared/view-switcher`.
 *
 * Views:
 * - `calendar` / `month-notes` — static
 * - `category:<uuid>` — undated list for one active category
 * - legacy `general-notes` — remapped to Diary `category:<id>` for one release
 */

import { CalendarDays, FileText, List } from "lucide-react";

import type { ViewConfig } from "@/shared/view-switcher";

/** Supported Notes page view identifiers (URL `?view=` values). */
export type NotesViewId =
  | "calendar"
  | "month-notes"
  | `category:${string}`;

/** Minimal category shape needed to build switcher entries. */
export interface NotesViewCategory {
  id: string;
  name: string;
  isDefault?: boolean;
}

/**
 * Builds the Notes view-switcher config from active categories.
 *
 * Calendar + month stay static; each active category becomes `category:<id>`.
 */
export function buildNotesViewConfig(
  categories: NotesViewCategory[],
): ViewConfig<NotesViewId> {
  return {
    ariaLabel: "Notes view",
    defaultView: "calendar",
    views: [
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
        desktopClassName: "xl:hidden",
      },
      // One undated pane per active category (Diary first via sortOrder upstream)
      ...categories.map((category) => ({
        id: `category:${category.id}` as const,
        label: category.name,
        title: `${category.name} notes`,
        icon: FileText,
      })),
    ],
  };
}

/**
 * Extracts the category uuid from a `category:<uuid>` view id.
 *
 * @returns category id, or null when the view is not a category pane
 */
export function parseCategoryViewId(view: NotesViewId): string | null {
  if (!view.startsWith("category:")) {
    return null;
  }

  const categoryId = view.slice("category:".length);
  return categoryId.length > 0 ? categoryId : null;
}

/**
 * True when the active view is an undated category list.
 */
export function isCategoryNotesView(
  view: string,
): view is `category:${string}` {
  return view.startsWith("category:") && view.length > "category:".length;
}

/**
 * Maps legacy `general-notes` URL values onto the Diary category view.
 *
 * @param rawView - raw `?view=` search param
 * @param categories - active categories (needs `isDefault` for Diary)
 * @returns normalized param for {@link parseViewParam}, or the original value
 */
export function normalizeNotesViewParam(
  rawView: string | null | undefined,
  categories: Array<{ id: string; isDefault?: boolean }>,
): string | undefined {
  if (!rawView) {
    return undefined;
  }

  // One-release alias: old bookmarks → Diary category pane
  if (rawView === "general-notes") {
    const diary =
      categories.find((category) => category.isDefault) ?? categories[0];

    return diary ? `category:${diary.id}` : undefined;
  }

  return rawView;
}

/**
 * Static fallback used before categories hydrate (calendar + month only).
 * Prefer {@link buildNotesViewConfig} once categories are available.
 */
export const NOTES_VIEW_CONFIG: ViewConfig<NotesViewId> = buildNotesViewConfig(
  [],
);
