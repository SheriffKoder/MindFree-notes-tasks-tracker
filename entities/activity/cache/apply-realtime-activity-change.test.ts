/**
 * @file entities/activity/cache/apply-realtime-activity-change.test.ts
 * Drives INSERT/UPDATE/DELETE/pending/stale without Supabase.
 */

import { QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { applyRealtimeActivityChange } from "@/entities/activity/cache/apply-realtime-activity-change";
import { activitiesQueryKey } from "@/entities/activity/client/query-keys";
import {
  clearActivityMutationPending,
  markActivityMutationPending,
} from "@/entities/activity/hooks/activity-mutation-pending";
import type { Activity, ActivityRow } from "@/entities/activity/model/types";

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
    goalPeriod: null,
    periodGoal: null,
    periodGoalDuration: null,
    priority: null,
    startsAt: null,
    endsAt: null,
    archivedAt: null,
    createdAt: "2024-06-01T12:00:00.000Z",
    updatedAt: "2024-06-01T12:00:00.000Z",
    ...overrides,
  };
}

function buildRow(
  overrides: Partial<ActivityRow> & Pick<ActivityRow, "id" | "kind">,
): Record<string, unknown> {
  return {
    user_id: "user-1",
    title: "Title",
    description: null,
    color: null,
    tracking_mode: "boolean",
    schedule_type: "daily",
    schedule_config: null,
    goal: null,
    goal_duration: null,
    goal_period: null,
    period_goal: null,
    period_goal_duration: null,
    priority: null,
    icon: null,
    starts_at: null,
    ends_at: null,
    archived_at: null,
    created_at: "2024-06-01T12:00:00.000Z",
    updated_at: "2024-06-01T12:00:00.000Z",
    ...overrides,
  };
}

describe("applyRealtimeActivityChange", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  afterEach(() => {
    clearActivityMutationPending("activity-1");
  });

  it("INSERT creates into the kind cache", () => {
    queryClient.setQueryData(activitiesQueryKey("task"), { activities: [] });

    const result = applyRealtimeActivityChange(
      queryClient,
      "INSERT",
      buildRow({ id: "activity-1", kind: "task", title: "New" }),
      null,
    );

    expect(result.applied).toBe(true);
    expect(result.activity?.title).toBe("New");

    const cached = queryClient.getQueryData<{ activities: Activity[] }>(
      activitiesQueryKey("task"),
    );

    expect(cached?.activities).toHaveLength(1);
    expect(cached?.activities[0]?.title).toBe("New");
  });

  it("UPDATE patches when remote is newer", () => {
    const previous = buildActivity();

    queryClient.setQueryData(activitiesQueryKey("task"), {
      activities: [previous],
    });

    const result = applyRealtimeActivityChange(
      queryClient,
      "UPDATE",
      buildRow({
        id: "activity-1",
        kind: "task",
        title: "Remote",
        updated_at: "2024-06-02T12:00:00.000Z",
      }),
      null,
    );

    expect(result.applied).toBe(true);

    const cached = queryClient.getQueryData<{ activities: Activity[] }>(
      activitiesQueryKey("task"),
    );

    expect(cached?.activities[0]?.title).toBe("Remote");
    expect(cached?.activities[0]?.updatedAt).toBe("2024-06-02T12:00:00.000Z");
  });

  it("UPDATE skips when remote is stale or equal", () => {
    const previous = buildActivity({
      title: "Local",
      updatedAt: "2024-06-02T12:00:00.000Z",
    });

    queryClient.setQueryData(activitiesQueryKey("task"), {
      activities: [previous],
    });

    const result = applyRealtimeActivityChange(
      queryClient,
      "UPDATE",
      buildRow({
        id: "activity-1",
        kind: "task",
        title: "Stale",
        updated_at: "2024-06-01T12:00:00.000Z",
      }),
      null,
    );

    expect(result.applied).toBe(false);

    const cached = queryClient.getQueryData<{ activities: Activity[] }>(
      activitiesQueryKey("task"),
    );

    expect(cached?.activities[0]?.title).toBe("Local");
  });

  it("UPDATE orphan with no cached previous still upserts", () => {
    queryClient.setQueryData(activitiesQueryKey("task"), { activities: [] });

    const result = applyRealtimeActivityChange(
      queryClient,
      "UPDATE",
      buildRow({
        id: "activity-1",
        kind: "task",
        title: "Orphan",
        updated_at: "2024-06-02T12:00:00.000Z",
      }),
      null,
    );

    expect(result.applied).toBe(true);

    const cached = queryClient.getQueryData<{ activities: Activity[] }>(
      activitiesQueryKey("task"),
    );

    expect(cached?.activities).toHaveLength(1);
    expect(cached?.activities[0]?.title).toBe("Orphan");
  });

  it("DELETE removes from cache using oldRecord", () => {
    queryClient.setQueryData(activitiesQueryKey("task"), {
      activities: [buildActivity()],
    });

    const result = applyRealtimeActivityChange(
      queryClient,
      "DELETE",
      null,
      buildRow({ id: "activity-1", kind: "task" }),
    );

    expect(result.applied).toBe(true);

    const cached = queryClient.getQueryData<{ activities: Activity[] }>(
      activitiesQueryKey("task"),
    );

    expect(cached?.activities).toHaveLength(0);
  });

  it("DELETE with id-only payload probes either kind bucket", () => {
    queryClient.setQueryData(activitiesQueryKey("reminder"), {
      activities: [buildActivity({ kind: "reminder" })],
    });

    const result = applyRealtimeActivityChange(
      queryClient,
      "DELETE",
      null,
      { id: "activity-1" },
    );

    expect(result.applied).toBe(true);

    const cached = queryClient.getQueryData<{ activities: Activity[] }>(
      activitiesQueryKey("reminder"),
    );

    expect(cached?.activities).toHaveLength(0);
  });

  it("DELETE with id-only and empty caches no-ops safely", () => {
    const result = applyRealtimeActivityChange(
      queryClient,
      "DELETE",
      null,
      { id: "activity-1" },
    );

    expect(result.applied).toBe(false);
    expect(result.activity).toBeNull();
  });

  it("skips all events while a mutation is pending", () => {
    queryClient.setQueryData(activitiesQueryKey("task"), {
      activities: [buildActivity()],
    });
    markActivityMutationPending("activity-1");

    const insert = applyRealtimeActivityChange(
      queryClient,
      "INSERT",
      buildRow({ id: "activity-1", kind: "task", title: "Echo" }),
      null,
    );
    const update = applyRealtimeActivityChange(
      queryClient,
      "UPDATE",
      buildRow({
        id: "activity-1",
        kind: "task",
        title: "Echo",
        updated_at: "2024-06-03T12:00:00.000Z",
      }),
      null,
    );
    const remove = applyRealtimeActivityChange(
      queryClient,
      "DELETE",
      null,
      buildRow({ id: "activity-1", kind: "task" }),
    );

    expect(insert.applied).toBe(false);
    expect(update.applied).toBe(false);
    expect(remove.applied).toBe(false);

    const cached = queryClient.getQueryData<{ activities: Activity[] }>(
      activitiesQueryKey("task"),
    );

    expect(cached?.activities).toHaveLength(1);
    expect(cached?.activities[0]?.title).toBe("Title");
  });
});
