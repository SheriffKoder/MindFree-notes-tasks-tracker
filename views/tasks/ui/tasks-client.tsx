/**
 * @file views/tasks/ui/tasks-client.tsx
 * Client boundary for the Tasks page — layout, URL state, and controls.
 *
 * Step 9: calendar + list panes wired via TasksViewsSection. Re-render isolation:
 * the calendar pane reads useTasksFilter (re-renders on filter change); the list
 * pane must stay a NON-consumer so toggling the filter never re-renders it.
 * Step 11: config drawer open/close from add button + list card clicks.
 * TasksViewsSection is memoized so drawer state updates don't re-render the
 * calendar/list tree (handlers/props stay stable across open/close).
 */

"use client";

import { useCallback } from "react";

import type { Activity } from "@/entities/activity";
import { useActivitiesQuery } from "@/entities/activity/client";
import { ActivityDrawer } from "@/features/activity/activity-drawer";
import { MonthNavigator } from "@/shared/month-navigator";
import { ViewSwitcherMobile } from "@/shared/view-switcher";
import { TASKS_VIEW_CONFIG } from "@/views/tasks/lib/tasks-views";
import { TasksFilterProvider } from "@/views/tasks/model/tasks-filter-context";
import { useTasksDrawer } from "@/views/tasks/model/use-tasks-drawer";
import { useTasksPageSelection } from "@/views/tasks/model/use-tasks-page-selection";
import { useTasksUrlState } from "@/views/tasks/model/use-tasks-url-state";
import { TasksAddButton } from "@/views/tasks/ui/tasks-add-button";
import { TasksFilter } from "@/views/tasks/ui/tasks-filter";
import { TasksViewsSection } from "@/views/tasks/ui/tasks-views-section";

/**
 * Renders the Tasks page shell with month/filter controls and a responsive
 * calendar + list body (side by side on desktop, toggled on mobile).
 */
export function TasksClient() {
  const { month, view, previousMonth, nextMonth, cycleView } =
    useTasksUrlState();

  const { highlightedDate, selectDate, clearSelection } =
    useTasksPageSelection(month);

  const drawer = useTasksDrawer();

  const { data } = useActivitiesQuery("task");
  const tasks = data?.activities ?? [];

  const handleAddTask = useCallback(() => {
    clearSelection();
    drawer.openCreate();
  }, [clearSelection, drawer.openCreate]);

  const handleActivityClick = useCallback(
    (activity: Activity) => {
      drawer.openEdit(activity.id);
    },
    [drawer.openEdit],
  );

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

        <div className="relative min-h-0 flex-1">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-[-10] z-10 h-8 w-full bg-gradient-to-b from-[var(--color-bg)] to-transparent"
          />
          <div className="flex h-full min-h-0 flex-col overflow-x-auto overflow-y-auto pt-4 md:pt-5">
            <div className="min-h-0 flex-1">
              <TasksViewsSection
                month={month}
                view={view}
                highlightedDate={highlightedDate}
                onDaySelect={selectDate}
                onActivityClick={handleActivityClick}
              />
            </div>
          </div>
        </div>

        <ActivityDrawer drawer={drawer} onDismiss={clearSelection} />
      </div>
    </TasksFilterProvider>
  );
}
