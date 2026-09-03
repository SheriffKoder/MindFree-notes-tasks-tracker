/**
 * @file views/notes/model/use-notes-url-state.ts
 * Notes page URL state and navigation — reads `month`/`view` and mutates via the router.
 *
 * Purpose: Resolve month + dynamic view (including `category:<uuid>`) from the URL.
 * Used in: views/notes/ui/notes-client.tsx
 * Used for: Month navigator + view switcher without a server round-trip.
 *
 * Steps:
 * 1. Parse month (demo-aware)
 * 2. Normalize legacy `general-notes` → Diary category view
 * 3. Parse view against the dynamic config from active categories
 */

"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { parseMonthParam } from "@/entities/note";
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
import {
  normalizeNotesViewParam,
  type NotesViewId,
} from "@/views/notes/lib/notes-views";

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
 * @param viewConfig - dynamic config from {@link buildNotesViewConfig} (active categories)
 * @param categories - used to remap legacy `general-notes` URLs
 */
export function useNotesUrlState(
  viewConfig: ViewConfig<NotesViewId>,
  categories: Array<{ id: string; isDefault?: boolean }> = [],
): UseNotesUrlStateResult {
  const searchParams = useSearchParams();
  const demoMonthOptions = useDemoMonthParseOptions();
  useCanonicalDemoMonthUrl();

  const { month, view } = useMemo(() => {
    // 1. Month from URL (demo session may clamp)
    const resolvedMonth = parseMonthParam(
      searchParams.get("month"),
      demoMonthOptions,
    );

    // 2. Remap legacy general-notes → Diary category:<id>
    const normalizedView = normalizeNotesViewParam(
      searchParams.get("view"),
      categories,
    );

    // 3. Validate against dynamic config — unknown/archived category → default calendar
    const resolvedView = parseViewParam(normalizedView, viewConfig);

    return { month: resolvedMonth, view: resolvedView };
  }, [categories, demoMonthOptions, searchParams, viewConfig]);

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
