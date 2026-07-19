/**
 * @file views/tasks/model/use-tasks-url-state.ts
 * Tasks page URL state — reads `month`/`view` and mutates via the router.
 *
 * The task filter is client-only (see tasks-filter-context), so it is
 * deliberately NOT part of URL state.
 */

"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { parseMonthParam } from "@/entities/activity";
import { useMonthNavigation } from "@/shared/month-navigator";
import { parseViewParam, useViewNavigation } from "@/shared/view-switcher";
import {
  TASKS_VIEW_CONFIG,
  type TasksViewId,
} from "@/views/tasks/lib/tasks-views";

export interface UseTasksUrlStateResult {
  month: string;
  view: TasksViewId;
  /** Navigates to an explicit month key, preserving other search params. */
  navigateToMonth: (nextMonth: string) => void;
  /** Moves to the previous month via the URL. */
  previousMonth: () => void;
  /** Moves to the next month via the URL. */
  nextMonth: () => void;
  /** Navigates to an explicit view, preserving other search params. */
  changeView: (nextView: TasksViewId) => void;
  /** Cycles to the next view (mobile toggle) via the URL. */
  cycleView: () => void;
}

/**
 * Resolves Tasks page URL state and exposes navigation actions without a server round-trip.
 */
export function useTasksUrlState(): UseTasksUrlStateResult {
  const searchParams = useSearchParams();

  const { month, view } = useMemo(() => {
    return {
      month: parseMonthParam(searchParams.get("month")),
      view: parseViewParam(
        searchParams.get("view") ?? undefined,
        TASKS_VIEW_CONFIG,
      ),
    };
  }, [searchParams]);

  const { navigateToMonth, onPrevious, onNext } = useMonthNavigation(month);
  const { onViewChange, onCycleView } = useViewNavigation(view, TASKS_VIEW_CONFIG);

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
