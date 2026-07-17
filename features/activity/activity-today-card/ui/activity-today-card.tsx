/**
 * @file features/activity/activity-today-card/ui/activity-today-card.tsx
 * Compact, presentational Home Today activity row (definition + derived progress).
 *
 * Borderless list-row: `chevron + percent + title` on the left, a dimmed
 * quick-record stepper on the right. Dumb by design — no query/mutation/context
 * reads; recording handlers are wired in Milestone 2 (the stepper is a disabled
 * visual placeholder for now).
 */

"use client";

import { ChevronRight, Clock, Hash } from "lucide-react";
import { memo } from "react";

import type { TodayActivity } from "@/entities/activity";
import {
  ACTIVITY_TODAY_CARD_CSS_VARS,
  ACTIVITY_TODAY_CARD_STYLE_CONFIG,
} from "@/features/activity/activity-today-card/lib/activity-today-style-config";
import { Incrementer } from "@/shared/incrementer";

export interface ActivityTodayCardProps {
  /** Derived activity + today's record + progress to display. */
  today: TodayActivity;
}

/** Skips re-render when `today` is referentially equal. */
export const ActivityTodayCard = memo(function ActivityTodayCard({
  today,
}: ActivityTodayCardProps) {
  const { activity, progress } = today;
  const color =
    activity.color ?? ACTIVITY_TODAY_CARD_STYLE_CONFIG.colors.taskColorFallback;
  const isDurationMode =
    activity.trackingMode === "duration" ||
    activity.trackingMode === "count+duration";
  const ModeIcon = isDurationMode ? Clock : Hash;

  return (
    <div
      style={ACTIVITY_TODAY_CARD_CSS_VARS}
      className="group flex items-center gap-1.5 rounded-md px-1 py-1 transition-colors duration-150 hover:[background-color:var(--today-card-hover-light)] dark:hover:[background-color:var(--today-card-hover-dark)]"
    >
      <ChevronRight
        aria-hidden
        className="h-3.5 w-3.5 shrink-0 [color:var(--today-card-dim)]"
      />

      <span
        className="w-9 shrink-0 text-right text-caption font-medium tabular-nums"
        style={{ color }}
      >
        {progress.percent !== null ? `${progress.percent}%` : ""}
      </span>

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
  );
});

const NOOP = () => {};
