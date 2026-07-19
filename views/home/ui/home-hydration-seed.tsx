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

import {
  getAuthenticatedUserId,
  getHomeActivityInitialData,
  seedHomeActivityCaches,
} from "@/entities/activity/server";
import {
  getHomeNotesResponse,
  seedHomeNotesCache,
} from "@/entities/note/server";
import { getQueryClient, QueryHydration } from "@/shared/react-query";

/**
 * Seeds every Home island's caches (notes + today's tasks/reminders) into one
 * QueryClient without blocking the UI shell. Activity seeding writes both
 * definition kinds and **one** shared month records bucket.
 *
 * @returns hydration boundary carrying the single dehydrated cache
 */
export async function HomeHydrationSeed() {
  // Satisfy Next.js dynamic route rules before time-based month defaults run.
  await connection();

  const userId = await getAuthenticatedUserId();

  const [homeNotes, activityData] = await Promise.all([
    getHomeNotesResponse(userId),
    getHomeActivityInitialData(userId),
  ]);

  const queryClient = getQueryClient();
  seedHomeNotesCache(queryClient, homeNotes);
  seedHomeActivityCaches(queryClient, activityData);

  return <QueryHydration state={dehydrate(queryClient)}>{null}</QueryHydration>;
}
