/**
 * @file features/activity/quick-record/model/quick-record-control-visibility.test.ts
 * Locks the tracking-mode dispatcher for inline record inputs.
 */

import { describe, expect, it } from "vitest";

import { getQuickRecordControlVisibility } from "@/features/activity/quick-record/model/quick-record-control-visibility";

describe("getQuickRecordControlVisibility", () => {
  it.each([
    ["boolean", false, false],
    ["count", true, false],
    ["duration", false, true],
    ["count+duration", true, true],
  ] as const)(
    "maps %s to count=%s and duration=%s",
    (trackingMode, showCount, showDuration) => {
      expect(getQuickRecordControlVisibility(trackingMode)).toEqual({
        showCount,
        showDuration,
      });
    },
  );
});
