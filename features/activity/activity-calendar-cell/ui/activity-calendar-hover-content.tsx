/**
 * @file features/activity/activity-calendar-cell/ui/activity-calendar-hover-content.tsx
 * Rich peek body for a calendar day of activities inside the shared cursor tooltip.
 */

import type { TaskCalendarDay } from "@/entities/activity";
import {
  deriveTodayProgress,
  isMeaningfulRecord,
  resolveRecordConfiguration,
} from "@/entities/activity";
import {
  ACTIVITY_CALENDAR_CELL_CSS_VARS,
  ACTIVITY_CALENDAR_CELL_STYLE_CONFIG,
} from "@/features/activity/activity-calendar-cell/lib/cell-style-config";
import { formatPillProgress } from "@/features/activity/activity-calendar-cell/lib/format-pill-progress";
import { ActivityTaskPill } from "@/features/activity/activity-calendar-cell/ui/activity-task-pill";
import { formatDayAriaLabel } from "@/shared/calendar";

export interface ActivityCalendarHoverContentProps {
  day: TaskCalendarDay;
}

/**
 * Whether a calendar day has peekable activities for the hover tip.
 */
export function activityCalendarDayHasHoverContent(
  day: TaskCalendarDay,
): boolean {
  return day.activities.length > 0;
}

/**
 * Full-day activity peek: date header + every activity pill (no maxVisible slice).
 */
export function ActivityCalendarHoverContent({
  day,
}: ActivityCalendarHoverContentProps) {
  const fallbackColor =
    ACTIVITY_CALENDAR_CELL_STYLE_CONFIG.colors.taskColorFallback;

  if (day.activities.length === 0) {
    return null;
  }

  return (
    <div
      style={ACTIVITY_CALENDAR_CELL_CSS_VARS}
      className="flex min-w-0 flex-col gap-2"
    >
      <p className="text-caption [color:var(--color-fg-muted)]">
        {formatDayAriaLabel(day.date)}
      </p>
      <div className="flex min-w-0 flex-col gap-1">
        {day.activities.map(({ activity, record }) => {
          const isReminder = activity.kind === "reminder";
          const { trackingMode } = resolveRecordConfiguration(activity, record);
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
      </div>
    </div>
  );
}
