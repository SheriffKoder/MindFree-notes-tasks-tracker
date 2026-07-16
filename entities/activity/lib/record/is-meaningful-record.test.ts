/**
 * @file entities/activity/lib/is-meaningful-record.test.ts
 * Locks the meaningful-record predicate per `trackingMode`: `boolean`/`count`
 * on count, `duration` on duration, and `count+duration` staying meaningful
 * until both dimensions are zero.
 */

import { describe, expect, it } from "vitest";

import { isMeaningfulRecord } from "@/entities/activity/lib/record/is-meaningful-record";

describe("isMeaningfulRecord", () => {
  it("boolean is meaningful only when count > 0", () => {
    expect(isMeaningfulRecord({ count: 1, duration: 0 }, "boolean")).toBe(true);
    expect(isMeaningfulRecord({ count: 0, duration: 0 }, "boolean")).toBe(false);
  });

  it("count tracks the count dimension", () => {
    expect(isMeaningfulRecord({ count: 3, duration: 0 }, "count")).toBe(true);
    expect(isMeaningfulRecord({ count: 0, duration: 5 }, "count")).toBe(false);
  });

  it("duration tracks the duration dimension", () => {
    expect(isMeaningfulRecord({ count: 0, duration: 5 }, "duration")).toBe(true);
    expect(isMeaningfulRecord({ count: 5, duration: 0 }, "duration")).toBe(false);
  });

  it("count+duration keeps the record until both are zero", () => {
    expect(isMeaningfulRecord({ count: 2, duration: 0 }, "count+duration")).toBe(true);
    expect(isMeaningfulRecord({ count: 0, duration: 30 }, "count+duration")).toBe(true);
    expect(isMeaningfulRecord({ count: 0, duration: 0 }, "count+duration")).toBe(false);
  });
});
