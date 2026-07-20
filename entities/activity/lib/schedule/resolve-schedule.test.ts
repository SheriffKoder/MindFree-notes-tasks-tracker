/**
 * @file entities/activity/lib/resolve-schedule.test.ts
 * Locks schedule resolution: recurrence matching per `scheduleType` (incl.
 * `once`/`weekly`/`monthly`/`yearly`), per-day validity-window gating, and
 * `isActiveInMonth` returning true when any day in the month is active.
 */

import { describe, expect, it } from "vitest";

import {
  isActiveInMonth,
  isActiveOnDay,
  overlapsValidityWindow,
} from "@/entities/activity/lib/schedule/resolve-schedule";
import type { Activity } from "@/entities/activity/model/types";

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

describe("isActiveOnDay — recurrence", () => {
  it("daily fires every day", () => {
    const activity = buildActivity({ scheduleType: "daily", scheduleConfig: null });

    expect(isActiveOnDay(activity, "2026-07-15")).toBe(true);
  });

  it("once fires only on its configured date", () => {
    const activity = buildActivity({
      scheduleType: "once",
      scheduleConfig: "2026-08-01",
    });

    expect(isActiveOnDay(activity, "2026-08-01")).toBe(true);
    expect(isActiveOnDay(activity, "2026-08-02")).toBe(false);
  });

  it("weekly matches configured weekdays (UTC-stable)", () => {
    // 2026-07-15 is a Wednesday.
    const activity = buildActivity({
      scheduleType: "weekly",
      scheduleConfig: ["wed", "fri"],
    });

    expect(isActiveOnDay(activity, "2026-07-15")).toBe(true);
    expect(isActiveOnDay(activity, "2026-07-17")).toBe(true);
    expect(isActiveOnDay(activity, "2026-07-16")).toBe(false);
  });

  it("monthly matches configured days of month", () => {
    const activity = buildActivity({
      scheduleType: "monthly",
      scheduleConfig: ["01", "15"],
    });

    expect(isActiveOnDay(activity, "2026-07-15")).toBe(true);
    expect(isActiveOnDay(activity, "2026-07-14")).toBe(false);
  });

  it("yearly matches configured DD/MM dates", () => {
    const activity = buildActivity({
      scheduleType: "yearly",
      scheduleConfig: ["15/07", "23/02"],
    });

    expect(isActiveOnDay(activity, "2026-07-15")).toBe(true);
    expect(isActiveOnDay(activity, "2025-07-15")).toBe(true);
    expect(isActiveOnDay(activity, "2026-07-16")).toBe(false);
  });

  it("malformed array config resolves to false", () => {
    const activity = buildActivity({
      scheduleType: "weekly",
      scheduleConfig: null,
    });

    expect(isActiveOnDay(activity, "2026-07-15")).toBe(false);
  });
});

describe("isActiveOnDay — validity window", () => {
  it("excludes days before startsAt", () => {
    const activity = buildActivity({ startsAt: "2026-07-10" });

    expect(isActiveOnDay(activity, "2026-07-09")).toBe(false);
    expect(isActiveOnDay(activity, "2026-07-10")).toBe(true);
  });

  it("excludes days after endsAt", () => {
    const activity = buildActivity({ endsAt: "2026-07-20" });

    expect(isActiveOnDay(activity, "2026-07-20")).toBe(true);
    expect(isActiveOnDay(activity, "2026-07-21")).toBe(false);
  });

  it("gates the recurrence even when the pattern matches", () => {
    const activity = buildActivity({
      scheduleType: "weekly",
      scheduleConfig: ["wed"],
      startsAt: "2026-07-16",
    });

    // Wednesday, but before the window opens.
    expect(isActiveOnDay(activity, "2026-07-15")).toBe(false);
    // Next matching Wednesday inside the window.
    expect(isActiveOnDay(activity, "2026-07-22")).toBe(true);
  });
});

describe("isActiveInMonth", () => {
  it("is true when any day in the month is active", () => {
    const activity = buildActivity({
      scheduleType: "once",
      scheduleConfig: "2026-07-15",
    });

    expect(isActiveInMonth(activity, "2026-07")).toBe(true);
  });

  it("is false when the window excludes the whole month", () => {
    const activity = buildActivity({
      scheduleType: "daily",
      startsAt: "2026-08-01",
    });

    expect(isActiveInMonth(activity, "2026-07")).toBe(false);
    expect(isActiveInMonth(activity, "2026-08")).toBe(true);
  });
});

describe("overlapsValidityWindow", () => {
  it("excludes months entirely before startsAt", () => {
    expect(
      overlapsValidityWindow({ startsAt: "2026-07-01", endsAt: null }, "2026-06"),
    ).toBe(false);
    expect(
      overlapsValidityWindow({ startsAt: "2026-07-01", endsAt: null }, "2026-07"),
    ).toBe(true);
  });

  it("excludes months entirely after endsAt", () => {
    expect(
      overlapsValidityWindow({ startsAt: null, endsAt: "2026-07-31" }, "2026-08"),
    ).toBe(false);
    expect(
      overlapsValidityWindow({ startsAt: null, endsAt: "2026-07-31" }, "2026-07"),
    ).toBe(true);
  });

  it("treats open ends as unconstrained", () => {
    expect(
      overlapsValidityWindow({ startsAt: null, endsAt: null }, "2020-01"),
    ).toBe(true);
  });
});
