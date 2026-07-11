/**
 * @file entities/note/tanstack/general-notes-query.ts
 * Client read cache for general notes — shared by SSR prefetch and `useQuery`.
 */

import { queryOptions, useQuery } from "@tanstack/react-query";

import type { GeneralNotesResponse } from "@/entities/note/model/types";
import { generalNotesQueryKey } from "@/entities/note/tanstack/query-keys";

/**
 * Fetches all general notes from the API route.
 */
export async function fetchGeneralNotes(): Promise<GeneralNotesResponse> {
  const response = await fetch("/api/notes/general", {
    credentials: "same-origin",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Failed to fetch general notes.");
  }

  return response.json() as Promise<GeneralNotesResponse>;
}

/**
 * TanStack Query options for general notes — used by SSR prefetch and hooks.
 */
export function generalNotesQueryOptions() {
  return queryOptions({
    queryKey: generalNotesQueryKey,
    queryFn: fetchGeneralNotes,
    retry: 1,
  });
}

/**
 * Reads general notes from the TanStack cache (month-independent).
 */
export function useGeneralNotesQuery() {
  return useQuery(generalNotesQueryOptions());
}
