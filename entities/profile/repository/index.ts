/**
 * @file entities/profile/repository/index.ts
 * Public surface for the Profile repository (Supabase data access, RLS-scoped).
 *
 * Function index:
 * - getAuthenticatedUser    (get-authenticated-user-id)
 * - getAuthenticatedUserId  (get-authenticated-user-id)
 * - ensureProfileExists     (ensure-profile-exists)
 * - getProfileRow           (get-profile-row)
 * - getPreferencesRow       (get-preferences-row)
 * - getSecurityRow          (get-security-row)
 * - updateProfileDisplayName (update-profile-row)
 * - updatePreferencesByUserId (update-preferences-row)
 * - updateSecurityByUserId  (update-security-row)
 */

export {
  getAuthenticatedUser,
  getAuthenticatedUserId,
  type AuthenticatedProfileUser,
} from "@/entities/profile/repository/get-authenticated-user-id";
export { ensureProfileExists } from "@/entities/profile/repository/ensure-profile-exists";
export { getProfileRow } from "@/entities/profile/repository/get-profile-row";
export { getPreferencesRow } from "@/entities/profile/repository/get-preferences-row";
export { getSecurityRow } from "@/entities/profile/repository/get-security-row";
export { updateProfileDisplayName } from "@/entities/profile/repository/update-profile-row";
export { updatePreferencesByUserId } from "@/entities/profile/repository/update-preferences-row";
export {
  updateSecurityByUserId,
  type SecuritySettingsPatch,
} from "@/entities/profile/repository/update-security-row";
