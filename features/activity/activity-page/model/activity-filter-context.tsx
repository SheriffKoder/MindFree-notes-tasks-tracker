/**
 * @file features/activity/activity-page/model/activity-filter-context.tsx
 * Page-scoped definition-selection filter state for the activity calendar.
 *
 * Only calendar-side consumers call useActivityFilter; the activity list is NOT
 * a consumer. State is a set of hidden activity ids (empty = all shown) plus a
 * `showIncomplete` flag (default false). Client-only — never synced to the URL.
 */

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  isActivityShown,
  toggleHiddenActivity,
} from "@/features/activity/activity-page/lib/activity-filter";

export interface ActivityFilterValue {
  /** Currently hidden activity ids (empty = all shown). */
  hidden: ReadonlySet<string>;
  /** True when at least one activity is hidden. */
  isFiltered: boolean;
  /** Whether incomplete day entries render (default false). */
  showIncomplete: boolean;
  /** Whether an activity's records should render on the calendar. */
  isShown: (activityId: string) => boolean;
  /** Toggles an activity's visibility on the calendar. */
  toggle: (activityId: string) => void;
  /** Toggles incomplete day-entry visibility. */
  toggleShowIncomplete: () => void;
  /** Shows all activities again (does not change `showIncomplete`). */
  reset: () => void;
}

const ActivityFilterContext = createContext<ActivityFilterValue | null>(null);

/**
 * Provides definition-selection filter state to the calendar and filter control.
 */
export function ActivityFilterProvider({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set());
  const [showIncomplete, setShowIncomplete] = useState(false);

  const toggleShowIncomplete = useCallback(() => {
    setShowIncomplete((current) => !current);
  }, []);

  const value = useMemo<ActivityFilterValue>(
    () => ({
      hidden,
      isFiltered: hidden.size > 0,
      showIncomplete,
      isShown: (activityId) => isActivityShown(hidden, activityId),
      toggle: (activityId) =>
        setHidden((current) => toggleHiddenActivity(current, activityId)),
      toggleShowIncomplete,
      reset: () => setHidden(new Set()),
    }),
    [hidden, showIncomplete, toggleShowIncomplete],
  );

  return (
    <ActivityFilterContext.Provider value={value}>
      {children}
    </ActivityFilterContext.Provider>
  );
}

/**
 * Reads the activity filter state. Consuming this subscribes the component to
 * selection changes — do NOT call it from the activity list.
 *
 * @throws when used outside {@link ActivityFilterProvider}
 */
export function useActivityFilter(): ActivityFilterValue {
  const value = useContext(ActivityFilterContext);

  if (!value) {
    throw new Error(
      "useActivityFilter must be used within ActivityFilterProvider.",
    );
  }

  return value;
}
