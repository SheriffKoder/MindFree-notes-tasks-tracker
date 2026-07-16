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
  /** Precomputed month completion rate (0–100); looked up once per task upstream. */
  completionPercent: number;
}

/**
 * Renders one task as a color-tinted pill: absolute inset background at low
 * opacity, title text in the task color, no leading dot. Month progress shows
 * as a percent, or a check when the month is fully complete (100%).
 */
export const ActivityTaskPill = memo(function ActivityTaskPill({
  title,
  color,
  isDone,
  completionPercent,
}: ActivityTaskPillProps) {
  const { backgroundOpacity, incompleteOpacity } =
    ACTIVITY_CALENDAR_CELL_STYLE_CONFIG.pill;
  const isMonthComplete = completionPercent >= 100;

  return (
    <div
      className="relative min-w-0 max-w-full rounded-full px-1.5 py-px"
      style={!isDone ? { opacity: incompleteOpacity } : undefined}
      title={`${title} · ${completionPercent}%`}
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
        {isMonthComplete ? (
          <Check
            aria-hidden
            className="h-2.5 w-2.5 shrink-0 md:h-3 md:w-3"
            style={{ color }}
            strokeWidth={2.5}
          />
        ) : (
          <span
            className="shrink-0 text-[8px] font-medium tabular-nums leading-tight md:text-[10px]"
            style={{ color }}
          >
            {completionPercent}%
          </span>
        )}
      </span>
    </div>
  );
});
