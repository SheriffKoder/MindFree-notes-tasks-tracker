/**
 * @file views/tasks/model/use-tasks-page-selection.ts
 * Ephemeral date selection for the Tasks page calendar highlight.
 *
 * Mirrors the Notes page selection: view clicks call `selectDate`, which snaps
 * the page highlight to the clicked day. Scoped to the URL `month` so off-month
 * selections don't highlight the grid.
 */

import { useCallback, useMemo, useState } from "react";

export interface UseTasksPageSelectionResult {
  /** Canonical selected ISO date for page-level selection state. */
  selectedDate: string | undefined;
  /**
   * Date to highlight on the page calendar when it falls inside URL `month`.
   * Undefined when selection is off-month.
   */
  highlightedDate: string | undefined;
  /** Activates a calendar day from a page view (grid, list card, etc.). */
  selectDate: (date: string) => void;
  /** Clears the page calendar highlight. */
  clearSelection: () => void;
}

/**
 * Manages Tasks page calendar highlight selection.
 *
 * @param month - URL month (`YYYY-MM`) used to scope calendar grid highlight
 * @returns selection state and `selectDate` handler for view interactions
 */
export function useTasksPageSelection(
  month: string,
): UseTasksPageSelectionResult {
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
