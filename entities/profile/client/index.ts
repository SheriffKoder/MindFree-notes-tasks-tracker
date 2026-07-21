/**
 * @file entities/profile/client/index.ts
 * Segment barrel for browser profile fetchers and query keys.
 */

export { profilePageQueryKey } from "@/entities/profile/client/query-keys";
export {
  fetchProfilePage,
  profilePageQueryOptions,
} from "@/entities/profile/client/profile-page-query";
export {
  fetchPatchAccount,
  type PatchAccountResponse,
} from "@/entities/profile/client/patch-account";
export {
  fetchPatchPreferences,
  type PatchPreferencesResponse,
} from "@/entities/profile/client/patch-preferences";
export {
  fetchPatchSecurity,
  type PatchSecurityResponse,
} from "@/entities/profile/client/patch-security";
export { fetchProfileExport } from "@/entities/profile/client/post-export";
