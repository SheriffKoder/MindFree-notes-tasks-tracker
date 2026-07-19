/**
 * @file features/activity/activity-page/lib/resolve-view-query-state.ts
 * Maps the active activity view to a loading or error state when query data is unavailable.
 */

import type {
  ActivitiesResponse,
  ActivityRecordsResponse,
} from "@/entities/activity";
import type { ActivityViewId } from "@/features/activity/activity-page/lib/activity-views";
import type { QueryStatePanelVariant } from "@/shared/react-query";

interface QuerySlice<TData> {
  data: TData | undefined;
  isPending: boolean;
  isError: boolean;
}

export type ViewQueryState =
  | { kind: "ready" }
  | { kind: QueryStatePanelVariant; message: string };

export interface ViewQueryMessages {
  activitiesError: string;
  activitiesLoading: string;
  recordsError: string;
  recordsLoading: string;
}

/**
 * Returns a blocking loading/error state for the active view, or `ready` when data can render.
 */
export function resolveViewQueryState(
  view: ActivityViewId,
  activities: QuerySlice<ActivitiesResponse>,
  records: QuerySlice<ActivityRecordsResponse>,
  messages: ViewQueryMessages,
): ViewQueryState {
  if (view === "calendar") {
    if (activities.isError) {
      return { kind: "error", message: messages.activitiesError };
    }

    if (activities.isPending && !activities.data) {
      return {
        kind: "loading",
        message: messages.activitiesLoading,
      };
    }

    if (records.isError) {
      return { kind: "error", message: messages.recordsError };
    }

    if (records.isPending && !records.data) {
      return {
        kind: "loading",
        message: messages.recordsLoading,
      };
    }

    return { kind: "ready" };
  }

  if (activities.isError) {
    return { kind: "error", message: messages.activitiesError };
  }

  if (activities.isPending && !activities.data) {
    return { kind: "loading", message: messages.activitiesLoading };
  }

  return { kind: "ready" };
}
