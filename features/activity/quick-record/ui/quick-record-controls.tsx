/**
 * @file features/activity/quick-record/ui/quick-record-controls.tsx
 * Presentational count/duration/boolean controls driven by `useQuickRecord`.
 */

"use client";

import { Check } from "lucide-react";
import { memo } from "react";

import type { Activity } from "@/entities/activity";
import { getQuickRecordControlVisibility } from "@/features/activity/quick-record/model/quick-record-control-visibility";
import type { UseQuickRecordResult } from "@/features/activity/quick-record/model/use-quick-record";
import { QuickRecordCount } from "@/features/activity/quick-record/ui/quick-record-count";
import { QuickRecordDuration } from "@/features/activity/quick-record/ui/quick-record-duration";
import { cn } from "@/lib/utils";

export interface QuickRecordControlsProps {
  /** Activity title/source for accessible labels. */
  activity: Pick<Activity, "title">;
  /** Shared orchestrator state and handlers. */
  recording: UseQuickRecordResult;
}

/** Mode-appropriate inline recording control(s) for one day row. */
export const QuickRecordControls = memo(function QuickRecordControls({
  activity,
  recording,
}: QuickRecordControlsProps) {
  const {
    trackingMode,
    count,
    duration,
    done,
    setCount,
    setDuration,
    toggleDone,
    addMinutes,
  } = recording;

  if (trackingMode === "boolean") {
    return (
      <QuickRecordToggle
        done={done}
        label={activity.title}
        onToggle={toggleDone}
      />
    );
  }

  const { showCount, showDuration } =
    getQuickRecordControlVisibility(trackingMode);
  const showLabels = trackingMode === "count+duration";

  return (
    <div className="flex shrink-0 items-center gap-2">
      {showCount ? (
        <QuickRecordCount
          label={activity.title}
          showLabel={showLabels}
          value={count}
          onChange={setCount}
        />
      ) : null}
      {showDuration ? (
        <QuickRecordDuration
          label={activity.title}
          showLabel={showLabels}
          value={duration}
          onChange={setDuration}
          onTick={() => addMinutes(1)}
        />
      ) : null}
    </div>
  );
});

interface QuickRecordToggleProps {
  done: boolean;
  label: string;
  onToggle: () => void;
}

function QuickRecordToggle({ done, label, onToggle }: QuickRecordToggleProps) {
  return (
    <button
      aria-label={done ? `Mark ${label} not done` : `Mark ${label} done`}
      aria-pressed={done}
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors",
        done
          ? "[background-color:color-mix(in_srgb,var(--color-accent)_20%,transparent)] [border-color:var(--color-accent)] [color:var(--color-accent)]"
          : "[border-color:var(--color-border)] [color:var(--today-card-dim)]",
      )}
      type="button"
      onClick={onToggle}
    >
      <Check aria-hidden className="h-4 w-4" />
    </button>
  );
}
