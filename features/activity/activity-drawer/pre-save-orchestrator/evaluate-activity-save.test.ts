/**
 * @file features/activity/activity-drawer/pre-save-orchestrator/evaluate-activity-save.test.ts
 * Unit tests for the pure create-vs-patch decision.
 */

import { describe, expect, it } from "vitest";

import {
  evaluateActivitySave,
  hasMeaningfulContent,
} from "@/features/activity/activity-drawer/pre-save-orchestrator/evaluate-activity-save";
import type { ActivityFormValues } from "@/entities/activity/editor/model/types";
import type { Activity } from "@/entities/activity/model/types";

function buildValues(
  overrides: Partial<ActivityFormValues> = {},
): ActivityFormValues {
  return {
    title: "Workout",
    description: null,
    color: null,
    trackingMode: "boolean",
    scheduleType: "daily",
    scheduleConfig: null,
    goal: null,
    goalDuration: null,
    startsAt: null,
    endsAt: null,
    ...overrides,
  };
}

function buildActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: "activity-1",
    kind: "task",
    title: "Workout",
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

describe("hasMeaningfulContent", () => {
  it("requires a non-empty trimmed title", () => {
    expect(hasMeaningfulContent(buildValues({ title: "  Go  " }))).toBe(true);
    expect(hasMeaningfulContent(buildValues({ title: "   " }))).toBe(false);
    expect(hasMeaningfulContent(buildValues({ title: "" }))).toBe(false);
  });
});

describe("evaluateActivitySave", () => {
  it("creates when there is no activity id, form is valid, and title is set", () => {
    const result = evaluateActivitySave({
      values: buildValues({
        trackingMode: "duration",
        goalDuration: 30,
      }),
      meta: { isDirty: true, isValid: true },
      activity: null,
    });

    expect(result.action).toBe("create");
    expect(result.payload.title).toBe("Workout");
    expect(result.payload.goalDuration).toBe(30);
  });

  it("noops create when invalid or untitled", () => {
    expect(
      evaluateActivitySave({
        values: buildValues({ title: "" }),
        meta: { isDirty: true, isValid: false },
        activity: null,
      }).action,
    ).toBe("noop");

    expect(
      evaluateActivitySave({
        values: buildValues({ title: "" }),
        meta: { isDirty: true, isValid: true },
        activity: null,
      }).action,
    ).toBe("noop");

    expect(
      evaluateActivitySave({
        values: buildValues(),
        meta: { isDirty: true, isValid: false },
        activity: null,
      }).action,
    ).toBe("noop");
  });

  it("patches when an existing activity is dirty and valid", () => {
    const result = evaluateActivitySave({
      values: buildValues({ title: "Updated" }),
      meta: { isDirty: true, isValid: true },
      activity: buildActivity(),
    });

    expect(result.action).toBe("patch");
  });

  it("noops patch when clean or invalid", () => {
    expect(
      evaluateActivitySave({
        values: buildValues(),
        meta: { isDirty: false, isValid: true },
        activity: buildActivity(),
      }).action,
    ).toBe("noop");

    expect(
      evaluateActivitySave({
        values: buildValues({ title: "" }),
        meta: { isDirty: true, isValid: false },
        activity: buildActivity(),
      }).action,
    ).toBe("noop");
  });

  it("never returns delete from the evaluate pipeline", () => {
    const result = evaluateActivitySave({
      values: buildValues({ title: "" }),
      meta: { isDirty: true, isValid: false },
      activity: buildActivity(),
    });

    expect(result.action).toBe("noop");
    expect(result.action).not.toBe("delete" as typeof result.action);
  });
});
