/**
 * @file entities/profile/client/profile-page-query.ts
 * Client read cache for ProfilePageData — fetcher + query options.
 */

import { queryOptions } from "@tanstack/react-query";

import { profilePageQueryKey } from "@/entities/profile/client/query-keys";
import type { ProfilePageData } from "@/entities/profile/model/read-models";

/**
 * Fetches ProfilePageData from GET /api/profile.
 */
export async function fetchProfilePage(): Promise<ProfilePageData> {
  const response = await fetch("/api/profile", {
    credentials: "same-origin",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Failed to fetch profile.");
  }

  return response.json() as Promise<ProfilePageData>;
}

/**
 * TanStack Query options for the Profile page payload.
 */
export function profilePageQueryOptions() {
  return queryOptions({
    queryKey: profilePageQueryKey,
    queryFn: fetchProfilePage,
    retry: 1,
  });
}
