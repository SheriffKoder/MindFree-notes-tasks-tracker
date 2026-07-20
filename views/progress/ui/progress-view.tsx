/**
 * @file views/progress/ui/progress-view.tsx
 * Server-rendered Progress page composition.
 *
 * Purpose: Page shell — heading, month-navigator slot, and async card grid.
 *          Cards stream under Suspense; the navigator island lands in Step 7.
 * Used in: `views/progress/index.tsx` → `app/(app)/progress/page.tsx`.
 * Used for: `/progress` route body.
 */

import { Suspense, type ReactNode } from "react";

import { ProgressCards } from "@/views/progress/ui/progress-cards";

export interface ProgressViewProps {
  /** Resolved month key (`YYYY-MM`). */
  month: string;
  /**
   * Optional month navigator island (Step 7). When omitted, a static month
   * label occupies the slot so layout spacing stays stable.
   */
  monthNavigator?: ReactNode;
}

/**
 * Renders the Progress page shell and streams the report cards.
 *
 * @param props - month + optional navigator slot
 */
export function ProgressView({ month, monthNavigator }: ProgressViewProps) {
  return (
    <div className="mx-auto flex h-full w-full flex-col gap-4">
      <section className="flex shrink-0 flex-col gap-2">
        <h2 className="text-h2">Progress</h2>
        <p className="page-header__subtitle">
          Monthly task progress, weekly breakdowns, and all-time totals.
        </p>
      </section>

      <section
        aria-label="Progress month controls"
        className="flex shrink-0 flex-row items-center gap-3"
      >
        {monthNavigator ?? (
          <p className="text-sm tabular-nums [color:var(--color-fg-muted)]">
            {month}
          </p>
        )}
      </section>

      <div className="relative min-h-0 flex-1">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[-10] z-10 h-8 w-full bg-gradient-to-b from-[var(--color-bg)] to-transparent"
        />
        <div className="flex h-full min-h-0 flex-col overflow-x-auto overflow-y-auto pt-4 md:pt-5">
          <Suspense
            fallback={
              <div className="flex min-h-40 items-center justify-center">
                <p className="text-body-muted">Loading progress…</p>
              </div>
            }
          >
            <ProgressCards month={month} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
