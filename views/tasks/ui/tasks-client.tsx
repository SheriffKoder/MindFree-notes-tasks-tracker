/**
 * @file views/tasks/ui/tasks-client.tsx
 * Thin Tasks wrapper over the shared activity page composition.
 */

"use client";

import { ActivityPageClient } from "@/features/activity/activity-page";

/**
 * Renders the Tasks page via the shared kind-parameterized activity client.
 */
export function TasksClient() {
  return (
    <ActivityPageClient
      kind="task"
      subtitle="Browse scheduled tasks by month. Configure a task, then track its completion."
      title="Tasks"
    />
  );
}
