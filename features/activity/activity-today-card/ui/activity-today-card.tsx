/**
 * @file features/activity/activity-today-card/ui/activity-today-card.tsx
 * Compact, collapsible Home Today activity row, laid out as a grid of cells:
 *
 *   [chevron] [pie + label] [current/goal] … space … [inputs]
 *
 * Each cell is its own component (identity / progress / controls / note); this
 * file only composes them and owns the expand/collapse state. Dumb by design —
 * no query/mutation/context reads. Interactive recording is injected by the
 * view through `recordSlot` (`<QuickRecord>`); with no slot it falls back to a
 * read-only stepper.
 */

"use client";

import { ChevronRight } from "lucide-react";
import { memo, useState, type ReactNode } from "react";

import type { TodayActivity } from "@/entities/activity";
import {
  ACTIVITY_TODAY_CARD_CSS_VARS,
  ACTIVITY_TODAY_CARD_STYLE_CONFIG,
} from "@/features/activity/activity-today-card/lib/activity-today-style-config";
import { TodayCardControls } from "@/features/activity/activity-today-card/ui/today-card-controls";
import { TodayCardIdentity } from "@/features/activity/activity-today-card/ui/today-card-identity";
import { TodayCardNote } from "@/features/activity/activity-today-card/ui/today-card-note";
import { TodayCardProgress } from "@/features/activity/activity-today-card/ui/today-card-progress";
import { cn } from "@/lib/utils";

export interface ActivityTodayCardProps {
  /** Derived activity + today's record + progress to display. */
  today: TodayActivity;
  /**
   * Whether the description panel starts expanded. Defaults to closed so Home
   * stays compact; other surfaces can opt into open-by-default.
   */
  defaultOpen?: boolean;
  /**
   * Interactive recording control injected by the view (e.g. `<QuickRecord>`).
   * When omitted the card renders a read-only stepper (`TodayCardControls`).
   */
  recordSlot?: ReactNode;
}

/** Skips re-render when `today` and `defaultOpen` are referentially equal. */
export const ActivityTodayCard = memo(function ActivityTodayCard({
  today,
  defaultOpen = false,
  recordSlot,
}: ActivityTodayCardProps) {
  const { activity, progress, record } = today;
  const [open, setOpen] = useState(defaultOpen);
  const color =
    activity.color ?? ACTIVITY_TODAY_CARD_STYLE_CONFIG.colors.taskColorFallback;

  return (
    <div style={ACTIVITY_TODAY_CARD_CSS_VARS} className="mb-2">
      <div className="group grid grid-cols-[auto_minmax(0,auto)_auto_1fr_auto] items-center gap-1.5 px-1 py-1 transition-colors duration-150 hover:[background-color:var(--today-card-hover-light)] dark:hover:[background-color:var(--today-card-hover-dark)]">
        <button
          aria-expanded={open}
          aria-label={open ? "Hide note" : "Show note"}
          className="shrink-0 [color:var(--today-card-dim)]"
          type="button"
          onClick={() => setOpen((value) => !value)}
        >
          <ChevronRight
            aria-hidden
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-200",
              open && "rotate-90",
            )}
          />
        </button>

        <TodayCardIdentity
          color={color}
          percent={progress.percent}
          title={activity.title}
        />

        <TodayCardProgress activity={activity} record={record} />

        <span aria-hidden />

        {recordSlot ?? (
          <TodayCardControls
            activity={activity}
            value={progress.value}
            onChange={NOOP}
          />
        )}
      </div>

      {open ? (
        <TodayCardNote description={record?.description ?? null} title={activity.title} />
      ) : null}
    </div>
  );
});

const NOOP = () => {};
