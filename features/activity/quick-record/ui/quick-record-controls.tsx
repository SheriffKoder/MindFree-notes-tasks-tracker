/**
 * @file features/activity/quick-record/ui/quick-record-controls.tsx
 * Presentational count/duration/boolean controls driven by `useQuickRecord`.
 *
 * When `showGoals` is true, each value control stacks its matching goal input
 * below it in a column (drawer-only). Home keeps values alone.
 */

"use client";

import { Check } from "lucide-react";
import { memo } from "react";

import type { Activity } from "@/entities/activity";
import { getQuickRecordControlVisibility } from "@/features/activity/quick-record/model/quick-record-control-visibility";
import type { UseQuickRecordResult } from "@/features/activity/quick-record/model/use-quick-record";
import { QuickRecordCount } from "@/features/activity/quick-record/ui/quick-record-count";
import { QuickRecordDuration } from "@/features/activity/quick-record/ui/quick-record-duration";
import { Incrementer } from "@/shared/incrementer";
import { cn } from "@/lib/utils";

export interface QuickRecordControlsProps {
  /** Activity title/source for accessible labels. */
  activity: Pick<Activity, "title">;
  /** Shared orchestrator state and handlers. */
  recording: UseQuickRecordResult;
  /** Stacks a goal input under each value control. Defaults off. */
  showGoals?: boolean;
}

/** Mode-appropriate inline recording control(s) for one day row. */
export const QuickRecordControls = memo(function QuickRecordControls({
  activity,
  recording,
  showGoals = false,
}: QuickRecordControlsProps) {
  const {
    trackingMode,
    count,
    duration,
    goal,
    goalDuration,
    done,
    setCount,
    setDuration,
    setGoal,
    setGoalDuration,
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
    <div className="flex shrink-0 items-start gap-2">
      {showCount ? (
        <div className="flex flex-col items-end gap-1">
          <QuickRecordCount
            label={activity.title}
            showLabel={showLabels}
            value={count}
            onChange={setCount}
          />
          {showGoals ? (
            <GoalInput
              label={showLabels ? "Count goal" : "Goal"}
              value={goal}
              onChange={setGoal}
            />
          ) : null}
        </div>
      ) : null}
      {showDuration ? (
        <div className="flex flex-col items-end gap-1">
          <QuickRecordDuration
            label={activity.title}
            showLabel={showLabels}
            value={duration}
            onChange={setDuration}
            onTick={() => addMinutes(1)}
          />
          {showGoals ? (
            <GoalInput
              label={showLabels ? "Minutes goal" : "Goal"}
              value={goalDuration}
              onChange={setGoalDuration}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
});

interface GoalInputProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
}

function GoalInput({ label, value, onChange }: GoalInputProps) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <span className="text-[10px] [color:var(--today-card-dim)]">{label}</span>
      <Incrementer
        allowNull
        aria-label={`Adjust ${label.toLowerCase()}`}
        editable
        min={1}
        value={value}
        valueVariant="boxed"
        onChange={onChange}
      />
    </div>
  );
}

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
