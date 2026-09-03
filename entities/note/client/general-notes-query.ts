/**
 * @file entities/note/client/general-notes-query.ts
 * Client read cache for general notes — fetcher + query options.
 */

import { queryOptions } from "@tanstack/react-query";

import { generalNotesQueryKey } from "@/entities/note/client/query-keys";
import type { GeneralNotesResponse } from "@/entities/note/model/read-models";

/**
 * Fetches undated notes for one category from the API route.
 */
export async function fetchGeneralNotes(
  categoryId: string,
): Promise<GeneralNotesResponse> {
  const response = await fetch(
    `/api/notes/general?categoryId=${encodeURIComponent(categoryId)}`,
    {
      credentials: "same-origin",
    },
  );

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Failed to fetch general notes.");
  }

  return response.json() as Promise<GeneralNotesResponse>;
}

/**
 * TanStack Query options for one category's general notes.
 */
export function generalNotesQueryOptions(categoryId: string) {
  return queryOptions({
    queryKey: generalNotesQueryKey(categoryId),
    queryFn: () => fetchGeneralNotes(categoryId),
    enabled: Boolean(categoryId),
    retry: 1,
  });
}
