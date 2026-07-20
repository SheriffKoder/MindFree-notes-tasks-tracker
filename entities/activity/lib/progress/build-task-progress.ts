/**
 * @file entities/activity/lib/progress/build-task-progress.ts
 * Builds one ProgressTask from a definition, month records, and all-time rows.
 *
 * Purpose: Orchestrate per-task Progress — either the due-day path (records +
 *          Option B projection) or the period-goal path (recorded actuals vs
 *          period targets, no schedule). Finalize month + week + all-time.
 * Used in: `entities/activity/lib/progress/build-progress-page-data.ts`,
 *          `entities/activity/lib/progress/index.ts` (re-exported).
 * Used for: One Progress card's computed numbers before presentation.
 *
 * Function index:
 * - hasProjectableDueDay: whether a due-day task should appear on future/empty months
 * - buildTaskProgress: definition + records → `ProgressTask`
 *
 * Steps (`buildTaskProgress`):
 * 1. If `goalPeriod` is set → period-goal windows (no projection).
 * 2. Else due-day path: week ranges, accumulate records / project missing dues.
 * 3. Finalize month/week windows and all-time totals.
 */

import {
  accumulatePeriodRecordMetrics,
  availableDaysInWeek,
  seedPeriodGoalsForActivity,
} from "@/entities/activity/lib/progress/accumulate-period-goal-metrics";
import {
  accumulateAllTimeActuals,
  accumulateProjectedDayMetrics,
  accumulateRecordMetrics,
  createProgressWindowAccumulator,
  finalizeAllTimeMetrics,
  finalizeProgressWindow,
  seedPrimaryGoal,
  type ProgressWindowAccumulator,
} from "@/entities/activity/lib/progress/accumulate-record-metrics";
import { getMonthRange } from "@/entities/activity/lib/month/parse-month";
import {
  isActiveOnDay,
  isWithinValidityWindow,
} from "@/entities/activity/lib/schedule/resolve-schedule";
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

const PERIOD_OPTIONS = { periodGoal: true } as const;

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
 * Not used for period-goal tasks (they use a separate membership rule).
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

function finalizeAllTime(
  activity: Activity,
  allTimeValues: ProgressAllTimeRecordValue[],
): ProgressTask["allTime"] {
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
    metrics: finalizeAllTimeMetrics(allTimeTotals, activity.trackingMode),
  };
}

/**
 * Period-goal path: seed window targets once, accumulate recorded days only.
 *
 * Never calls `isActiveOnDay` / `shouldProjectDay`. Under a `"week"` goal every
 * week that has available days (month ∩ validity window) gets a target —
 * full weeks use the full period goal; partial edge weeks prorate by
 * `days / 7`. The month target is the sum of those week targets so the donut
 * matches week columns. Under `"month"`, only the month window is seeded;
 * week rows stay actual-only. Days outside `startsAt`/`endsAt` do not
 * contribute.
 */
function buildPeriodGoalTaskProgress(
  activity: Activity,
  month: string,
  monthRecords: ActivityRecord[],
  allTimeValues: ProgressAllTimeRecordValue[],
): ProgressTask {
  const weekRanges = getWeeksInMonth(month);
  const monthWindow = createProgressWindowAccumulator(
    activity.trackingMode,
    PERIOD_OPTIONS,
  );
  const weekWindows = new Map<number, ProgressWindowAccumulator>();

  for (const week of weekRanges) {
    weekWindows.set(
      week.weekNumber,
      createProgressWindowAccumulator(activity.trackingMode, PERIOD_OPTIONS),
    );
  }

  // Seed week targets (full or prorated), then sum into the month window.
  if (activity.goalPeriod === "week") {
    for (const week of weekRanges) {
      const availableDays = availableDaysInWeek(week, activity);

      if (availableDays <= 0) {
        continue;
      }

      const weekWindow = weekWindows.get(week.weekNumber);

      if (weekWindow) {
        seedPeriodGoalsForActivity(weekWindow, activity, availableDays);
      }
    }

    // Month target = sum of week targets (including prorated edges).
    for (const weekWindow of weekWindows.values()) {
      for (const [metric, weekAcc] of weekWindow.primary) {
        if (!weekAcc.hadGoal) {
          continue;
        }

        seedPrimaryGoal(monthWindow, metric, weekAcc.goalSum);
      }
    }
  } else {
    // `"month"` — seed the month window directly; weeks stay goal-less.
    seedPeriodGoalsForActivity(monthWindow, activity);
  }

  const recordsByDate = new Map(
    monthRecords.map((record) => [record.date, record]),
  );

  for (const isoDate of eachDayInMonth(month)) {
    if (!isWithinValidityWindow(activity, isoDate)) {
      continue;
    }

    const record = recordsByDate.get(isoDate);

    if (!record) {
      continue;
    }

    accumulatePeriodRecordMetrics(
      monthWindow,
      record,
      activity.trackingMode,
    );

    const week = findWeekForDate(weekRanges, isoDate);

    if (!week) {
      continue;
    }

    const weekWindow = weekWindows.get(week.weekNumber);

    if (weekWindow) {
      accumulatePeriodRecordMetrics(
        weekWindow,
        record,
        activity.trackingMode,
      );
    }
  }

  const monthProgress = finalizeProgressWindow(
    monthWindow,
    activity.trackingMode,
    PERIOD_OPTIONS,
  );

  const weeks: TaskWeekProgress[] = weekRanges.map((week) => {
    const finalized = finalizeProgressWindow(
      weekWindows.get(week.weekNumber) ??
        createProgressWindowAccumulator(activity.trackingMode, PERIOD_OPTIONS),
      activity.trackingMode,
      PERIOD_OPTIONS,
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

  return {
    id: activity.id,
    title: activity.title,
    color: activity.color,
    icon: activity.icon,
    trackingMode: activity.trackingMode,
    goalPeriod: activity.goalPeriod,
    archivedAt: activity.archivedAt,
    month: {
      percent: monthProgress.percent,
      metrics: monthProgress.metrics,
      legacyMetrics: monthProgress.legacyMetrics,
    },
    allTime: finalizeAllTime(activity, allTimeValues),
    weeks,
  };
}

/**
 * Due-day path: records + Option B projection for missing due days.
 */
function buildDueDayTaskProgress(
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

  return {
    id: activity.id,
    title: activity.title,
    color: activity.color,
    icon: activity.icon,
    trackingMode: activity.trackingMode,
    goalPeriod: null,
    archivedAt: activity.archivedAt,
    month: {
      percent: monthProgress.percent,
      metrics: monthProgress.metrics,
      legacyMetrics: monthProgress.legacyMetrics,
    },
    allTime: finalizeAllTime(activity, allTimeValues),
    weeks,
  };
}

/**
 * Builds the Progress card model for one task.
 *
 * When `goalPeriod` is set, uses period-goal accumulation (no due-day
 * projection). Otherwise uses the due-day path unchanged.
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
  if (activity.goalPeriod !== null) {
    return buildPeriodGoalTaskProgress(
      activity,
      month,
      monthRecords,
      allTimeValues,
    );
  }

  return buildDueDayTaskProgress(
    activity,
    month,
    todayIso,
    monthRecords,
    allTimeValues,
  );
}
