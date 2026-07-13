/**
 * @file views/notes/model/use-notes-page-selection.ts
 * Ephemeral date selection for the Notes page calendar highlight.
 *
 * View clicks always call `selectDate` — that snaps the page highlight to the
 * clicked day even when the drawer is already open elsewhere. Drawer editor
 * requests are owned separately by {@link useNotesDrawer}.
 */

import { useCallback, useMemo, useState } from "react";

export interface UseNotesPageSelectionResult {
  /** Canonical selected ISO date for page-level selection state. */
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
  /** Clears page calendar highlight (e.g. when the drawer is dismissed). */
  clearSelection: () => void;
}

/**
 * Manages Notes page calendar highlight selection.
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

  const clearSelection = useCallback(() => {
    setSelectedDate(undefined);
  }, []);

  return {
    selectedDate,
    highlightedDate,
    selectDate,
    clearSelection,
  };
}
