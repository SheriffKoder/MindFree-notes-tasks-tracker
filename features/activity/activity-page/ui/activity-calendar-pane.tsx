/**
 * @file features/activity/activity-page/ui/activity-calendar-pane.tsx
 * Activity calendar pane — filter consumer; builds day rows and renders MonthCalendar.
 */

"use client";

import { useCallback, useEffect, useMemo } from "react";

import type { Activity, ActivityRecord, TaskCalendarDay } from "@/entities/activity";
import {
  buildRecordLookup,
  buildTaskCalendarDays,
} from "@/entities/activity";
import {
  ActivityCalendarCell,
  ActivityCalendarHoverContent,
  activityCalendarDayHasHoverContent,
} from "@/features/activity/activity-calendar-cell";
import { isDayActivityShown } from "@/features/activity/activity-page/lib/activity-filter";
import { useActivityFilter } from "@/features/activity/activity-page/model/activity-filter-context";
import {
  CalendarCursorTooltip,
  MonthCalendar,
  clearCalendarHover,
  moveCalendarHoverPointer,
  scheduleClearCalendarHover,
  setCalendarHoverFollowing,
  type CalendarCellRenderContext,
  type CalendarDayHoverPoint,
} from "@/shared/calendar";

export interface ActivityCalendarPaneProps {
  month: string;
  activities: Activity[];
  records: ActivityRecord[];
  /** In-month highlight for the calendar grid. */
  highlightedDate?: string;
  /** Snaps page selection to the clicked day. */
  onDaySelect: (date: string) => void;
}

/**
 * Joins definitions + records, applies the filter, and renders the month grid.
 * Subscribes to {@link useActivityFilter} — do not mount inside the list pane.
 */
export function ActivityCalendarPane({
  month,
  activities,
  records,
  highlightedDate,
  onDaySelect,
}: ActivityCalendarPaneProps) {
  const { isShown, showIncomplete } = useActivityFilter();

  const recordLookup = useMemo(() => buildRecordLookup(records), [records]);

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

  useEffect(() => {
    return () => {
      clearCalendarHover();
    };
  }, [month]);

  const handleDaySelect = useCallback(
    (date: string) => {
      clearCalendarHover();
      onDaySelect(date);
    },
    [onDaySelect],
  );

  const handleDayHoverStart = useCallback(
    (date: string, point: CalendarDayHoverPoint) => {
      const day = calendarDays.find((entry) => entry.date === date);

      if (day && activityCalendarDayHasHoverContent(day)) {
        setCalendarHoverFollowing(date, point.x, point.y);
        return;
      }

      clearCalendarHover();
    },
    [calendarDays],
  );

  const handleDayHoverMove = useCallback(
    (_date: string, point: CalendarDayHoverPoint) => {
      moveCalendarHoverPointer(point.x, point.y);
    },
    [],
  );

  const handleDayHoverEnd = useCallback(() => {
    scheduleClearCalendarHover();
  }, []);

  const renderCalendarCell = useCallback(
    (day: TaskCalendarDay, { isToday }: CalendarCellRenderContext) => (
      <ActivityCalendarCell
        day={day}
        isToday={isToday}
        isSelected={highlightedDate === day.date}
      />
    ),
    [highlightedDate],
  );

  const renderHoverContent = useCallback(
    (day: TaskCalendarDay) => <ActivityCalendarHoverContent day={day} />,
    [],
  );

  return (
    <>
      <MonthCalendar
        className="h-full min-h-[600px] w-full min-w-[42rem] md:min-w-0"
        month={month}
        calendarDays={calendarDays}
        selectedDate={highlightedDate}
        onDaySelect={handleDaySelect}
        onDayHoverStart={handleDayHoverStart}
        onDayHoverMove={handleDayHoverMove}
        onDayHoverEnd={handleDayHoverEnd}
        renderCell={renderCalendarCell}
      />
      <CalendarCursorTooltip
        days={calendarDays}
        getDate={(day) => day.date}
        hasContent={activityCalendarDayHasHoverContent}
        renderContent={renderHoverContent}
        width="12rem"
      />
    </>
  );
}
