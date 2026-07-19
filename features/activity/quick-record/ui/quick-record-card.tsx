/**
 * @file features/activity/quick-record/ui/quick-record-card.tsx
 * Composes a Today card with one shared quick-record orchestrator for both the
 * value controls and the expandable description note.
 */

"use client";

import { memo } from "react";

import type { TodayActivity } from "@/entities/activity";
import { ActivityTodayCard } from "@/features/activity/activity-today-card";
import { useQuickRecord } from "@/features/activity/quick-record/model/use-quick-record";
import { QuickRecordControls } from "@/features/activity/quick-record/ui/quick-record-controls";

export interface QuickRecordCardProps {
  /** Derived activity + record + progress for the day. */
  today: TodayActivity;
  /** Day to record against (`YYYY-MM-DD`). Defaults to today inside the hook. */
  date?: string;
  /** Whether the description panel starts expanded. */
  defaultOpen?: boolean;
}

/**
 * One hook instance drives count/duration controls and description persistence.
 */
export const QuickRecordCard = memo(function QuickRecordCard({
  today,
  date,
  defaultOpen,
}: QuickRecordCardProps) {
  const recording = useQuickRecord({
    activity: today.activity,
    record: today.record,
    date,
  });

  return (
    <ActivityTodayCard
      defaultOpen={defaultOpen}
      description={recording.description}
      recordSlot={
        <QuickRecordControls activity={today.activity} recording={recording} />
      }
      today={today}
      onDescriptionChange={recording.setDescription}
    />
  );
});
