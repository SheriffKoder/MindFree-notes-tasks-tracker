/**
 * @file views/home/ui/home-hydration-seed.tsx
 * Single SSR seed for the whole Home dashboard — non-blocking sibling of HomeView.
 *
 * Home owns *composition*: it fetches each entity's Home payload in parallel,
 * writes them all into one QueryClient via the entities' own cache seeders, then
 * dehydrates once. Each entity keeps ownership of its cache keys (the `seed*`
 * functions); Home only knows "seed these entities." Adding a new Home island
 * is one read + one seed call here — no new component, no new Suspense
 * boundary. See project-structure §7 (this lives under views/, not app/).
 */

import { dehydrate } from "@tanstack/react-query";
import { connection } from "next/server";

import { activitiesQueryKey } from "@/entities/activity/client/query-keys";
import {
  getActivitiesResponse,
  getActivityPageInitialData,
  getAuthenticatedUserId,
  seedActivityCaches,
} from "@/entities/activity/server";
import {
  getHomeNotesResponse,
  seedHomeNotesCache,
} from "@/entities/note/server";
import { getQueryClient, QueryHydration } from "@/shared/react-query";

/**
 * Seeds every Home island's caches (notes + today's tasks/reminders) into one
 * QueryClient without blocking the UI shell. Month records are shared; task and
 * reminder definition caches are seeded separately.
 *
 * @returns hydration boundary carrying the single dehydrated cache
 */
export async function HomeHydrationSeed() {
  // Satisfy Next.js dynamic route rules before time-based month defaults run.
  await connection();

  const userId = await getAuthenticatedUserId();

  // Task page payload includes shared month records; reminders only need their
  // definition list (records key is already covered by the task seed).
  const [homeNotes, taskPage, reminderActivities] = await Promise.all([
    getHomeNotesResponse(userId),
    getActivityPageInitialData(userId, null, "task"),
    getActivitiesResponse(userId, "reminder"),
  ]);

  const queryClient = getQueryClient();
  seedHomeNotesCache(queryClient, homeNotes);
  seedActivityCaches(queryClient, taskPage);
  queryClient.setQueryData(
    activitiesQueryKey("reminder"),
    reminderActivities,
  );

  return <QueryHydration state={dehydrate(queryClient)}>{null}</QueryHydration>;
}
