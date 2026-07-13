/**
 * @file entities/note/tanstack/home-notes-query.ts
 * Client read cache for home notes — shared by SSR prefetch and `useQuery`.
 */

import { queryOptions, useQuery } from "@tanstack/react-query";

import type { HomeNotesResponse } from "@/entities/note/model/types";
import { homeNotesQueryKey } from "@/entities/note/tanstack/query-keys";

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

/**
 * Reads home notes from the TanStack cache (quick slot + starred carousel).
 */
export function useHomeNotesQuery() {
  return useQuery(homeNotesQueryOptions());
}
