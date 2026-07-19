import { describe, expect, it } from "vitest";

import { buildProgressPageData } from "@/entities/activity/lib/progress/build-progress-page-data";
import type {
  Activity,
  ActivityRecord,
} from "@/entities/activity/model/types";

const TODAY = "2026-07-15"; // Wednesday
const CURRENT_MONTH = "2026-07";
const PAST_MONTH = "2026-06";
const FUTURE_MONTH = "2026-08";

function buildActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: "task-1",
    kind: "task",
    title: "Task",
    description: null,
    color: "#111111",
    trackingMode: "count",
    scheduleType: "daily",
    scheduleConfig: null,
    goal: 5,
    goalDuration: null,
    icon: null,
    startsAt: null,
    endsAt: null,
    archivedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function buildRecord(overrides: Partial<ActivityRecord> = {}): ActivityRecord {
  return {
    id: "record-1",
    taskId: "task-1",
    date: "2026-07-10",
    trackingModeSnapshot: "count",
    goalSnapshot: 5,
    goalDurationSnapshot: null,
    count: 3,
    duration: 0,
    description: null,
    createdAt: "2026-07-10T00:00:00.000Z",
    updatedAt: "2026-07-10T00:00:00.000Z",
    ...overrides,
  };
}

describe("buildProgressPageData", () => {
  it("uses records only for a past month (no current-schedule reconstruction)", () => {
    const task = buildActivity({ scheduleType: "daily", goal: 5 });
    const page = buildProgressPageData({
      month: PAST_MONTH,
      todayIso: TODAY,
      tasks: [task],
      monthRecords: [
        buildRecord({
          date: "2026-06-02",
          count: 2,
          goalSnapshot: 5,
        }),
      ],
      allTimeValues: [],
    });

    expect(page.tasks).toHaveLength(1);
    expect(page.tasks[0].month.metrics[0]).toMatchObject({
      totalActual: 2,
      targetedActual: 2,
      goal: 5,
      percent: 40,
    });
  });

  it("omits active tasks with no records in a past month", () => {
    const page = buildProgressPageData({
      month: PAST_MONTH,
      todayIso: TODAY,
      tasks: [buildActivity()],
      monthRecords: [],
      allTimeValues: [],
    });

    expect(page.tasks).toEqual([]);
  });

  it("does not contribute anything for a missing historical day", () => {
    const page = buildProgressPageData({
      month: CURRENT_MONTH,
      todayIso: TODAY,
      tasks: [buildActivity({ scheduleType: "daily", goal: 5 })],
      monthRecords: [
        buildRecord({ date: "2026-07-10", count: 5, goalSnapshot: 5 }),
      ],
      allTimeValues: [],
    });

    // One recorded day goal (5) + projected days from today through month end.
    // Missing 2026-07-01..09 (except recorded 10) must not add goals.
    const metric = page.tasks[0].month.metrics[0];
    const projectedDays =
      // July has 31 days; projectable = 15..31 = 17 days
      17;
    expect(metric.goal).toBe(5 + projectedDays * 5);
    expect(metric.totalActual).toBe(5);
  });

  it("does not double-add the current target when today has a record", () => {
    const page = buildProgressPageData({
      month: CURRENT_MONTH,
      todayIso: TODAY,
      tasks: [buildActivity({ scheduleType: "daily", goal: 10 })],
      monthRecords: [
        buildRecord({
          date: TODAY,
          count: 4,
          goalSnapshot: 10,
          trackingModeSnapshot: "count",
        }),
      ],
      allTimeValues: [],
    });

    const metric = page.tasks[0].month.metrics[0];
    // Today uses snapshot goal once; remaining 16 future days project 10 each.
    expect(metric.goal).toBe(10 + 16 * 10);
    expect(metric.totalActual).toBe(4);
  });

  it("adds the current goal on a future due day", () => {
    const page = buildProgressPageData({
      month: CURRENT_MONTH,
      todayIso: TODAY,
      tasks: [
        buildActivity({
          scheduleType: "weekly",
          scheduleConfig: ["fri"],
          goal: 8,
        }),
      ],
      monthRecords: [],
      allTimeValues: [],
    });

    // Fridays after today in July 2026: 17, 24, 31 → 3 projected goals
    expect(page.tasks[0].month.metrics[0].goal).toBe(24);
    expect(page.tasks[0].month.metrics[0].totalActual).toBe(0);
  });

  it("adds nothing on a future non-due day", () => {
    const page = buildProgressPageData({
      month: FUTURE_MONTH,
      todayIso: TODAY,
      tasks: [
        buildActivity({
          scheduleType: "weekly",
          scheduleConfig: ["mon"],
          goal: 5,
        }),
      ],
      monthRecords: [],
      allTimeValues: [],
    });

    // Mondays in Aug 2026: 3, 10, 17, 24, 31 → 5
    expect(page.tasks[0].month.metrics[0].goal).toBe(25);
  });

  it("includes archived tasks with month records and skips projection", () => {
    const archived = buildActivity({
      id: "archived",
      archivedAt: "2026-07-01T00:00:00.000Z",
      scheduleType: "daily",
      goal: 5,
    });
    const page = buildProgressPageData({
      month: CURRENT_MONTH,
      todayIso: TODAY,
      tasks: [archived],
      monthRecords: [
        buildRecord({
          taskId: "archived",
          date: "2026-07-02",
          count: 3,
          goalSnapshot: 5,
        }),
      ],
      allTimeValues: [],
    });

    expect(page.tasks).toHaveLength(1);
    expect(page.tasks[0].month.metrics[0]).toMatchObject({
      totalActual: 3,
      goal: 5,
      percent: 60,
    });
  });

  it("excludes archived tasks without month records", () => {
    const page = buildProgressPageData({
      month: CURRENT_MONTH,
      todayIso: TODAY,
      tasks: [
        buildActivity({
          archivedAt: "2026-07-01T00:00:00.000Z",
          scheduleType: "daily",
        }),
      ],
      monthRecords: [],
      allTimeValues: [],
    });

    expect(page.tasks).toEqual([]);
  });

  it("includes active current/future tasks with a due day and no record", () => {
    const page = buildProgressPageData({
      month: FUTURE_MONTH,
      todayIso: TODAY,
      tasks: [buildActivity({ scheduleType: "daily", goal: 2 })],
      monthRecords: [],
      allTimeValues: [],
    });

    expect(page.tasks).toHaveLength(1);
    expect(page.tasks[0].month.metrics[0].goal).toBe(31 * 2);
  });

  it("orders active tasks before archived-history tasks", () => {
    const active = buildActivity({
      id: "active",
      createdAt: "2026-01-02T00:00:00.000Z",
    });
    const archived = buildActivity({
      id: "archived",
      createdAt: "2026-01-01T00:00:00.000Z",
      archivedAt: "2026-07-01T00:00:00.000Z",
    });
    const page = buildProgressPageData({
      month: CURRENT_MONTH,
      todayIso: TODAY,
      tasks: [archived, active],
      monthRecords: [
        buildRecord({ taskId: "archived", date: "2026-07-02" }),
        buildRecord({ taskId: "active", date: "2026-07-03" }),
      ],
      allTimeValues: [],
    });

    expect(page.tasks.map((task) => task.id)).toEqual(["active", "archived"]);
  });

  it("filters month records to known task ids", () => {
    const page = buildProgressPageData({
      month: PAST_MONTH,
      todayIso: TODAY,
      tasks: [buildActivity({ id: "task-1" })],
      monthRecords: [
        buildRecord({
          taskId: "reminder-1",
          date: "2026-06-02",
          count: 9,
        }),
      ],
      allTimeValues: [],
    });

    expect(page.tasks).toEqual([]);
  });

  it("aggregates all-time values with current metrics first", () => {
    const page = buildProgressPageData({
      month: PAST_MONTH,
      todayIso: TODAY,
      tasks: [buildActivity({ trackingMode: "duration", goalDuration: 30 })],
      monthRecords: [
        buildRecord({
          date: "2026-06-02",
          trackingModeSnapshot: "duration",
          goalSnapshot: null,
          goalDurationSnapshot: 30,
          count: 0,
          duration: 20,
        }),
      ],
      allTimeValues: [
        {
          taskId: "task-1",
          trackingModeSnapshot: "duration",
          count: 0,
          duration: 90,
        },
        {
          taskId: "task-1",
          trackingModeSnapshot: "count",
          count: 12,
          duration: 0,
        },
      ],
    });

    expect(page.tasks[0].allTime.metrics).toEqual([
      { metric: "duration", actual: 90 },
      { metric: "count", actual: 12 },
    ]);
  });

  it("emits every clipped week including empty ones", () => {
    const page = buildProgressPageData({
      month: "2026-08",
      todayIso: TODAY,
      tasks: [
        buildActivity({
          scheduleType: "once",
          scheduleConfig: "2026-08-15",
          goal: 1,
        }),
      ],
      monthRecords: [],
      allTimeValues: [],
    });

    expect(page.tasks[0].weeks).toHaveLength(6);
    expect(page.tasks[0].weeks[2].metrics[0].goal).toBe(1);
    expect(
      page.tasks[0].weeks.filter((week) => week.metrics[0].goal === null),
    ).toHaveLength(5);
  });
});
