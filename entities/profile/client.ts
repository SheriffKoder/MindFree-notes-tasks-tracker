/**
 * @file entities/profile/client.ts
 * Client-side TanStack Query exports for profile read caches + mutations.
 *
 * Import from here in `"use client"` modules — no server/repository code.
 */

export {
  fetchPatchAccount,
  fetchProfilePage,
  profilePageQueryKey,
  profilePageQueryOptions,
  type PatchAccountResponse,
} from "@/entities/profile/client/index";
export {
  useProfilePageQuery,
  useUpdateProfileMutation,
  type UpdateProfileMutationInput,
} from "@/entities/profile/hooks";
export type {
  ProfileAccount,
  ProfilePageData,
  ProfilePreferences,
  ProfileSecurity,
} from "@/entities/profile/model/read-models";
