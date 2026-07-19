/**
 * @file entities/note/client/general-notes-query.ts
 * Client read cache for general notes — fetcher + query options.
 *
 * The hook lives in hooks/use-general-notes-query (one responsibility per file).
 */

import { queryOptions } from "@tanstack/react-query";

import { generalNotesQueryKey } from "@/entities/note/client/query-keys";
import type { GeneralNotesResponse } from "@/entities/note/model/read-models";

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
