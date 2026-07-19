/**
 * @file views/tasks/lib/resolve-view-query-state.ts
 * Maps the active tasks view to a loading or error state when query data is unavailable.
 */

import type {
  ActivitiesResponse,
  ActivityRecordsResponse,
} from "@/entities/activity";
import type { QueryStatePanelVariant } from "@/shared/react-query";
import type { TasksViewId } from "@/views/tasks/lib/tasks-views";

interface QuerySlice<TData> {
  data: TData | undefined;
  isPending: boolean;
  isError: boolean;
}

export type ViewQueryState =
  | { kind: "ready" }
  | { kind: QueryStatePanelVariant; message: string };

const CALENDAR_VIEW_MESSAGES = {
  activitiesError: "Could not load tasks.",
  activitiesLoading: "Loading tasks…",
  recordsError: "Could not load task records.",
  recordsLoading: "Loading task records…",
} as const;

const LIST_VIEW_MESSAGES = {
  error: "Could not load tasks.",
  loading: "Loading tasks…",
} as const;

/**
 * Returns a blocking loading/error state for the active view, or `ready` when data can render.
 */
export function resolveViewQueryState(
  view: TasksViewId,
  activities: QuerySlice<ActivitiesResponse>,
  records: QuerySlice<ActivityRecordsResponse>,
): ViewQueryState {
  if (view === "calendar") {
    if (activities.isError) {
      return { kind: "error", message: CALENDAR_VIEW_MESSAGES.activitiesError };
    }

    if (activities.isPending && !activities.data) {
      return {
        kind: "loading",
        message: CALENDAR_VIEW_MESSAGES.activitiesLoading,
      };
    }

    if (records.isError) {
      return { kind: "error", message: CALENDAR_VIEW_MESSAGES.recordsError };
    }

    if (records.isPending && !records.data) {
      return {
        kind: "loading",
        message: CALENDAR_VIEW_MESSAGES.recordsLoading,
      };
    }

    return { kind: "ready" };
  }

  if (activities.isError) {
    return { kind: "error", message: LIST_VIEW_MESSAGES.error };
  }

  if (activities.isPending && !activities.data) {
    return { kind: "loading", message: LIST_VIEW_MESSAGES.loading };
  }

  return { kind: "ready" };
}
