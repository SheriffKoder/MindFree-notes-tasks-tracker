/**
 * @file views/tasks/model/tasks-filter-context.tsx
 * Page-scoped task-selection filter state for the Tasks calendar.
 *
 * Only calendar-side consumers call useTasksFilter; the activity list is NOT a
 * consumer. Because the selection state lives here (below TasksClient) and the
 * list is a non-consumer, toggling the filter re-renders the calendar and the
 * filter control but never the list. State is a set of hidden task ids
 * (empty = all shown). Client-only — never synced to the URL.
 */

"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { isTaskShown, toggleHiddenTask } from "@/views/tasks/lib/task-filter";

export interface TasksFilterValue {
  /** Currently hidden task ids (empty = all shown). */
  hidden: ReadonlySet<string>;
  /** True when at least one task is hidden. */
  isFiltered: boolean;
  /** Whether a task's records should render on the calendar. */
  isShown: (taskId: string) => boolean;
  /** Toggles a task's visibility on the calendar. */
  toggle: (taskId: string) => void;
  /** Shows all tasks again. */
  reset: () => void;
}

const TasksFilterContext = createContext<TasksFilterValue | null>(null);

/**
 * Provides task-selection filter state to the Tasks calendar and filter control.
 */
export function TasksFilterProvider({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set());

  const value = useMemo<TasksFilterValue>(
    () => ({
      hidden,
      isFiltered: hidden.size > 0,
      isShown: (taskId) => isTaskShown(hidden, taskId),
      toggle: (taskId) =>
        setHidden((current) => toggleHiddenTask(current, taskId)),
      reset: () => setHidden(new Set()),
    }),
    [hidden],
  );

  return (
    <TasksFilterContext.Provider value={value}>
      {children}
    </TasksFilterContext.Provider>
  );
}

/**
 * Reads the Tasks filter state. Consuming this subscribes the component to
 * selection changes — do NOT call it from the activity list.
 *
 * @throws when used outside {@link TasksFilterProvider}
 */
export function useTasksFilter(): TasksFilterValue {
  const value = useContext(TasksFilterContext);

  if (!value) {
    throw new Error("useTasksFilter must be used within TasksFilterProvider.");
  }

  return value;
}
