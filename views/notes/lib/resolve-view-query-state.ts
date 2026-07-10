/**
 * @file views/notes/lib/resolve-view-query-state.ts
 * Maps the active notes view to a loading or error state when query data is unavailable.
 */

import type {
  CalendarNotesResponse,
  GeneralNotesResponse,
} from "@/entities/note";
import type { QueryStatePanelVariant } from "@/shared/react-query";
import type { NotesViewId } from "@/shared/view-switcher";

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

const GENERAL_NOTES_VIEW_MESSAGES = {
  error: "Could not load general notes.",
  loading: "Loading general notes…",
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

  if (view === "general-notes") {
    if (general.isError) {
      return { kind: "error", message: GENERAL_NOTES_VIEW_MESSAGES.error };
    }

    if (general.isPending && !general.data) {
      return { kind: "loading", message: GENERAL_NOTES_VIEW_MESSAGES.loading };
    }
  }

  return { kind: "ready" };
}
