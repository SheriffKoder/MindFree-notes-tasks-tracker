/**
 * @file shared/month-navigator/model/use-canonical-demo-month-url.ts
 * Writes the demo default month into the URL when `?month=` is missing or invalid.
 */

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { useDemoMonthParseOptions } from "@/shared/demo-session";
import { isValidMonthKey } from "@/shared/month-navigator/lib/month-key";

/**
 * Options for {@link useCanonicalDemoMonthUrl}.
 */
export interface UseCanonicalDemoMonthUrlOptions {
  /** Search param key for the month (default: `month`). */
  paramName?: string;
}

/**
 * Replaces the current URL with `?month=<demoDefault>` for demo users when the
 * month param is absent or invalid. Preserves other search params such as `view`.
 */
export function useCanonicalDemoMonthUrl(
  options: UseCanonicalDemoMonthUrlOptions = {},
): void {
  const { paramName = "month" } = options;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const demoMonthOptions = useDemoMonthParseOptions();

  useEffect(function canonicalizeDemoMonthUrl() {
    if (!demoMonthOptions.isDemoUser || !demoMonthOptions.demoDefaultMonth) {
      return;
    }

    const rawMonth = searchParams.get(paramName);

    if (isValidMonthKey(rawMonth)) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set(paramName, demoMonthOptions.demoDefaultMonth);
    router.replace(`${pathname}?${params.toString()}`);
  }, [
    demoMonthOptions.demoDefaultMonth,
    demoMonthOptions.isDemoUser,
    paramName,
    pathname,
    router,
    searchParams,
  ]);
}
