/**
 * @file views/notes/lib/resolve-view-query-state.ts
 * Maps the active notes view to a loading or error state when query data is unavailable.
 *
 * Purpose: Block the pane with QueryStatePanel until the owning query is ready.
 * Used in: views/notes/ui/notes-views-section.tsx
 * Used for: Calendar / month / category:<id> undated lists.
 */

import type {
  CalendarNotesResponse,
  GeneralNotesResponse,
} from "@/entities/note";
import type { QueryStatePanelVariant } from "@/shared/react-query";
import {
  isCategoryNotesView,
  type NotesViewId,
} from "@/views/notes/lib/notes-views";

interface QuerySlice<TData> {
  data: TData | undefined;
  isPending: boolean;
  isError: boolean;
}

export type ViewQueryState =
  | { kind: "ready" }
  | { kind: QueryStatePanelVariant; message: string };

const CALENDAR_VIEW_MESSAGES = {
  error: "Could not load calendar notes.",
  loading: "Loading calendar…",
} as const;

const MONTH_NOTES_VIEW_MESSAGES = {
  error: "Could not load month notes.",
  loading: "Loading month notes…",
} as const;

const CATEGORY_NOTES_VIEW_MESSAGES = {
  error: "Could not load category notes.",
  loading: "Loading notes…",
} as const;

/**
 * Returns a blocking loading/error state for the active view, or `ready` when data can render.
 */
export function resolveViewQueryState(
  view: NotesViewId,
  calendar: QuerySlice<CalendarNotesResponse>,
  general: QuerySlice<GeneralNotesResponse>,
): ViewQueryState {
  if (view === "calendar") {
    if (calendar.isError) {
      return { kind: "error", message: CALENDAR_VIEW_MESSAGES.error };
    }

    if (calendar.isPending && !calendar.data) {
      return { kind: "loading", message: CALENDAR_VIEW_MESSAGES.loading };
    }

    return { kind: "ready" };
  }

  if (view === "month-notes") {
    if (calendar.isError) {
      return { kind: "error", message: MONTH_NOTES_VIEW_MESSAGES.error };
    }

    if (calendar.isPending && !calendar.data) {
      return { kind: "loading", message: MONTH_NOTES_VIEW_MESSAGES.loading };
    }

    return { kind: "ready" };
  }

  // Undated category panes — same loading gate as former general-notes
  if (isCategoryNotesView(view)) {
    if (general.isError) {
      return { kind: "error", message: CATEGORY_NOTES_VIEW_MESSAGES.error };
    }

    if (general.isPending && !general.data) {
      return { kind: "loading", message: CATEGORY_NOTES_VIEW_MESSAGES.loading };
    }
  }

  return { kind: "ready" };
}
