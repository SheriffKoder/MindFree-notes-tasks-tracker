/**
 * @file entities/activity/lib/activity-status.test.ts
 * Locks status derivation: `archived` precedence over the window,
 * `upcoming`/`expired`/`active` from `startsAt`/`endsAt`, and `once` folding its
 * config date into both bounds.
 */

import { describe, expect, it } from "vitest";

import { getActivityStatus } from "@/entities/activity/lib/activity-status";
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
    startsAt: null,
    endsAt: null,
    archivedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("getActivityStatus", () => {
  it("archived wins over the window", () => {
    const activity = buildActivity({
      archivedAt: "2026-07-01T00:00:00.000Z",
      startsAt: "2026-08-01",
    });

    expect(getActivityStatus(activity, "2026-07-15")).toBe("archived");
  });

  it("open-ended windows are active", () => {
    expect(getActivityStatus(buildActivity(), "2026-07-15")).toBe("active");
  });

  it("upcoming before startsAt", () => {
    const activity = buildActivity({ startsAt: "2026-08-01" });

    expect(getActivityStatus(activity, "2026-07-15")).toBe("upcoming");
    expect(getActivityStatus(activity, "2026-08-01")).toBe("active");
  });

  it("expired after endsAt", () => {
    const activity = buildActivity({ endsAt: "2026-07-10" });

    expect(getActivityStatus(activity, "2026-07-10")).toBe("active");
    expect(getActivityStatus(activity, "2026-07-11")).toBe("expired");
  });

  it("once folds its config date into both bounds", () => {
    const activity = buildActivity({
      scheduleType: "once",
      scheduleConfig: "2026-07-15",
    });

    expect(getActivityStatus(activity, "2026-07-14")).toBe("upcoming");
    expect(getActivityStatus(activity, "2026-07-15")).toBe("active");
    expect(getActivityStatus(activity, "2026-07-16")).toBe("expired");
  });
});
