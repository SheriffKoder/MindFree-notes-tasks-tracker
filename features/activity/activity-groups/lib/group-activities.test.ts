/**
 * @file features/activity/activity-groups/lib/group-activities.test.ts
 * Locks list grouping: active+upcoming vs expired+archived.
 */

import { describe, expect, it } from "vitest";

import type { Activity } from "@/entities/activity";
import { groupActivities } from "@/features/activity/activity-groups/lib/group-activities";

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

describe("groupActivities", () => {
  it("places active and upcoming in the top group", () => {
    const active = buildActivity({ id: "active" });
    const upcoming = buildActivity({ id: "upcoming", startsAt: "2026-08-01" });

    const result = groupActivities([active, upcoming], "2026-07-15");

    expect(result.active.map((activity) => activity.id)).toEqual(["active", "upcoming"]);
    expect(result.inactive).toEqual([]);
  });

  it("places expired and archived in the inactive group", () => {
    const expired = buildActivity({ id: "expired", endsAt: "2026-07-10" });
    const archived = buildActivity({
      id: "archived",
      archivedAt: "2026-07-01T00:00:00.000Z",
    });

    const result = groupActivities([expired, archived], "2026-07-15");

    expect(result.active).toEqual([]);
    expect(result.inactive.map((activity) => activity.id)).toEqual([
      "expired",
      "archived",
    ]);
  });

  it("preserves input order within each bucket", () => {
    const first = buildActivity({ id: "first" });
    const second = buildActivity({ id: "second", startsAt: "2026-08-01" });
    const third = buildActivity({ id: "third", endsAt: "2026-07-01" });

    const result = groupActivities([first, second, third], "2026-07-15");

    expect(result.active.map((activity) => activity.id)).toEqual(["first", "second"]);
    expect(result.inactive.map((activity) => activity.id)).toEqual(["third"]);
  });
});
