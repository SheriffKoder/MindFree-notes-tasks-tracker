/**
 * @file features/activity/quick-record/model/quick-record-control-visibility.ts
 * Pure tracking-mode dispatch for count and duration recording controls.
 */

import type { TrackingMode } from "@/entities/activity";

export interface QuickRecordControlVisibility {
  showCount: boolean;
  showDuration: boolean;
}

export function getQuickRecordControlVisibility(
  trackingMode: TrackingMode,
): QuickRecordControlVisibility {
  return {
    showCount:
      trackingMode === "count" || trackingMode === "count+duration",
    showDuration:
      trackingMode === "duration" || trackingMode === "count+duration",
  };
}
