/**
 * @file views/progress/ui/progress-month-navigator.tsx
 * Client island for Progress month prev/next + adjacent RSC warming.
 *
 * Purpose: Reuse `MonthNavigator` / `useMonthNavigation` and prefetch neighbor
 *          month routes. The only Progress page client boundary besides
 *          incidental ListView week-grouping imports.
 * Used in: `views/progress/ui/progress-view.tsx` (under Suspense for
 *          `useSearchParams`).
 * Used for: URL-driven `?month=` navigation on `/progress`.
 */

"use client";

import {
  MonthNavigator,
  useMonthNavigation,
} from "@/shared/month-navigator";
import { usePrefetchAdjacentProgressMonths } from "@/views/progress/model/use-prefetch-adjacent-progress-months";

export interface ProgressMonthNavigatorProps {
  /** Resolved month key (`YYYY-MM`). */
  month: string;
}

/**
 * Renders the Progress month navigator and warms adjacent months.
 *
 * @param props - selected month
 */
export function ProgressMonthNavigator({
  month,
}: ProgressMonthNavigatorProps) {
  const { onPrevious, onNext } = useMonthNavigation(month);
  usePrefetchAdjacentProgressMonths(month);

  return (
    <MonthNavigator
      className="min-w-0 flex-1"
      month={month}
      onPrevious={onPrevious}
      onNext={onNext}
    />
  );
}
