/**
 * @file views/progress/model/use-prefetch-adjacent-progress-months.ts
 * Prefetches adjacent Progress RSC routes after the selected month renders.
 *
 * Purpose: Warm `month - 1` and `month + 1` via `router.prefetch()` so month
 *          navigation feels immediate. Preserves other search params. Does not
 *          touch TanStack Query — Progress is pure SSR.
 * Used in: `views/progress/ui/progress-month-navigator.tsx`.
 * Used for: Adjacent-month RSC warming on `/progress`.
 */

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { shiftMonth } from "@/shared/month-navigator";

/**
 * Prefetches previous and next Progress month URLs for the current route.
 *
 * @param month - currently selected month key (`YYYY-MM`)
 */
export function usePrefetchAdjacentProgressMonths(month: string): void {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(
    function prefetchAdjacentProgressMonths() {
      const buildMonthUrl = (nextMonth: string): string => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("month", nextMonth);
        return `${pathname}?${params.toString()}`;
      };

      router.prefetch(buildMonthUrl(shiftMonth(month, -1)));
      router.prefetch(buildMonthUrl(shiftMonth(month, 1)));
    },
    [month, pathname, router, searchParams],
  );
}
