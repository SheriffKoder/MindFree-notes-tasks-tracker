/**
 * @file entities/profile/client.ts
 * Client-side TanStack Query exports for profile read caches.
 *
 * Import from here in `"use client"` modules — no server/repository code.
 */

export {
  fetchProfilePage,
  profilePageQueryKey,
  profilePageQueryOptions,
} from "@/entities/profile/client/index";
export type {
  ProfileAccount,
  ProfilePageData,
  ProfilePreferences,
  ProfileSecurity,
} from "@/entities/profile/model/read-models";
