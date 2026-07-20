/**
 * @file shared/week-grouping/lib/get-weeks-in-month.test.ts
 * Unit tests for ISO week range generation inside a month.
 *
 * Purpose: Lock week-boundary edge cases (invalid keys, leap February, six-week
 *          months, empty weeks) and confirm `group-by-week-in-month` still aligns.
 * Used in: Vitest (`getWeeksInMonth` regression suite).
 * Used for: Step 1 verification of `get-weeks-in-month.ts`.
 */

import { describe, expect, it } from "vitest";

import { getWeeksInMonth } from "@/shared/week-grouping/lib/get-weeks-in-month";
import { groupItemsByWeekInMonth } from "@/shared/week-grouping/lib/group-by-week-in-month";

describe("getWeeksInMonth", () => {
  it("returns [] for invalid month keys", () => {
    expect(getWeeksInMonth("")).toEqual([]);
    expect(getWeeksInMonth("2026-7")).toEqual([]);
    expect(getWeeksInMonth("2026/07")).toEqual([]);
  });

  it("clips a month that begins on Sunday", () => {
    // 2026-02-01 is Sunday → W1 is a single clipped day.
    const weeks = getWeeksInMonth("2026-02");

    expect(weeks[0]).toEqual({
      weekNumber: 1,
      rangeStart: "2026-02-01",
      rangeEnd: "2026-02-01",
    });
    expect(weeks[1]).toEqual({
      weekNumber: 2,
      rangeStart: "2026-02-02",
      rangeEnd: "2026-02-08",
    });
    expect(weeks.at(-1)).toEqual({
      weekNumber: 5,
      rangeStart: "2026-02-23",
      rangeEnd: "2026-02-28",
    });
    expect(weeks).toHaveLength(5);
  });

  it("keeps full weeks when the month begins on Monday", () => {
    // 2026-06-01 is Monday.
    const weeks = getWeeksInMonth("2026-06");

    expect(weeks[0]).toEqual({
      weekNumber: 1,
      rangeStart: "2026-06-01",
      rangeEnd: "2026-06-07",
    });
    expect(weeks.at(-1)).toEqual({
      weekNumber: 5,
      rangeStart: "2026-06-29",
      rangeEnd: "2026-06-30",
    });
    expect(weeks).toHaveLength(5);
  });

  it("clips the final week when the month ends midweek", () => {
    // 2026-04-30 is Thursday.
    const weeks = getWeeksInMonth("2026-04");

    expect(weeks.at(-1)).toEqual({
      weekNumber: 5,
      rangeStart: "2026-04-27",
      rangeEnd: "2026-04-30",
    });
  });

  it("includes Feb 29 in a leap year", () => {
    // 2024-02-01 is Thursday; 2024-02-29 is Thursday.
    const weeks = getWeeksInMonth("2024-02");

    expect(weeks.some((week) => week.rangeEnd === "2024-02-29")).toBe(true);
    expect(weeks.at(-1)).toEqual({
      weekNumber: 5,
      rangeStart: "2024-02-26",
      rangeEnd: "2024-02-29",
    });
  });

  it("emits six weeks when the month spans six ISO weeks", () => {
    // 2026-08-01 is Saturday → six clipped weeks.
    const weeks = getWeeksInMonth("2026-08");

    expect(weeks).toHaveLength(6);
    expect(weeks[0]).toEqual({
      weekNumber: 1,
      rangeStart: "2026-08-01",
      rangeEnd: "2026-08-02",
    });
    expect(weeks[5]).toEqual({
      weekNumber: 6,
      rangeStart: "2026-08-31",
      rangeEnd: "2026-08-31",
    });
  });
});

describe("groupItemsByWeekInMonth (range helper integration)", () => {
  it("preserves empty-week emission via getWeeksInMonth", () => {
    const { weeks, ungrouped } = groupItemsByWeekInMonth(
      [{ id: "a", date: "2026-08-15" }],
      "2026-08",
      "date",
      { includeEmptyWeeks: true },
    );

    expect(ungrouped).toEqual([]);
    expect(weeks).toHaveLength(6);
    expect(weeks[2]).toMatchObject({
      weekNumber: 3,
      rangeStart: "2026-08-10",
      rangeEnd: "2026-08-16",
      items: [{ id: "a", date: "2026-08-15" }],
    });
    expect(weeks.filter((week) => week.items.length === 0)).toHaveLength(5);
  });

  it("renumbers non-empty weeks when empty weeks are omitted", () => {
    const { weeks } = groupItemsByWeekInMonth(
      [{ id: "a", date: "2026-08-15" }],
      "2026-08",
      "date",
    );

    expect(weeks).toEqual([
      {
        weekNumber: 1,
        rangeStart: "2026-08-10",
        rangeEnd: "2026-08-16",
        items: [{ id: "a", date: "2026-08-15" }],
      },
    ]);
  });
});
