/**
 * @file features/activity/activity-today-card/ui/today-card-identity.tsx
 * Identity cell for the Home Today row: progress donut ("pie") + activity title.
 */

"use client";

import { memo } from "react";

import DonutChart from "@/components/donut-chart";

export interface TodayCardIdentityProps {
  /** Activity title (single line, truncates). */
  title: string;
  /** Resolved task color (caller applies the fallback). */
  color: string;
  /** Whole-number completion percent, or `null` when unbounded (donut hidden). */
  percent: number | null;
}

/** Donut + title. Pure display; truncates the title within its grid cell. */
export const TodayCardIdentity = memo(function TodayCardIdentity({
  title,
  color,
  percent,
}: TodayCardIdentityProps) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <span aria-hidden className="h-6 w-6 shrink-0">
        {percent !== null ? (
          <DonutChart
            color={color}
            percentage={percent}
            radius={22}
            showLabel={false}
            trackColor={`color-mix(in srgb, ${color} 20%, transparent)`}
          />
        ) : null}
      </span>
      <span className="min-w-0 truncate text-sm font-semibold [color:var(--today-card-title)]">
        {title}
      </span>
    </div>
  );
});
