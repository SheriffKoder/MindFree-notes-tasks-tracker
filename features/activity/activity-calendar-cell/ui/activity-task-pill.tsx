/**
 * @file features/activity/activity-calendar-cell/ui/activity-task-pill.tsx
 * Single-task pill for an activity calendar day cell.
 */

import { Check } from "lucide-react";
import { memo } from "react";

import { ACTIVITY_CALENDAR_CELL_STYLE_CONFIG } from "@/features/activity/activity-calendar-cell/lib/cell-style-config";

export interface ActivityTaskPillProps {
  /** Task title shown inside the pill. */
  title: string;
  /** Task color used for text and the tinted background layer. */
  color: string;
  /** Whether the day's record counts as meaningful completion. */
  isDone: boolean;
  /**
   * Compact day progress (`1/2`, `5m/5m`, `1/2 · 5m/5m`), or `null` when the
   * mode has no numeric cue (boolean / goal-less count → check when done).
   */
  progressLabel: string | null;
}

/**
 * Renders one task as a color-tinted pill: absolute inset background at low
 * opacity, title text in the task color, no leading dot. Day progress shows as
 * a compact value/goal label, or a check when done with no numeric cue.
 */
export const ActivityTaskPill = memo(function ActivityTaskPill({
  title,
  color,
  isDone,
  progressLabel,
}: ActivityTaskPillProps) {
  const { backgroundOpacity, incompleteOpacity } =
    ACTIVITY_CALENDAR_CELL_STYLE_CONFIG.pill;
  const tooltip =
    progressLabel !== null ? `${title} · ${progressLabel}` : title;

  return (
    <div
      className="relative min-w-0 max-w-full rounded-full px-1.5 py-px"
      style={!isDone ? { opacity: incompleteOpacity } : undefined}
      title={tooltip}
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          backgroundColor: color,
          opacity: backgroundOpacity,
        }}
      />
      <span className="relative flex min-w-0 items-center gap-0.5">
        <span
          className="min-w-0 flex-1 truncate text-[10px] font-medium leading-tight md:text-caption"
          style={{ color }}
        >
          {title}
        </span>
        {progressLabel !== null ? (
          <span
            className="shrink-0 text-[8px] font-medium tabular-nums leading-tight md:text-[10px]"
            style={{ color }}
          >
            {progressLabel}
          </span>
        ) : isDone ? (
          <Check
            aria-hidden
            className="h-2.5 w-2.5 shrink-0 md:h-3 md:w-3"
            style={{ color }}
            strokeWidth={2.5}
          />
        ) : null}
      </span>
    </div>
  );
});
