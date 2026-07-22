/**
 * @file views/payments/model/use-payments-url-state.ts
 * Payments page URL state — reads `month` and mutates via the router.
 *
 * Purpose: Derive active month from search params and expose navigation actions.
 * Used in: views/payments/ui/payments-client.tsx
 * Used for: Month navigator previous/next and preserving other URL params.
 *
 * Steps:
 * 1. Parse `?month=` from search params (default current or demo month).
 * 2. Delegate prev/next navigation to shared useMonthNavigation.
 */

"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { parseMonthParam } from "@/entities/payment";
import { useDemoMonthParseOptions } from "@/shared/demo-session";
import {
  useCanonicalDemoMonthUrl,
  useMonthNavigation,
} from "@/shared/month-navigator";

export interface UsePaymentsUrlStateResult {
  month: string;
  /** Navigates to an explicit month key, preserving other search params. */
  navigateToMonth: (nextMonth: string) => void;
  /** Moves to the previous month via the URL. */
  previousMonth: () => void;
  /** Moves to the next month via the URL. */
  nextMonth: () => void;
}

/**
 * Resolves Payments page URL state and navigation actions.
 */
export function usePaymentsUrlState(): UsePaymentsUrlStateResult {
  const searchParams = useSearchParams();
  const demoMonthOptions = useDemoMonthParseOptions();
  useCanonicalDemoMonthUrl();

  const month = useMemo(
    () => parseMonthParam(searchParams.get("month"), demoMonthOptions),
    [demoMonthOptions, searchParams],
  );

  const { navigateToMonth, onPrevious, onNext } = useMonthNavigation(month);

  return {
    month,
    navigateToMonth,
    previousMonth: onPrevious,
    nextMonth: onNext,
  };
}
