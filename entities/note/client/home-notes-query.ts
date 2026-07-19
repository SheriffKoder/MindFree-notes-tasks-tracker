/**
 * @file entities/note/client/home-notes-query.ts
 * Client read cache for home notes — fetcher + query options.
 *
 * The hook lives in hooks/use-home-notes-query (one responsibility per file).
 */

import { queryOptions } from "@tanstack/react-query";

import { homeNotesQueryKey } from "@/entities/note/client/query-keys";
import type { HomeNotesResponse } from "@/entities/note/model/read-models";

/**
 * Fetches the home notes payload from the API route.
 */
export async function fetchHomeNotes(): Promise<HomeNotesResponse> {
  const response = await fetch("/api/notes/home", {
    credentials: "same-origin",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Failed to fetch home notes.");
  }

  return response.json() as Promise<HomeNotesResponse>;
}

/**
 * TanStack Query options for home notes — used by SSR prefetch and hooks.
 */
export function homeNotesQueryOptions() {
  return queryOptions({
    queryKey: homeNotesQueryKey,
    queryFn: fetchHomeNotes,
    retry: 1,
  });
}
