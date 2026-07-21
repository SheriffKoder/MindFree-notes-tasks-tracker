/**
 * @file entities/profile/hooks/use-profile-page-query.ts
 * Reads ProfilePageData from the TanStack cache (SSR-seeded).
 */

"use client";

import { useQuery } from "@tanstack/react-query";

import { profilePageQueryOptions } from "@/entities/profile/client/profile-page-query";

/**
 * Reads the full Profile page payload from TanStack Query.
 */
export function useProfilePageQuery() {
  return useQuery(profilePageQueryOptions());
}
