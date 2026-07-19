/**
 * @file views/tasks/ui/tasks-views-section.tsx
 * Tasks page views container — owns query calls and mounts calendar/list panes.
 */

"use client";

import { memo } from "react";

import type { Activity, ActivityRecord } from "@/entities/activity";
import {
  useActivitiesQuery,
  useActivityRecordsQuery,
} from "@/entities/activity/client";
import { cn } from "@/lib/utils";
import { QueryStatePanel } from "@/shared/react-query";
import {
  resolveViewQueryState,
  type ViewQueryState,
} from "@/views/tasks/lib/resolve-view-query-state";
import type { TasksViewId } from "@/views/tasks/lib/tasks-views";
import { TasksCalendarPane } from "@/views/tasks/ui/tasks-calendar-pane";
import { TasksListPane } from "@/views/tasks/ui/tasks-list-pane";

export interface TasksViewsSectionProps {
  month: string;
  view: TasksViewId;
  /** In-month highlight for the calendar grid (from page selection hook). */
  highlightedDate?: string;
  /** Snaps page selection to the clicked calendar day. */
  onDaySelect: (date: string) => void;
  /** Opens the config drawer for a list card (Step 11). */
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
    <TasksCalendarPane
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
    <TasksListPane
      activities={activities}
      onActivityClick={onActivityClick}
    />
  );
}

/**
 * Fetches activities + records, resolves per-pane query state, and renders the
 * responsive calendar/list body (mirrors Notes calendar + sidebar layout).
 *
 * Memoized so drawer open/close in TasksClient (useTasksDrawer state) does not
 * re-render the calendar/list tree — props stay stable across that update.
 */
export const TasksViewsSection = memo(function TasksViewsSection({
  month,
  view,
  highlightedDate,
  onDaySelect,
  onActivityClick,
}: TasksViewsSectionProps) {
  const activitiesQuery = useActivitiesQuery("task");
  const recordsQuery = useActivityRecordsQuery(month);

  const calendarQueryState = resolveViewQueryState(
    "calendar",
    activitiesQuery,
    recordsQuery,
  );
  const listQueryState = resolveViewQueryState(
    "list",
    activitiesQuery,
    recordsQuery,
  );

  const activities = activitiesQuery.data?.activities ?? [];
  const records = recordsQuery.data?.records ?? [];

  return (
    <>
      {/* Mobile list — full width; desktop uses the sidebar below. */}
      {view === "list" ? (
        <section
          aria-label="Tasks list"
          className="flex min-h-0 flex-1 flex-col md:hidden"
        >
          <ListPaneContent
            activities={activities}
            queryState={listQueryState}
            onActivityClick={onActivityClick}
          />
        </section>
      ) : null}

      {/* Calendar + desktop sidebar — mobile calendar scrolls horizontally. */}
      <section
        aria-label="Tasks calendar"
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
            aria-label="Tasks list"
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
