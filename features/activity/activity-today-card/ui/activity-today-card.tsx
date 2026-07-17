/**
 * @file features/activity/activity-today-card/ui/activity-today-card.tsx
 * Compact, collapsible Home Today activity row (definition + derived progress).
 *
 * Summary row: `chevron + percent + title` on the left, a mode icon + inline
 * quick-record stepper on the right. The chevron toggles a description panel
 * (the day's record note). Dumb by design — no query/mutation/context reads;
 * recording + description writes are wired in Milestone 2 (both are visual
 * placeholders for now).
 */

"use client";

import { ChevronRight, Clock, Hash } from "lucide-react";
import { memo, useState } from "react";

import DonutChart from "@/components/donut-chart";
import type { TodayActivity } from "@/entities/activity";
import {
  ACTIVITY_TODAY_CARD_CSS_VARS,
  ACTIVITY_TODAY_CARD_STYLE_CONFIG,
} from "@/features/activity/activity-today-card/lib/activity-today-style-config";
import { cn } from "@/lib/utils";
import { Incrementer } from "@/shared/incrementer";

export interface ActivityTodayCardProps {
  /** Derived activity + today's record + progress to display. */
  today: TodayActivity;
  /**
   * Whether the description panel starts expanded. Defaults to closed so Home
   * stays compact; other surfaces can opt into open-by-default.
   */
  defaultOpen?: boolean;
}

/** Skips re-render when `today` and `defaultOpen` are referentially equal. */
export const ActivityTodayCard = memo(function ActivityTodayCard({
  today,
  defaultOpen = false,
}: ActivityTodayCardProps) {
  const { activity, progress, record } = today;
  const [open, setOpen] = useState(defaultOpen);
  const color =
    activity.color ?? ACTIVITY_TODAY_CARD_STYLE_CONFIG.colors.taskColorFallback;
  const isDurationMode =
    activity.trackingMode === "duration" ||
    activity.trackingMode === "count+duration";
  const ModeIcon = isDurationMode ? Clock : Hash;

  return (
    <div style={ACTIVITY_TODAY_CARD_CSS_VARS} className="mb-2">
      <div className="group flex items-center gap-1.5 px-1 py-1 transition-colors duration-150 hover:[background-color:var(--today-card-hover-light)] dark:hover:[background-color:var(--today-card-hover-dark)]">
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

        <div aria-hidden className="h-6 w-6 shrink-0">
          {progress.percent !== null ? (
            <DonutChart
              color={color}
              percentage={progress.percent}
              radius={22}
              showLabel={false}
              trackColor={`color-mix(in srgb, ${color} 20%, transparent)`}
            />
          ) : null}
        </div>

        <span className="min-w-0 flex-1 truncate text-sm font-semibold [color:var(--today-card-title)]">
          {activity.title}
        </span>

        <ModeIcon
          aria-hidden
          className="h-3.5 w-3.5 shrink-0 [color:var(--today-card-dim)]"
        />

        <Incrementer
          aria-label={`Adjust ${activity.title}`}
          className="shrink-0"
          editable
          min={0}
          value={progress.value}
          valueVariant="boxed"
          onChange={NOOP}
        />
      </div>

      {open ? (
        <div className="px-1 pb-2 pl-8">
          <textarea
            className="w-full resize-none border-[var(--color-border)] bg-transparent px-2 py-1 text-caption [color:var(--color-fg)] outline-none placeholder:[color:var(--color-fg-hint)] focus-visible:[border-color:color-mix(in_srgb,var(--color-accent)_60%,var(--color-border))]"
            defaultValue={record?.description ?? ""}
            placeholder={`How did your ${activity.title.toLowerCase()} go today? …`}
            rows={2}
          />
        </div>
      ) : null}
    </div>
  );
});
const NOOP = () => {};

