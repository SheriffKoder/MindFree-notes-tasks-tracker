/**
 * @file app/(app)/notes/notes-hydration-seed.tsx
 * SSR seed for the Notes TanStack cache — non-blocking sibling of NotesClient.
 */

import { dehydrate } from "@tanstack/react-query";
import { connection } from "next/server";

import {
  getNotesPageInitialData,
  seedNotesPageCache,
} from "@/entities/note/server";
import { getAuthenticatedDemoSession } from "@/shared/lib/auth/get-demo-session";
import { getQueryClient, QueryHydration } from "@/shared/react-query";

/**
 * Merges initial note payloads into the app QueryClient without blocking the UI shell.
 */
export async function NotesHydrationSeed() {
  // Satisfy Next.js dynamic route rules before time-based month defaults run.
  await connection();

  const { userId, isDemoUser } = await getAuthenticatedDemoSession();
  const initialData = await getNotesPageInitialData(userId, null, { isDemoUser });
  const queryClient = getQueryClient();
  seedNotesPageCache(queryClient, initialData);

  return <QueryHydration state={dehydrate(queryClient)}>{null}</QueryHydration>;
}
