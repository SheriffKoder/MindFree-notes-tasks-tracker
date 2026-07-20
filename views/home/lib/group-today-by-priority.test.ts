/**
 * @file views/home/lib/group-today-by-priority.test.ts
 * Locks Home priority section order and empty-bucket omission.
 */

import { describe, expect, it } from "vitest";

import type { Activity, TodayActivity } from "@/entities/activity";
import { groupTodayByPriority } from "@/views/home/lib/group-today-by-priority";

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
    goalDuration: null,
    icon: null,
    goalPeriod: null,
    periodGoal: null,
    periodGoalDuration: null,
    priority: null,
    startsAt: null,
    endsAt: null,
    archivedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function buildToday(overrides: Partial<Activity> = {}): TodayActivity {
  return {
    activity: buildActivity(overrides),
    record: null,
    done: false,
    progress: {
      dimensions: [],
      done: false,
    },
  };
}

describe("groupTodayByPriority", () => {
  it("returns sections in High → Medium → Low → Other order", () => {
    const items = [
      buildToday({ id: "other", priority: null }),
      buildToday({ id: "low", priority: "low" }),
      buildToday({ id: "high", priority: "high" }),
      buildToday({ id: "medium", priority: "medium" }),
    ];

    expect(groupTodayByPriority(items).map((section) => section.key)).toEqual([
      "high",
      "medium",
      "low",
      "other",
    ]);
  });

  it("omits empty priority buckets", () => {
    const items = [
      buildToday({ id: "high-1", priority: "high" }),
      buildToday({ id: "other-1", priority: null }),
    ];

    expect(groupTodayByPriority(items).map((section) => section.label)).toEqual([
      "High",
      "Other",
    ]);
  });

  it("preserves input order within each bucket", () => {
    const items = [
      buildToday({ id: "high-a", priority: "high", title: "A" }),
      buildToday({ id: "high-b", priority: "high", title: "B" }),
      buildToday({ id: "other-a", priority: null, title: "C" }),
    ];

    const sections = groupTodayByPriority(items);

    expect(sections[0]?.items.map((item) => item.activity.id)).toEqual([
      "high-a",
      "high-b",
    ]);
    expect(sections[1]?.items.map((item) => item.activity.id)).toEqual([
      "other-a",
    ]);
  });

  it("labels unset priority as Other", () => {
    const sections = groupTodayByPriority([
      buildToday({ id: "unset", priority: null }),
    ]);

    expect(sections).toEqual([
      expect.objectContaining({
        key: "other",
        label: "Other",
        items: [expect.objectContaining({ activity: expect.objectContaining({ id: "unset" }) })],
      }),
    ]);
  });
});
