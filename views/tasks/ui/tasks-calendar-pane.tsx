/**
 * @file views/tasks/ui/tasks-calendar-pane.tsx
 * Tasks calendar pane — filter consumer; builds day rows and renders MonthCalendar.
 */

"use client";

import { useCallback, useMemo } from "react";

import type { Activity, ActivityRecord, TaskCalendarDay } from "@/entities/activity";
import {
  buildRecordLookup,
  buildTaskCalendarDays,
  computeTaskMonthProgress,
} from "@/entities/activity";
import { ActivityCalendarCell } from "@/features/activity/activity-calendar-cell";
import { MonthCalendar, type CalendarCellRenderContext } from "@/shared/calendar";
import { isDayActivityShown } from "@/views/tasks/lib/task-filter";
import { useTasksFilter } from "@/views/tasks/model/tasks-filter-context";

export interface TasksCalendarPaneProps {
  month: string;
  activities: Activity[];
  records: ActivityRecord[];
  /** In-month highlight for the calendar grid. */
  highlightedDate?: string;
  /** Snaps page selection to the clicked day (drawer wiring lands in Step 11). */
  onDaySelect: (date: string) => void;
}

/**
 * Joins definitions + records, applies the task filter, and renders the month grid.
 * Subscribes to {@link useTasksFilter} — do not mount inside the list pane subtree.
 */
export function TasksCalendarPane({
  month,
  activities,
  records,
  highlightedDate,
  onDaySelect,
}: TasksCalendarPaneProps) {
  const { isShown, showIncomplete } = useTasksFilter();

  const recordLookup = useMemo(() => buildRecordLookup(records), [records]);

  const progressByTaskId = useMemo(
    () => computeTaskMonthProgress(month, activities, recordLookup),
    [month, activities, recordLookup],
  );

  const calendarDays = useMemo(() => {
    const days = buildTaskCalendarDays(month, activities, recordLookup);

    return days.map((day) => ({
      ...day,
      activities: day.activities.filter(
        ({ activity, record }) =>
          isShown(activity.id) &&
          isDayActivityShown(activity, record, showIncomplete),
      ),
    }));
  }, [month, activities, recordLookup, isShown, showIncomplete]);

  const renderCalendarCell = useCallback(
    (day: TaskCalendarDay, { isToday }: CalendarCellRenderContext) => (
      <ActivityCalendarCell
        day={day}
        progressByTaskId={progressByTaskId}
        isToday={isToday}
        isSelected={highlightedDate === day.date}
      />
    ),
    [highlightedDate, progressByTaskId],
  );

  return (
    <MonthCalendar
      className="h-full min-h-[600px] w-full min-w-[42rem] md:min-w-0"
      month={month}
      calendarDays={calendarDays}
      selectedDate={highlightedDate}
      onDaySelect={onDaySelect}
      renderCell={renderCalendarCell}
    />
  );
}
