/**
 * @file shared/lib/today/live-today-store.test.ts
 * Live today store — only notifies when the ISO day changes.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getTodayIsoDate = vi.hoisted(() => vi.fn(() => "2026-07-27"));

vi.mock("@/shared/lib/today/get-today-iso-date", () => ({
  getTodayIsoDate,
}));

describe("live-today-store", () => {
  beforeEach(() => {
    getTodayIsoDate.mockReturnValue("2026-07-27");
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("notifies subscribers only when the calendar day changes", async () => {
    const {
      getLiveTodaySnapshot,
      refreshLiveTodayFromClock,
      subscribeLiveToday,
    } = await import("@/shared/lib/today/live-today-store");

    const listener = vi.fn();
    const unsubscribe = subscribeLiveToday(listener);

    expect(getLiveTodaySnapshot()).toBe("2026-07-27");

    refreshLiveTodayFromClock();
    expect(listener).not.toHaveBeenCalled();

    getTodayIsoDate.mockReturnValue("2026-07-28");
    refreshLiveTodayFromClock();

    expect(getLiveTodaySnapshot()).toBe("2026-07-28");
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
  });
});
