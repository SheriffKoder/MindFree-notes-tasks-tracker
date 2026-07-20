/**
 * @file entities/activity/lib/progress/build-task-progress.ts
 * Builds one ProgressTask from a definition, month records, and all-time rows.
 *
 * Purpose: Orchestrate per-task Progress — walk every day in the month, use
 *          records when present, project goals on missing due days (Option B
 *          stability for the currently-open month), and finalize month + week +
 *          all-time windows.
 * Used in: `entities/activity/lib/progress/build-progress-page-data.ts`,
 *          `entities/activity/lib/progress/index.ts` (re-exported).
 * Used for: One Progress card's computed numbers before presentation (Step 5).
 *
 * Function index:
 * - hasProjectableDueDay: whether a task should appear on future/empty months
 * - buildTaskProgress: definition + records → `ProgressTask`
 *
 * Steps (`buildTaskProgress`):
 * 1. Build week ranges via `getWeeksInMonth`.
 * 2. Create empty month and per-week accumulators.
 * 3. For each day: record → accumulate; else project if `shouldProjectDay`.
 * 4. Finalize month/week windows and all-time totals.
 */

import {
  accumulateAllTimeActuals,
  accumulateProjectedDayMetrics,
  accumulateRecordMetrics,
  createProgressWindowAccumulator,
  finalizeAllTimeMetrics,
  finalizeProgressWindow,
  type ProgressWindowAccumulator,
} from "@/entities/activity/lib/progress/accumulate-record-metrics";
import { getMonthRange } from "@/entities/activity/lib/month/parse-month";
import { isActiveOnDay } from "@/entities/activity/lib/schedule/resolve-schedule";
import type {
  ProgressMetric,
  ProgressTask,
  TaskWeekProgress,
} from "@/entities/activity/model/progress-read-models";
import type {
  Activity,
  ActivityRecord,
  TrackingMode,
} from "@/entities/activity/model/types";
import {
  getWeeksInMonth,
  type WeekInMonthRange,
} from "@/shared/week-grouping/lib/get-weeks-in-month";

/**
 * Minimal all-time record values consumed by Progress aggregation.
 *
 * Structurally matches `AllTimeTaskRecordValue` from the progress repository.
 */
export interface ProgressAllTimeRecordValue {
  taskId: string;
  trackingModeSnapshot: TrackingMode;
  count: number;
  duration: number;
}

function eachDayInMonth(month: string): string[] {
  const { year, monthNumber, daysInMonth } = getMonthRange(month);
  const paddedMonth = String(monthNumber).padStart(2, "0");
  const days: string[] = [];

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(`${year}-${paddedMonth}-${String(day).padStart(2, "0")}`);
  }

  return days;
}

function findWeekForDate(
  weeks: WeekInMonthRange[],
  isoDate: string,
): WeekInMonthRange | undefined {
  return weeks.find(
    (week) => isoDate >= week.rangeStart && isoDate <= week.rangeEnd,
  );
}

/**
 * Whether a missing day should project the current definition's goal.
 *
 * Closed past months and future months only project days on/after today
 * (history wins; nothing is retroactively invented before today). The
 * currently-open month (the month containing `todayIso`) projects every due
 * day regardless of before/after today, so the month's target stays stable
 * as days pass — a missing due day counts as a miss instead of silently
 * dropping out of the denominator. `activity.createdAt` floors projection in
 * both cases so a task never appears "due" before it existed.
 */
function shouldProjectDay(
  activity: Activity,
  isoDate: string,
  todayIso: string,
  month: string,
): boolean {
  if (activity.archivedAt !== null) {
    return false;
  }

  if (isoDate < activity.createdAt.slice(0, 10)) {
    return false;
  }

  const isCurrentMonth = month === todayIso.slice(0, 7);

  if (!isCurrentMonth && isoDate < todayIso) {
    return false;
  }

  return isActiveOnDay(activity, isoDate);
}

/**
 * Whether a non-archived task has any projectable due day in the month.
 *
 * For the currently-open month, projectable days are every due day in the
 * month (before or after today). For any other month, only today and after
 * project — a closed past month never does.
 *
 * @param activity - task definition
 * @param month - selected month key
 * @param todayIso - injected today (`YYYY-MM-DD`)
 */
export function hasProjectableDueDay(
  activity: Activity,
  month: string,
  todayIso: string,
): boolean {
  if (activity.archivedAt !== null) {
    return false;
  }

  const todayMonth = todayIso.slice(0, 7);

  if (month < todayMonth) {
    return false;
  }

  for (const isoDate of eachDayInMonth(month)) {
    if (shouldProjectDay(activity, isoDate, todayIso, month)) {
      return true;
    }
  }

  return false;
}

/**
 * Builds the Progress card model for one task.
 *
 * @param activity - task definition
 * @param month - selected month key
 * @param todayIso - injected today (`YYYY-MM-DD`); never read from `new Date()`
 * @param monthRecords - this task's records in the selected month
 * @param allTimeValues - this task's minimal all-time value rows
 */
export function buildTaskProgress(
  activity: Activity,
  month: string,
  todayIso: string,
  monthRecords: ActivityRecord[],
  allTimeValues: ProgressAllTimeRecordValue[],
): ProgressTask {
  const weekRanges = getWeeksInMonth(month);
  const monthWindow = createProgressWindowAccumulator(activity.trackingMode);
  const weekWindows = new Map<number, ProgressWindowAccumulator>();

  for (const week of weekRanges) {
    weekWindows.set(
      week.weekNumber,
      createProgressWindowAccumulator(activity.trackingMode),
    );
  }

  const recordsByDate = new Map(
    monthRecords.map((record) => [record.date, record]),
  );

  const contribute = (
    window: ProgressWindowAccumulator,
    isoDate: string,
  ): void => {
    const record = recordsByDate.get(isoDate);

    if (record) {
      accumulateRecordMetrics(window, record, activity.trackingMode);
      return;
    }

    if (shouldProjectDay(activity, isoDate, todayIso, month)) {
      accumulateProjectedDayMetrics(window, activity);
    }
  };

  for (const isoDate of eachDayInMonth(month)) {
    contribute(monthWindow, isoDate);

    const week = findWeekForDate(weekRanges, isoDate);

    if (!week) {
      continue;
    }

    const weekWindow = weekWindows.get(week.weekNumber);

    if (weekWindow) {
      contribute(weekWindow, isoDate);
    }
  }

  const monthProgress = finalizeProgressWindow(
    monthWindow,
    activity.trackingMode,
  );

  const weeks: TaskWeekProgress[] = weekRanges.map((week) => {
    const finalized = finalizeProgressWindow(
      weekWindows.get(week.weekNumber) ??
        createProgressWindowAccumulator(activity.trackingMode),
      activity.trackingMode,
    );

    return {
      weekNumber: week.weekNumber,
      rangeStart: week.rangeStart,
      rangeEnd: week.rangeEnd,
      percent: finalized.percent,
      metrics: finalized.metrics,
      legacyMetrics: finalized.legacyMetrics,
    };
  });

  const allTimeTotals = new Map<ProgressMetric, number>();

  for (const value of allTimeValues) {
    accumulateAllTimeActuals(
      allTimeTotals,
      value.count,
      value.duration,
      value.trackingModeSnapshot,
    );
  }

  return {
    id: activity.id,
    title: activity.title,
    color: activity.color,
    icon: activity.icon,
    trackingMode: activity.trackingMode,
    archivedAt: activity.archivedAt,
    month: {
      percent: monthProgress.percent,
      metrics: monthProgress.metrics,
      legacyMetrics: monthProgress.legacyMetrics,
    },
    allTime: {
      metrics: finalizeAllTimeMetrics(allTimeTotals, activity.trackingMode),
    },
    weeks,
  };
}
