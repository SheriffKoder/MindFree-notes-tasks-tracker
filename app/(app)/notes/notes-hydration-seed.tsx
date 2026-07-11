/**
 * @file app/(app)/notes/notes-hydration-seed.tsx
 * SSR seed for the Notes TanStack cache — wraps client islands after prefetch.
 */

import type { ReactNode } from "react";
import { connection } from "next/server";

import {
  getNotesPageInitialData,
  hydrateNotesPageQueries,
} from "@/entities/note/server";
import { getQueryClient, QueryHydration } from "@/shared/react-query";

/**
 * Props for the Notes hydration boundary.
 */
interface NotesHydrationBoundaryProps {
  /** Raw `month` search param from the request URL. */
  monthParam: string | null | undefined;
  /** Client islands that read from the hydrated TanStack cache. */
  children: ReactNode;
}

/**
 * Prefetches Notes queries on the server, then hydrates before children mount.
 */
export async function NotesHydrationBoundary({
  monthParam,
  children,
}: NotesHydrationBoundaryProps) {
  // Satisfy Next.js dynamic route rules before time-based month defaults run.
  await connection();

  const initialData = await getNotesPageInitialData(monthParam);
  const queryClient = getQueryClient();
  const dehydratedState = hydrateNotesPageQueries(queryClient, initialData);

  return <QueryHydration state={dehydratedState}>{children}</QueryHydration>;
}
