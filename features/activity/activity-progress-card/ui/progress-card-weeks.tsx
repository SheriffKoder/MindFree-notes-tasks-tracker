/**
 * @file features/activity/activity-progress-card/ui/progress-card-weeks.tsx
 * Responsive week strip for a Progress card.
 *
 * Purpose: Lay out W1–W6 columns in a responsive grid. Empty weeks still render
 *          so column positions stay stable across months.
 * Used in: `features/activity/activity-progress-card/ui/activity-progress-card.tsx`.
 * Used for: Bottom section of each Progress card.
 */

import type { TaskWeekProgress } from "@/entities/activity";
import { ProgressWeekColumn } from "@/features/activity/activity-progress-card/ui/progress-week-column";

export interface ProgressCardWeeksProps {
  /** Every clipped ISO week overlapping the month. */
  weeks: TaskWeekProgress[];
}

/**
 * Renders the Progress card week row.
 */
export function ProgressCardWeeks({ weeks }: ProgressCardWeeksProps) {
  return (
    <div
      className="grid gap-2 border-t border-[var(--color-border)] pt-3"
      style={{
        gridTemplateColumns: `repeat(${Math.max(weeks.length, 1)}, minmax(0, 1fr))`,
      }}
    >
      {weeks.map((week) => (
        <ProgressWeekColumn key={week.weekNumber} week={week} />
      ))}
    </div>
  );
}
