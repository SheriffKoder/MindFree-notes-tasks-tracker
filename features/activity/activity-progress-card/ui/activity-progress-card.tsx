/**
 * @file features/activity/activity-progress-card/ui/activity-progress-card.tsx
 * Dumb Progress report card for one task.
 *
 * Purpose: Present a `ProgressTask` read model — header + donut, month/all-time
 *          summary, and weekly columns. Formatting only; no Progress math and
 *          no entity calculation imports.
 * Used in: `views/progress` (Step 6) via the feature barrel.
 * Used for: Each grid cell on the Progress page.
 */

import DonutChart from "@/components/donut-chart";
import type { ProgressTask } from "@/entities/activity";
import { ProgressCardSummary } from "@/features/activity/activity-progress-card/ui/progress-card-summary";
import { ProgressCardWeeks } from "@/features/activity/activity-progress-card/ui/progress-card-weeks";
import { cn } from "@/lib/utils";

export interface ActivityProgressCardProps {
  /** Server-assembled Progress card model. */
  task: ProgressTask;
}

const TASK_COLOR_FALLBACK = "var(--color-accent)";

/**
 * Renders one Progress task card.
 */
export function ActivityProgressCard({ task }: ActivityProgressCardProps) {
  const accent = task.color ?? TASK_COLOR_FALLBACK;
  const monthPercent = task.month.percent;
  const hasTarget = monthPercent !== null;

  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4",
        task.archivedAt !== null && "opacity-90",
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start gap-2">
            <span
              aria-hidden
              className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: accent }}
            />
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-sm font-medium [color:var(--color-fg)]">
                {task.title}
              </h3>
              {task.archivedAt !== null ? (
                <p className="mt-0.5 text-[11px] [color:var(--color-fg-muted)]">
                  Archived
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div
          aria-label={
            hasTarget
              ? `Month progress ${monthPercent}%`
              : "Month progress has no target"
          }
          className="h-14 w-14 shrink-0"
        >
          <DonutChart
            color={accent}
            percentage={hasTarget ? monthPercent : 0}
            radius={28}
            showLabel={hasTarget}
            trackColor={`color-mix(in srgb, ${accent} 20%, transparent)`}
          />
        </div>
      </header>

      <ProgressCardSummary
        allTime={task.allTime}
        goalPeriod={task.goalPeriod}
        month={task.month}
      />

      <ProgressCardWeeks weeks={task.weeks} />
    </article>
  );
}
