/**
 * @file entities/profile/client.ts
 * Client-side TanStack Query exports for profile read caches + mutations.
 *
 * Import from here in `"use client"` modules — no server/repository code.
 */

export {
  fetchPatchAccount,
  fetchPatchPreferences,
  fetchPatchSecurity,
  fetchProfileExport,
  fetchProfilePage,
  profilePageQueryKey,
  profilePageQueryOptions,
  type PatchAccountResponse,
  type PatchPreferencesResponse,
  type PatchSecurityResponse,
} from "@/entities/profile/client/index";
export {
  useProfilePageQuery,
  useUpdateAppLockMutation,
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
export type { ProfileExportResult } from "@/entities/profile/model/export";
export type { PreferencesPatch } from "@/entities/profile/model/preferences-patch";
export type { UpdateAppLockBody } from "@/entities/profile/schema";
export type {
  TextContrastMode,
  ThemeMode,
} from "@/entities/profile/model/types";
