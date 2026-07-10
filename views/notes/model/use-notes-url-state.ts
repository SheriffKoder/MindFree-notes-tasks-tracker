/**
 * @file views/notes/model/use-notes-url-state.ts
 * Reads `month` and `view` from the Notes page URL (client-only).
 */

"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { parseMonthParam } from "@/entities/note";
import { parseNotesViewParam, type NotesViewId } from "@/shared/view-switcher";

export interface UseNotesUrlStateResult {
  month: string;
  view: NotesViewId;
}

/**
 * Resolves Notes page URL state from search params without a server round-trip.
 */
export function useNotesUrlState(): UseNotesUrlStateResult {
  const searchParams = useSearchParams();

  return useMemo(() => {
    const month = parseMonthParam(searchParams.get("month"));
    const view = parseNotesViewParam(searchParams.get("view") ?? undefined);

    return { month, view };
  }, [searchParams]);
}
