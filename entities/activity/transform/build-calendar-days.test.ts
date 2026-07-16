/**
 * @file entities/activity/transform/build-calendar-days.test.ts
 * Locks calendar-day join: one entry per day, scheduled slots via
 * `isActiveOnDay`, recorded history regardless of schedule, and record pairing.
 */

import { describe, expect, it } from "vitest";

import { buildRecordLookup } from "@/entities/activity/lib/record/build-record-lookup";
import { buildTaskCalendarDays } from "@/entities/activity/transform/build-calendar-days";
import type {
  Activity,
  ActivityRecord,
} from "@/entities/activity/model/types";

function buildActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: "task-1",
    kind: "task",
    title: "Task",
    description: null,
    color: null,
    trackingMode: "boolean",
    scheduleType: "daily",
    scheduleConfig: null,
    goal: null,
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
    date: "2026-07-15",
    count: 1,
    duration: 0,
    description: null,
    createdAt: "2026-07-15T00:00:00.000Z",
    updatedAt: "2026-07-15T00:00:00.000Z",
    ...overrides,
  };
}

describe("buildTaskCalendarDays", () => {
  it("returns one entry per day in the month", () => {
    const days = buildTaskCalendarDays("2026-07", [], buildRecordLookup([]));

    expect(days).toHaveLength(31);
    expect(days[0]).toEqual({ day: 1, date: "2026-07-01", activities: [] });
    expect(days[30]).toEqual({ day: 31, date: "2026-07-31", activities: [] });
  });

  it("includes every activity active on a day via isActiveOnDay", () => {
    const daily = buildActivity({ id: "daily", scheduleType: "daily" });
    const once = buildActivity({
      id: "once",
      scheduleType: "once",
      scheduleConfig: "2026-07-15",
    });
    const otherMonth = buildActivity({
      id: "other",
      scheduleType: "once",
      scheduleConfig: "2026-08-01",
    });

    const days = buildTaskCalendarDays(
      "2026-07",
      [daily, once, otherMonth],
      buildRecordLookup([]),
    );
    const midMonth = days.find((day) => day.date === "2026-07-15");

    expect(midMonth?.activities.map((entry) => entry.activity.id)).toEqual([
      "daily",
      "once",
    ]);
  });

  it("keeps recorded days when the schedule no longer matches", () => {
    const weekly = buildActivity({
      id: "task-1",
      scheduleType: "weekly",
      // Monday only — 2026-07-15 is a Wednesday
      scheduleConfig: ["mon"],
    });
    const record = buildRecord({ taskId: "task-1", date: "2026-07-15" });

    const days = buildTaskCalendarDays(
      "2026-07",
      [weekly],
      buildRecordLookup([record]),
    );
    const wednesday = days.find((day) => day.date === "2026-07-15");
    const monday = days.find((day) => day.date === "2026-07-13");

    expect(wednesday?.activities).toEqual([{ activity: weekly, record }]);
    expect(monday?.activities).toEqual([{ activity: weekly, record: null }]);
  });

  it("pairs each active activity with its record or null", () => {
    const activity = buildActivity({ id: "task-1" });
    const other = buildActivity({
      id: "task-2",
      scheduleType: "once",
      scheduleConfig: "2026-07-15",
    });
    const record = buildRecord({ taskId: "task-1", date: "2026-07-15" });
    const lookup = buildRecordLookup([record]);

    const days = buildTaskCalendarDays(
      "2026-07",
      [activity, other],
      lookup,
    );
    const midMonth = days.find((day) => day.date === "2026-07-15");

    expect(midMonth?.activities).toEqual([
      { activity, record },
      { activity: other, record: null },
    ]);
  });

  it("preserves activity order from the input list", () => {
    const second = buildActivity({ id: "task-2" });
    const first = buildActivity({ id: "task-1" });

    const days = buildTaskCalendarDays(
      "2026-07",
      [first, second],
      buildRecordLookup([]),
    );
    const midMonth = days.find((day) => day.date === "2026-07-15");

    expect(midMonth?.activities.map((entry) => entry.activity.id)).toEqual([
      "task-1",
      "task-2",
    ]);
  });

  it("excludes unscheduled empty slots outside the validity window", () => {
    const activity = buildActivity({
      startsAt: "2026-07-10",
      endsAt: "2026-07-12",
    });

    const days = buildTaskCalendarDays(
      "2026-07",
      [activity],
      buildRecordLookup([]),
    );

    expect(days.find((day) => day.date === "2026-07-09")?.activities).toEqual(
      [],
    );
    expect(
      days.find((day) => day.date === "2026-07-10")?.activities,
    ).toHaveLength(1);
    expect(days.find((day) => day.date === "2026-07-13")?.activities).toEqual(
      [],
    );
  });

  it("still shows a record outside the validity window", () => {
    const activity = buildActivity({
      startsAt: "2026-07-10",
      endsAt: "2026-07-12",
    });
    const record = buildRecord({ taskId: "task-1", date: "2026-07-15" });

    const days = buildTaskCalendarDays(
      "2026-07",
      [activity],
      buildRecordLookup([record]),
    );

    expect(days.find((day) => day.date === "2026-07-15")?.activities).toEqual([
      { activity, record },
    ]);
  });
});
