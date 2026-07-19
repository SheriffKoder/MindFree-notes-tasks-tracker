/**
 * @file features/activity/activity-calendar-cell/ui/activity-calendar-cell.tsx
 * Activity-specific body for an in-month calendar cell.
 */

import { memo, useMemo } from "react";

import type { TaskCalendarDay } from "@/entities/activity";
import {
  deriveTodayProgress,
  isMeaningfulRecord,
  resolveRecordConfiguration,
} from "@/entities/activity";
import { ACTIVITY_CALENDAR_CELL_CSS_VARS, ACTIVITY_CALENDAR_CELL_STYLE_CONFIG } from "@/features/activity/activity-calendar-cell/lib/cell-style-config";
import { formatPillProgress } from "@/features/activity/activity-calendar-cell/lib/format-pill-progress";
import { ActivityTaskPill } from "@/features/activity/activity-calendar-cell/ui/activity-task-pill";
import { cn } from "@/lib/utils";

export interface ActivityCalendarCellProps {
  /** Prepared calendar day with active tasks already filtered upstream. */
  day: TaskCalendarDay;
  /** Whether this day matches the current `selectedDate`. */
  isSelected?: boolean;
  /** Whether this day is today (resolved once per grid render). */
  isToday?: boolean;
}

/**
 * Renders one calendar day as a single-column grid of task pills plus a day
 * number badge. Visibility filtering happens before this component receives props.
 */
export const ActivityCalendarCell = memo(function ActivityCalendarCell({
  day,
  isSelected = false,
  isToday = false,
}: ActivityCalendarCellProps) {
  const { maxVisiblePills } = ACTIVITY_CALENDAR_CELL_STYLE_CONFIG.layout;
  const fallbackColor =
    ACTIVITY_CALENDAR_CELL_STYLE_CONFIG.colors.taskColorFallback;

  const { visibleActivities, overflowCount } = useMemo(() => {
    const visible = day.activities.slice(0, maxVisiblePills);
    const overflowCount = Math.max(day.activities.length - visible.length, 0);

    return { visibleActivities: visible, overflowCount };
  }, [day.activities, maxVisiblePills]);

  const hasActivities = day.activities.length > 0;

  return (
    <div
      style={ACTIVITY_CALENDAR_CELL_CSS_VARS}
      className={cn(
        "relative flex h-full min-h-0 w-full max-w-full min-w-0 flex-col overflow-hidden bg-[var(--activity-cell-bg-default)] p-1 transition-colors duration-200 hover:bg-[var(--activity-cell-hover-light)] dark:hover:bg-[var(--activity-cell-hover-dark)]",
        isSelected &&
          "bg-[var(--activity-cell-bg-selected)] ring-2 ring-inset ring-[var(--activity-cell-border-selected)]",
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute bottom-1 right-1 flex min-w-[1.25rem] items-center justify-center text-caption font-medium leading-none",
          isToday
            ? "size-5 rounded-full bg-[var(--activity-cell-today-bg)] [color:var(--activity-cell-today-fg)]"
            : hasActivities
              ? "[color:var(--activity-cell-day-number)]"
              : "[color:var(--activity-cell-day-number-muted)]",
        )}
        aria-hidden
      >
        {day.day}
      </span>

      {hasActivities ? (
        <div className="grid min-h-0 w-full min-w-0 flex-1 grid-cols-1 content-start gap-0.5 pb-4 pr-5">
          {visibleActivities.map(({ activity, record }) => {
            const isReminder = activity.kind === "reminder";
            const { trackingMode } = resolveRecordConfiguration(
              activity,
              record,
            );
            // Reminders are boolean existence only — never show goal progress.
            const progressLabel = isReminder
              ? null
              : formatPillProgress(
                  deriveTodayProgress(activity, record).dimensions,
                );

            return (
              <ActivityTaskPill
                key={activity.id}
                color={activity.color ?? fallbackColor}
                isDone={
                  record !== null && isMeaningfulRecord(record, trackingMode)
                }
                progressLabel={progressLabel}
                title={activity.title}
              />
            );
          })}
          {overflowCount > 0 ? (
            <p className="truncate text-[10px] font-medium leading-tight [color:var(--activity-cell-overflow)] md:text-caption">
              +{overflowCount} more
            </p>
          ) : null}
        </div>
      ) : (
        <div className="flex h-full min-h-0 items-start pb-4 pr-5">
          <span
            className="text-[10px] [color:var(--activity-cell-day-number-muted)] md:text-caption"
            aria-hidden
          >
            &nbsp;
          </span>
        </div>
      )}
    </div>
  );
});
