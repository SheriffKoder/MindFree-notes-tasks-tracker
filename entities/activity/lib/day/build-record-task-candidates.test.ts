/**
 * @file entities/activity/lib/day/build-record-task-candidates.test.ts
 * Locks Add-dropdown candidate derivation: exclude recorded, ignore schedule,
 * keep archived in a separate group, preserve definition order.
 */

import { describe, expect, it } from "vitest";

import { buildRecordTaskCandidates } from "@/entities/activity/lib/day/build-record-task-candidates";
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
    startsAt: null,
    endsAt: null,
    archivedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("buildRecordTaskCandidates", () => {
  it("excludes tasks that already have a record for the day", () => {
    const available = buildActivity({ id: "available", title: "Available" });
    const recorded = buildActivity({ id: "recorded", title: "Recorded" });

    const candidates = buildRecordTaskCandidates(
      [available, recorded],
      new Set(["recorded"]),
    );

    expect(candidates.active.map((task) => task.id)).toEqual(["available"]);
    expect(candidates.archived).toEqual([]);
  });

  it("includes unscheduled tasks in the active group", () => {
    const weekly = buildActivity({
      id: "weekly",
      scheduleType: "weekly",
      scheduleConfig: ["mon"],
    });

    const candidates = buildRecordTaskCandidates([weekly], new Set());

    expect(candidates.active.map((task) => task.id)).toEqual(["weekly"]);
  });

  it("separates archived tasks from active ones", () => {
    const active = buildActivity({ id: "active", title: "Active" });
    const archived = buildActivity({
      id: "archived",
      title: "Archived",
      archivedAt: "2026-07-01T00:00:00.000Z",
    });

    const candidates = buildRecordTaskCandidates(
      [archived, active],
      new Set(),
    );

    expect(candidates.active.map((task) => task.id)).toEqual(["active"]);
    expect(candidates.archived.map((task) => task.id)).toEqual(["archived"]);
  });

  it("preserves definition order within each group", () => {
    const first = buildActivity({ id: "first", title: "First" });
    const second = buildActivity({ id: "second", title: "Second" });
    const archivedFirst = buildActivity({
      id: "archived-first",
      archivedAt: "2026-07-01T00:00:00.000Z",
    });
    const archivedSecond = buildActivity({
      id: "archived-second",
      archivedAt: "2026-07-01T00:00:00.000Z",
    });

    const candidates = buildRecordTaskCandidates(
      [first, archivedFirst, second, archivedSecond],
      new Set(),
    );

    expect(candidates.active.map((task) => task.id)).toEqual([
      "first",
      "second",
    ]);
    expect(candidates.archived.map((task) => task.id)).toEqual([
      "archived-first",
      "archived-second",
    ]);
  });
});
