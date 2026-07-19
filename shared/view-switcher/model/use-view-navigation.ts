/**
 * @file shared/view-switcher/model/use-view-navigation.ts
 * URL-driven view navigation for pages that sync `?view=` to the router.
 */

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import {
  getNextView,
  type ViewConfig,
} from "@/shared/view-switcher/lib/view-config";

/**
 * Options for {@link useViewNavigation}.
 */
export interface UseViewNavigationOptions {
  /** Search param key for the view (default: `view`). */
  paramName?: string;
}

/**
 * Result of {@link useViewNavigation}.
 */
export interface UseViewNavigationResult<Id extends string> {
  /** Navigates to an explicit view, preserving other search params. */
  onViewChange: (nextView: Id) => void;
  /** Cycles to the next view in mobile order via the URL. */
  onCycleView: () => void;
}

/**
 * Wires view selection and cycling to the current route's search params.
 *
 * @param view - current resolved view id
 * @param config - page view config (drives cycle order)
 * @param options - optional search param configuration
 * @returns navigation callbacks for {@link ViewSwitcher}
 */
export function useViewNavigation<Id extends string>(
  view: Id,
  config: ViewConfig<Id>,
  options: UseViewNavigationOptions = {},
): UseViewNavigationResult<Id> {
  const { paramName = "view" } = options;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onViewChange = useCallback(
    (nextView: Id) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(paramName, nextView);
      router.push(`${pathname}?${params.toString()}`);
    },
    [paramName, pathname, router, searchParams],
  );

  const onCycleView = useCallback(() => {
    onViewChange(getNextView(config, view));
  }, [config, onViewChange, view]);

  return {
    onViewChange,
    onCycleView,
  };
}
