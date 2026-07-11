/**
 * @file views/notes/model/use-notes-url-state.ts
 * Notes page URL state and navigation — reads `month`/`view` and mutates via the router.
 */

"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { parseMonthParam } from "@/entities/note";
import { useMonthNavigation } from "@/shared/month-navigator";
import {
  parseNotesViewParam,
  useViewNavigation,
  type NotesViewId,
} from "@/shared/view-switcher";

export interface UseNotesUrlStateResult {
  month: string;
  view: NotesViewId;
  /** Navigates to an explicit month key, preserving other search params. */
  navigateToMonth: (nextMonth: string) => void;
  /** Moves to the previous month via the URL. */
  previousMonth: () => void;
  /** Moves to the next month via the URL. */
  nextMonth: () => void;
  /** Navigates to an explicit view, preserving other search params. */
  changeView: (nextView: NotesViewId) => void;
  /** Cycles to the next view in mobile order via the URL. */
  cycleView: () => void;
}

/**
 * Resolves Notes page URL state and exposes navigation actions without a server round-trip.
 *
 * Composes shared month/view navigation hooks so `NotesClient` only needs one URL hook.
 */
export function useNotesUrlState(): UseNotesUrlStateResult {
  const searchParams = useSearchParams();

  const { month, view } = useMemo(() => {
    const resolvedMonth = parseMonthParam(searchParams.get("month"));
    const resolvedView = parseNotesViewParam(searchParams.get("view") ?? undefined);

    return { month: resolvedMonth, view: resolvedView };
  }, [searchParams]);

  const { navigateToMonth, onPrevious, onNext } = useMonthNavigation(month);
  const { onViewChange, onCycleView } = useViewNavigation(view);

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
