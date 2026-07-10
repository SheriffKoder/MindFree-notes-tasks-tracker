/**
 * @file app/(app)/notes/notes-hydration-seed.tsx
 * SSR seed for the Notes TanStack cache — non-blocking sibling of NotesClient.
 */

import { connection } from "next/server";

import {
  getNotesPageInitialData,
  hydrateNotesPageQueries,
} from "@/entities/note/server";
import { getQueryClient, QueryHydration } from "@/shared/react-query";

/**
 * Merges initial note payloads into the app QueryClient without blocking the UI shell.
 */
export async function NotesHydrationSeed() {
  // Satisfy Next.js dynamic route rules before time-based month defaults run.
  await connection();

  const initialData = await getNotesPageInitialData(null);
  const queryClient = getQueryClient();
  const dehydratedState = hydrateNotesPageQueries(queryClient, initialData);

  return <QueryHydration state={dehydratedState}>{null}</QueryHydration>;
}
