/**
 * @file features/activity/quick-record/ui/quick-record.tsx
 * Inline recording controls for one activity-day row. Owns a local
 * `useQuickRecord` instance for controls-only mounts.
 *
 * Prefer `<QuickRecordCard>` when the expandable note must share the same
 * orchestrator with these controls.
 */

"use client";

import { memo } from "react";

import type { TodayActivity } from "@/entities/activity";
import { useQuickRecord } from "@/features/activity/quick-record/model/use-quick-record";
import { QuickRecordControls } from "@/features/activity/quick-record/ui/quick-record-controls";

export interface QuickRecordProps {
  /** Derived activity + today's record to record against. */
  today: TodayActivity;
  /** Day to record against (`YYYY-MM-DD`). Defaults to today. */
  date?: string;
}

/** Renders the mode-appropriate inline recording control(s) for a day row. */
export const QuickRecord = memo(function QuickRecord({
  today,
  date,
}: QuickRecordProps) {
  const { activity, record } = today;
  const recording = useQuickRecord({ activity, record, date });

  return <QuickRecordControls activity={activity} recording={recording} />;
});
