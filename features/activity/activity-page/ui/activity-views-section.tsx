/**
 * @file features/activity/activity-page/ui/activity-views-section.tsx
 * Activity page views container — owns query calls and mounts calendar/list panes.
 */

"use client";

import { memo } from "react";

import type { Activity, ActivityKind, ActivityRecord } from "@/entities/activity";
import {
  useActivitiesQuery,
  useActivityRecordsQuery,
} from "@/entities/activity/client";
import type { ActivityPageCopy } from "@/features/activity/activity-page/lib/activity-page-copy";
import type { ActivityViewId } from "@/features/activity/activity-page/lib/activity-views";
import {
  resolveViewQueryState,
  type ViewQueryState,
} from "@/features/activity/activity-page/lib/resolve-view-query-state";
import { ActivityCalendarPane } from "@/features/activity/activity-page/ui/activity-calendar-pane";
import { ActivityListPane } from "@/features/activity/activity-page/ui/activity-list-pane";
import { cn } from "@/lib/utils";
import { QueryStatePanel } from "@/shared/react-query";

export interface ActivityViewsSectionProps {
  kind: ActivityKind;
  month: string;
  view: ActivityViewId;
  copy: ActivityPageCopy;
  /** In-month highlight for the calendar grid (from page selection hook). */
  highlightedDate?: string;
  /** Snaps page selection to the clicked calendar day. */
  onDaySelect: (date: string) => void;
  /** Opens the config drawer for a list card. */
  onActivityClick?: (activity: Activity) => void;
}

interface CalendarPaneContentProps {
  month: string;
  activities: Activity[];
  records: ActivityRecord[];
  highlightedDate?: string;
  onDaySelect: (date: string) => void;
  queryState: ViewQueryState;
}

function CalendarPaneContent({
  month,
  activities,
  records,
  highlightedDate,
  onDaySelect,
  queryState,
}: CalendarPaneContentProps) {
  if (queryState.kind !== "ready") {
    return (
      <QueryStatePanel
        message={queryState.message}
        variant={queryState.kind}
      />
    );
  }

  return (
    <ActivityCalendarPane
      month={month}
      activities={activities}
      records={records}
      highlightedDate={highlightedDate}
      onDaySelect={onDaySelect}
    />
  );
}

interface ListPaneContentProps {
  activities: Activity[];
  queryState: ViewQueryState;
  onActivityClick?: (activity: Activity) => void;
}

function ListPaneContent({
  activities,
  queryState,
  onActivityClick,
}: ListPaneContentProps) {
  if (queryState.kind !== "ready") {
    return (
      <QueryStatePanel
        message={queryState.message}
        variant={queryState.kind}
      />
    );
  }

  return (
    <ActivityListPane
      activities={activities}
      onActivityClick={onActivityClick}
    />
  );
}

/**
 * Fetches activities + records, resolves per-pane query state, and renders the
 * responsive calendar/list body.
 *
 * Memoized so drawer open/close in the page client does not re-render the
 * calendar/list tree — props stay stable across that update.
 */
export const ActivityViewsSection = memo(function ActivityViewsSection({
  kind,
  month,
  view,
  copy,
  highlightedDate,
  onDaySelect,
  onActivityClick,
}: ActivityViewsSectionProps) {
  const activitiesQuery = useActivitiesQuery(kind);
  const recordsQuery = useActivityRecordsQuery(month);

  const queryMessages = {
    activitiesError: copy.loadActivitiesError,
    activitiesLoading: copy.loadActivitiesLoading,
    recordsError: copy.loadRecordsError,
    recordsLoading: copy.loadRecordsLoading,
  };

  const calendarQueryState = resolveViewQueryState(
    "calendar",
    activitiesQuery,
    recordsQuery,
    queryMessages,
  );
  const listQueryState = resolveViewQueryState(
    "list",
    activitiesQuery,
    recordsQuery,
    queryMessages,
  );

  const activities = activitiesQuery.data?.activities ?? [];
  const records = recordsQuery.data?.records ?? [];

  return (
    <>
      {view === "list" ? (
        <section
          aria-label={copy.listAriaLabel}
          className="flex min-h-0 flex-1 flex-col md:hidden"
        >
          <ListPaneContent
            activities={activities}
            queryState={listQueryState}
            onActivityClick={onActivityClick}
          />
        </section>
      ) : null}

      <section
        aria-label={copy.calendarAriaLabel}
        className={cn(
          view === "calendar"
            ? "flex h-full min-h-[600px] flex-col"
            : "hidden md:flex md:h-full md:min-h-[600px] md:flex-col",
        )}
      >
        <div className="flex h-full min-h-0 flex-row gap-4">
          <div className="h-full min-h-0 min-w-0 flex-1 overflow-x-auto">
            <CalendarPaneContent
              month={month}
              activities={activities}
              records={records}
              highlightedDate={highlightedDate}
              onDaySelect={onDaySelect}
              queryState={calendarQueryState}
            />
          </div>

          <div
            aria-label={copy.listAriaLabel}
            className="hidden h-full min-h-0 w-[30vw] max-w-[400px] shrink-0 flex-col overflow-hidden md:flex"
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-4">
              <ListPaneContent
                activities={activities}
                queryState={listQueryState}
                onActivityClick={onActivityClick}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
});
