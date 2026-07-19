/**
 * @file features/activity/activity-page/model/use-activity-page-selection.ts
 * Ephemeral date selection for the activity page calendar highlight.
 */

import { useCallback, useMemo, useState } from "react";

export interface UseActivityPageSelectionResult {
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
 * Manages activity-page calendar highlight selection.
 */
export function useActivityPageSelection(
  month: string,
): UseActivityPageSelectionResult {
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
