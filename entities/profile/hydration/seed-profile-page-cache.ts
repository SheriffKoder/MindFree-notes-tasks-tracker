/**
 * @file entities/profile/hydration/seed-profile-page-cache.ts
 * Writes SSR ProfilePageData into a QueryClient (no dehydrate).
 */

import type { QueryClient } from "@tanstack/react-query";

import { profilePageQueryKey } from "@/entities/profile/client/query-keys";
import type { ProfilePageData } from "@/entities/profile/model/read-models";

/**
 * Seeds the Profile page cache from an SSR payload.
 *
 * @param queryClient - per-request server QueryClient
 * @param data - client-safe Profile page read model
 */
export function seedProfilePageCache(
  queryClient: QueryClient,
  data: ProfilePageData,
): void {
  queryClient.setQueryData(profilePageQueryKey, data);
}
