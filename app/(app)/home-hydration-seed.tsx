/**
 * @file app/(app)/home-hydration-seed.tsx
 * SSR seed for the Home TanStack cache — non-blocking sibling of HomeView.
 */

import { connection } from "next/server";

import {
  getHomeNotesResponse,
  hydrateHomeNotesQueries,
} from "@/entities/note/server";
import { getAuthenticatedUserId } from "@/entities/note/repository/note-repository";
import { getQueryClient, QueryHydration } from "@/shared/react-query";

/**
 * Merges initial home notes into the app QueryClient without blocking the UI shell.
 */
export async function HomeHydrationSeed() {
  await connection();

  const userId = await getAuthenticatedUserId();
  const homeNotes = await getHomeNotesResponse(userId);
  const queryClient = getQueryClient();
  const dehydratedState = hydrateHomeNotesQueries(queryClient, homeNotes);

  return <QueryHydration state={dehydratedState}>{null}</QueryHydration>;
}
