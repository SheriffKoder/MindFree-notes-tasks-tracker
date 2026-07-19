/**
 * @file entities/activity/lib/is-remote-activity-newer.test.ts
 * Locks the newer-wins gate used by mutation onSuccess + realtime (Phase 5).
 */

import { describe, expect, it } from "vitest";

import { isRemoteActivityNewer } from "@/entities/activity/lib/is-remote-activity-newer";
import type { Activity } from "@/entities/activity/model/types";

function buildActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: "activity-1",
    kind: "task",
    title: "Title",
    description: null,
    color: null,
    trackingMode: "boolean",
    scheduleType: "daily",
    scheduleConfig: null,
    goal: null,
    goalDuration: null,
    icon: null,
    startsAt: null,
    endsAt: null,
    archivedAt: null,
    createdAt: "2024-06-01T12:00:00.000Z",
    updatedAt: "2024-06-01T12:00:00.000Z",
    ...overrides,
  };
}

describe("isRemoteActivityNewer", () => {
  it("treats any remote as newer when nothing is cached", () => {
    const remote = buildActivity();

    expect(isRemoteActivityNewer(remote, null)).toBe(true);
    expect(isRemoteActivityNewer(remote, undefined)).toBe(true);
  });

  it("accepts a strictly newer remote row", () => {
    const cached = buildActivity({ updatedAt: "2024-06-01T12:00:00.000Z" });
    const remote = buildActivity({ updatedAt: "2024-06-02T12:00:00.000Z" });

    expect(isRemoteActivityNewer(remote, cached)).toBe(true);
  });

  it("rejects an equal or older remote row", () => {
    const cached = buildActivity({ updatedAt: "2024-06-02T12:00:00.000Z" });
    const equal = buildActivity({ updatedAt: "2024-06-02T12:00:00.000Z" });
    const older = buildActivity({ updatedAt: "2024-06-01T12:00:00.000Z" });

    expect(isRemoteActivityNewer(equal, cached)).toBe(false);
    expect(isRemoteActivityNewer(older, cached)).toBe(false);
  });
});
