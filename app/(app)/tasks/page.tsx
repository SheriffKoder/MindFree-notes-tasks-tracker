/**
 * @file app/(app)/tasks/page.tsx
 * Protected tasks route — sync shell; SSR seed hydrates the cache in parallel
 * with the client shell. `?month=`/`?view=` toggles stay client-side.
 */

import { Suspense } from "react";

import { TasksClient, TasksHydrationSeed } from "@/views/tasks";

/**
 * Renders the Tasks route. SSR hydration seeds the definitions + records caches
 * next to the client shell so first paint needs no client round-trip.
 */
export default function TasksRoute() {
  return (
    <>
      <Suspense fallback={null}>
        <TasksHydrationSeed />
      </Suspense>
      <Suspense fallback={null}>
        <TasksClient />
      </Suspense>
    </>
  );
}
