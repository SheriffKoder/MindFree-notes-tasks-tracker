/**
 * @file views/tasks/lib/task-filter.ts
 * Pure helpers for the Tasks calendar's client-side task filter.
 *
 * The filter narrows which tasks' records render on the calendar. State is a set
 * of HIDDEN task ids (empty = all shown) so newly-created tasks appear by
 * default and "reset" is a simple clear. Only the calendar consumes this; the
 * activity list stays stable (tasks-page.md).
 */

/**
 * Whether a task's records should render given the hidden set.
 *
 * @param hidden - currently hidden task ids
 * @param taskId - task id to test
 * @returns true when the task is shown (not hidden)
 */
export function isTaskShown(
  hidden: ReadonlySet<string>,
  taskId: string,
): boolean {
  return !hidden.has(taskId);
}

/**
 * Toggles a task's hidden membership, returning a new set.
 *
 * @param hidden - current hidden set
 * @param taskId - task id to flip
 * @returns next hidden set (new reference)
 */
export function toggleHiddenTask(
  hidden: ReadonlySet<string>,
  taskId: string,
): Set<string> {
  const next = new Set(hidden);

  if (next.has(taskId)) {
    next.delete(taskId);
  } else {
    next.add(taskId);
  }

  return next;
}
