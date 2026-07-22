/**
 * @file features/activity/activity-page/model/use-activity-page-url-state.ts
 * Activity page URL state — reads `month`/`view` and mutates via the router.
 *
 * The definition filter is client-only, so it is deliberately NOT part of URL
 * state.
 */

"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { parseMonthParam } from "@/entities/activity";
import type { ActivityViewId } from "@/features/activity/activity-page/lib/activity-views";
import { useDemoMonthParseOptions } from "@/shared/demo-session";
import {
  useCanonicalDemoMonthUrl,
  useMonthNavigation,
} from "@/shared/month-navigator";
import {
  parseViewParam,
  useViewNavigation,
  type ViewConfig,
} from "@/shared/view-switcher";

export interface UseActivityPageUrlStateResult {
  month: string;
  view: ActivityViewId;
  navigateToMonth: (nextMonth: string) => void;
  previousMonth: () => void;
  nextMonth: () => void;
  changeView: (nextView: ActivityViewId) => void;
  cycleView: () => void;
}

/**
 * Resolves activity-page URL state and exposes navigation actions.
 */
export function useActivityPageUrlState(
  viewConfig: ViewConfig<ActivityViewId>,
): UseActivityPageUrlStateResult {
  const searchParams = useSearchParams();
  const demoMonthOptions = useDemoMonthParseOptions();
  useCanonicalDemoMonthUrl();

  const { month, view } = useMemo(() => {
    return {
      month: parseMonthParam(searchParams.get("month"), demoMonthOptions),
      view: parseViewParam(
        searchParams.get("view") ?? undefined,
        viewConfig,
      ),
    };
  }, [demoMonthOptions, searchParams, viewConfig]);

  const { navigateToMonth, onPrevious, onNext } = useMonthNavigation(month);
  const { onViewChange, onCycleView } = useViewNavigation(view, viewConfig);

  return {
    month,
    view,
    navigateToMonth,
    previousMonth: onPrevious,
    nextMonth: onNext,
    changeView: onViewChange,
    cycleView: onCycleView,
  };
}
