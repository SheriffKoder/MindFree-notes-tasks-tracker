/**
 * @file app/(app)/tasks/page.tsx
 * Protected tasks route that composes the tasks page inside the shared shell.
 */

import { TasksView } from "@/views/tasks";

/**
 * Renders the protected tasks route.
 *
 * @returns Tasks route composition for `/tasks`
 */
export default function TasksRoute() {
  return <TasksView />;
}
