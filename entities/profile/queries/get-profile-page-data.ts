/**
 * @file entities/profile/queries/get-profile-page-data.ts
 * Server read use-case: assemble ProfilePageData for SSR and API reads.
 *
 * Purpose: Ensure profile rows exist, then load account / preferences / security
 *          in parallel and map to the client-safe read model (no password hash).
 * Used in: `entities/profile/server.ts` → Profile page / GET /api/profile.
 */

import {
  toProfileAccount,
  toProfilePreferences,
  toProfileSecurity,
} from "@/entities/profile/lib/map-row";
import type { ProfilePageData } from "@/entities/profile/model/read-models";
import {
  ensureProfileExists,
  getPreferencesRow,
  getProfileRow,
  getSecurityRow,
} from "@/entities/profile/repository";

/**
 * Builds the Profile page read model for a user.
 *
 * @param userId - authenticated user id
 * @param authEmail - auth email (source of truth for the account slice)
 * @returns client-safe Profile page payload
 * @throws when any required row is still missing after ensure
 */
export async function getProfilePageData(
  userId: string,
  authEmail: string,
): Promise<ProfilePageData> {
  await ensureProfileExists(userId, authEmail);

  const [profile, preferences, security] = await Promise.all([
    getProfileRow(userId),
    getPreferencesRow(userId),
    getSecurityRow(userId),
  ]);

  if (!profile || !preferences || !security) {
    throw new Error(
      "Profile data incomplete after ensureProfileExists — expected profile, preferences, and security rows.",
    );
  }

  return {
    account: toProfileAccount(profile, authEmail),
    preferences: toProfilePreferences(preferences),
    security: toProfileSecurity(security),
  };
}
