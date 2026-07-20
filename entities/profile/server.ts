/**
 * @file entities/profile/server.ts
 * Server-side profile barrel — read/write use-cases and auth helper.
 *
 * Purpose: Single import surface for server-only profile operations.
 * Used in: Profile Server Components, `app/api/profile/*`.
 *
 * Types (`ProfilePageData`, etc.) come from `@/entities/profile`.
 */

export { getProfilePageData } from "@/entities/profile/queries";
export {
  updateAppLock,
  updatePreferences,
  updateProfile,
} from "@/entities/profile/mutations";
export {
  ensureProfileExists,
  getAuthenticatedUserId,
  getPreferencesRow,
  getProfileRow,
  getSecurityRow,
} from "@/entities/profile/repository";
