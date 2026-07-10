/**
 * @file views/notes/model/use-notes-page-selection.ts
 * Ephemeral date selection for the Notes page (drawer prep).
 *
 * Replace with `useNoteDrawer` when the drawer island lands (Steps 6–8).
 * View clicks always call `selectDate` — that snaps selection (and later the
 * drawer) to the clicked day even when the drawer is already open elsewhere.
 */

import { useCallback, useMemo, useState } from "react";

export interface UseNotesPageSelectionResult {
  /** Canonical selected ISO date — will become drawer `selectedDate`. */
  selectedDate: string | undefined;
  /**
   * Date to highlight on the page calendar when it falls inside URL `month`.
   * Undefined when selection is off-month (drawer can still hold that date).
   */
  highlightedDate: string | undefined;
  /**
   * Activates a calendar day from a page view (grid, list card, etc.).
   * Always sets selection to `date`, including when another day was active.
   */
  selectDate: (date: string) => void;
}

/**
 * Manages Notes page date selection until the drawer hook replaces this module.
 *
 * @param month - URL month (`YYYY-MM`) used to scope calendar grid highlight
 * @returns selection state and `selectDate` handler for view interactions
 */
export function useNotesPageSelection(
  month: string,
): UseNotesPageSelectionResult {
  const [selectedDate, setSelectedDate] = useState<string | undefined>();

  const highlightedDate = useMemo(() => {
    if (!selectedDate?.startsWith(month)) {
      return undefined;
    }

    return selectedDate;
  }, [month, selectedDate]);

  const selectDate = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  return {
    selectedDate,
    highlightedDate,
    selectDate,
  };
}
