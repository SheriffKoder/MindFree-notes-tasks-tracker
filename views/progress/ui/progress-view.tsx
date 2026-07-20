/**
 * @file views/progress/ui/progress-view.tsx
 * Server-rendered Progress page composition.
 *
 * Purpose: Page shell — heading, month navigator island, and async card grid.
 *          Cards stream under Suspense; the navigator hydrates as the only
 *          intentional Progress client island.
 * Used in: `views/progress/index.tsx` → `app/(app)/progress/page.tsx`.
 * Used for: `/progress` route body.
 */

import { Suspense } from "react";

import { ProgressCards } from "@/views/progress/ui/progress-cards";
import { ProgressCardsFallback } from "@/views/progress/ui/progress-cards-fallback";
import { ProgressMonthNavigator } from "@/views/progress/ui/progress-month-navigator";
import { ProgressPageShell } from "@/views/progress/ui/progress-page-shell";

export interface ProgressViewProps {
  /** Resolved month key (`YYYY-MM`). */
  month: string;
}

/**
 * Renders the Progress page shell and streams the report cards.
 *
 * @param props - selected month
 */
export function ProgressView({ month }: ProgressViewProps) {
  return (
    <ProgressPageShell
      monthControls={
        <Suspense
          fallback={
            <p className="text-sm tabular-nums [color:var(--color-fg-muted)]">
              {month}
            </p>
          }
        >
          <ProgressMonthNavigator month={month} />
        </Suspense>
      }
    >
      <Suspense fallback={<ProgressCardsFallback />}>
        <ProgressCards month={month} />
      </Suspense>
    </ProgressPageShell>
  );
}
