/**
 * @file entities/profile/client.ts
 * Client-side TanStack Query exports for profile read caches + mutations.
 *
 * Import from here in `"use client"` modules — no server/repository code.
 */

export {
  fetchPatchAccount,
  fetchPatchPreferences,
  fetchProfilePage,
  profilePageQueryKey,
  profilePageQueryOptions,
  type PatchAccountResponse,
  type PatchPreferencesResponse,
} from "@/entities/profile/client/index";
export {
  useProfilePageQuery,
  useUpdatePreferencesMutation,
  useUpdateProfileMutation,
  type UpdateProfileMutationInput,
} from "@/entities/profile/hooks";
export type {
  ProfileAccount,
  ProfilePageData,
  ProfilePreferences,
  ProfileSecurity,
} from "@/entities/profile/model/read-models";
export type { PreferencesPatch } from "@/entities/profile/model/preferences-patch";
export type {
  TextContrastMode,
  ThemeMode,
} from "@/entities/profile/model/types";
