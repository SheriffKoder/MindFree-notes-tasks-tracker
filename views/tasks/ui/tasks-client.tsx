/**
 * @file views/tasks/ui/tasks-client.tsx
 * Client boundary for the Tasks page — layout, URL state, and controls.
 *
 * Step 8 scope: header + toolbar (month nav, task filter, add) wired to state,
 * plus the responsive body shell. Desktop shows calendar + list side by side
 * (no view switcher); mobile toggles between them via the mobile switcher.
 *
 * The calendar/list panes land in Step 9. Re-render isolation contract: the
 * calendar pane reads useTasksFilter (re-renders on filter change); the list
 * pane must stay a NON-consumer so toggling the filter never re-renders it.
 */

"use client";

import { useActivitiesQuery } from "@/entities/activity/client";
import { cn } from "@/lib/utils";
import { MonthNavigator } from "@/shared/month-navigator";
import { ViewSwitcherMobile } from "@/shared/view-switcher";
import { TASKS_VIEW_CONFIG } from "@/views/tasks/lib/tasks-views";
import { TasksFilterProvider } from "@/views/tasks/model/tasks-filter-context";
import { useTasksUrlState } from "@/views/tasks/model/use-tasks-url-state";
import { TasksAddButton } from "@/views/tasks/ui/tasks-add-button";
import { TasksFilter } from "@/views/tasks/ui/tasks-filter";
import { useCallback } from "react";

/**
 * Renders the Tasks page shell with month/filter controls and a responsive
 * calendar + list body (side by side on desktop, toggled on mobile).
 */
export function TasksClient() {
  // useTasksUrlState is used to get the month, view, and navigation functions
  const { month, view, previousMonth, nextMonth, cycleView } =
    useTasksUrlState();

  // useActivitiesQuery is used to get the tasks
  const { data } = useActivitiesQuery("task");

  // data?.activities is an array of tasks, if there are no tasks, it will be an empty array
  const tasks = data?.activities ?? [];

  // useCallback is used to memoize the handleAddTask function so it doesn't get recreated on every render
  const handleAddTask = useCallback(() => {
    // Config drawer arrives in Step 11; the toolbar seam is ready now.
  }, []);

  return (
    // TasksFilterProvider is to isolate the tasks filtering to the calendar only not re-rendering the list
    // as the filter is a top level not with the calendar itself.
    <TasksFilterProvider>
      <div className="mx-auto flex h-full w-full flex-col gap-4">
        <section className="flex shrink-0 flex-col gap-2">
          <h2 className="text-h2">Tasks</h2>
          <p className="page-header__subtitle">
            Browse scheduled tasks by month. Configure a task, then track its
            completion.
          </p>
        </section>

        <section
          aria-label="Tasks controls"
          className="flex shrink-0 flex-row items-center justify-between gap-3"
        >
          <MonthNavigator
            className="min-w-0 flex-1"
            month={month}
            onPrevious={previousMonth}
            onNext={nextMonth}
          />
          <div className="flex shrink-0 items-center gap-2">
            <TasksFilter tasks={tasks} />
            <ViewSwitcherMobile
              className="flex md:hidden"
              config={TASKS_VIEW_CONFIG}
              view={view}
              onCycleView={cycleView}
            />
            <TasksAddButton onClick={handleAddTask} />
          </div>
        </section>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-2">
          {/* Calendar pane (Step 9) — the filter consumer. Mobile: shown when view=calendar. */}
          <section
            aria-label="Tasks calendar"
            className={cn(
              "min-h-0 flex-col overflow-auto",
              view === "calendar" ? "flex" : "hidden",
              "md:flex",
            )}
          >
            {/* Calendar mounts here in Step 9 and reads useTasksFilter() to filter records by selected tasks */}
          </section>

          {/* List pane (Step 9) — NOT a filter consumer; stays stable. Mobile: shown when view=list. */}
          <section
            aria-label="Tasks list"
            className={cn(
              "min-h-0 flex-col overflow-auto",
              view === "list" ? "flex" : "hidden",
              "md:flex",
            )}
          >
            {/* Activity list mounts here in Step 9. */}
          </section>
        </div>
      </div>
    </TasksFilterProvider>
  );
}
