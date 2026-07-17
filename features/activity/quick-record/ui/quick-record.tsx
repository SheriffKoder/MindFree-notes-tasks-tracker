/**
 * @file features/activity/quick-record/ui/quick-record.tsx
 * Inline recording controls for one Home Today row. Switches on `trackingMode`:
 *
 *   boolean        → done toggle
 *   count          → count stepper
 *   duration       → minutes stepper
 *   count+duration → both steppers
 *
 * Mounted in the card's `recordSlot` by the view (Home never inlines the
 * recording flow — it lives in `useQuickRecord`). Values are absolute and
 * optimistic; one write fans out to Home, the Tasks calendar, and Progress via
 * the sync hub.
 */

"use client";

import { Check } from "lucide-react";
import { memo } from "react";

import type { TodayActivity } from "@/entities/activity";
import { QuickRecordCount } from "@/features/activity/quick-record/ui/quick-record-count";
import { QuickRecordDuration } from "@/features/activity/quick-record/ui/quick-record-duration";
import { useQuickRecord } from "@/features/activity/quick-record/model/use-quick-record";
import { cn } from "@/lib/utils";

export interface QuickRecordProps {
  /** Derived activity + today's record to record against. */
  today: TodayActivity;
  /** Day to record against (`YYYY-MM-DD`). Defaults to today. */
  date?: string;
}

/** Renders the mode-appropriate inline recording control(s) for a Today row. */
export const QuickRecord = memo(function QuickRecord({
  today,
  date,
}: QuickRecordProps) {
  const { activity, record } = today;
  const { count, duration, done, setCount, setDuration, toggleDone, addMinutes } =
    useQuickRecord({ activity, record, date });

  const mode = activity.trackingMode;

  if (mode === "boolean") {
    return (
      <QuickRecordToggle
        done={done}
        label={activity.title}
        onToggle={toggleDone}
      />
    );
  }

  const showCount = mode === "count" || mode === "count+duration";
  const showDuration = mode === "duration" || mode === "count+duration";

  return (
    <div className="flex shrink-0 items-center gap-2">
      {showCount ? (
        <QuickRecordCount
          label={activity.title}
          value={count}
          onChange={setCount}
        />
      ) : null}
      {showDuration ? (
        <QuickRecordDuration
          label={activity.title}
          value={duration}
          onChange={setDuration}
          onTick={() => addMinutes(1)}
        />
      ) : null}
    </div>
  );
});

interface QuickRecordToggleProps {
  /** Whether the activity is recorded done today. */
  done: boolean;
  /** Activity title, used for the accessible name. */
  label: string;
  /** Flips the done state. */
  onToggle: () => void;
}

/** Boolean-mode done toggle — a check button that fills when done. */
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
