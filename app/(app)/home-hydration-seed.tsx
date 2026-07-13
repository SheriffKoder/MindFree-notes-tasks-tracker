/**
 * @file app/(app)/home-hydration-seed.tsx
 * SSR seed for the Home TanStack cache — non-blocking sibling of HomeView.
 */

import { connection } from "next/server";

import {
  getHomeNotesResponse,
  hydrateHomeNotesQueries,
} from "@/entities/note/server";
import { getQueryClient, QueryHydration } from "@/shared/react-query";

/**
 * Merges initial home notes into the app QueryClient without blocking the UI shell.
 */
export async function HomeHydrationSeed() {
  await connection();

  const homeNotes = await getHomeNotesResponse();
  const queryClient = getQueryClient();
  const dehydratedState = hydrateHomeNotesQueries(queryClient, homeNotes);

  return <QueryHydration state={dehydratedState}>{null}</QueryHydration>;
}
