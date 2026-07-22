/**
 * @file views/home/ui/home-demo-viewing-day.tsx
 * Demo-only caption beside the Home title — which day Home Today records against.
 *
 * Purpose: Demo "today" is a fixed seeded date, not the wall clock. Without this
 *          hint, recording on Home and looking for that day on /tasks feels broken.
 * Used in: views/home/index.tsx
 */

"use client";

import { useDemoSession, useTodayIsoDate } from "@/shared/demo-session";
import { AlertTriangleIcon } from "lucide-react";

/**
 * Formats `YYYY-MM-DD` as a short local date label (e.g. `15 Jun 2026`).
 */
function formatViewingDayLabel(isoDate: string): string {
  const [yearPart, monthPart, dayPart] = isoDate.split("-");
  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Renders "viewing day …" for the demo account only; nothing for regular users.
 */
export function HomeDemoViewingDay() {
  const isDemoUser = useDemoSession();
  const todayIso = useTodayIsoDate();

  if (!isDemoUser) {
    return null;
  }

  return (
    <span className="text-caption font-normal [color:var(--color-fg-muted)] flex items-center gap-2 border px-2 py-1 rounded-md bg-yellow-500/10">
      <AlertTriangleIcon aria-hidden className="h-4 w-4" /> DEMO: updates will reflect on {formatViewingDayLabel(todayIso)}
    </span>
  );
}
