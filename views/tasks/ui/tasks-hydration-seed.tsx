/**
 * @file views/tasks/ui/tasks-hydration-seed.tsx
 * SSR seed for the Tasks TanStack cache — non-blocking sibling of TasksClient.
 *
 * Lives under views/ (not app/) per project-structure §7. Fetches the two
 * canonical payloads on the server and hands a dehydrated cache to the client.
 */

import { connection } from "next/server";

import {
  getAuthenticatedUserId,
  getTasksPageInitialData,
  hydrateTasksPageQueries,
} from "@/entities/activity/server";
import { getQueryClient, QueryHydration } from "@/shared/react-query";

/**
 * Seeds task definitions + current-month records into the app QueryClient
 * without blocking the UI shell.
 *
 * @returns hydration boundary carrying the dehydrated cache
 */
export async function TasksHydrationSeed() {
  // Satisfy Next.js dynamic route rules before time-based month defaults run.
  await connection();

  const userId = await getAuthenticatedUserId();
  const initialData = await getTasksPageInitialData(userId, null);
  const queryClient = getQueryClient();
  const dehydratedState = hydrateTasksPageQueries(queryClient, initialData);

  return <QueryHydration state={dehydratedState}>{null}</QueryHydration>;
}
