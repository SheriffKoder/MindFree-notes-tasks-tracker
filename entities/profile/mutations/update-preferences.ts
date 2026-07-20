/**
 * @file entities/profile/mutations/update-preferences.ts
 * Server use-case for PATCH profile preferences (theme + export).
 */

import { toProfilePreferences } from "@/entities/profile/lib/map-row";
import type { ProfilePreferences } from "@/entities/profile/model/read-models";
import { updatePreferencesByUserId } from "@/entities/profile/repository/update-preferences-row";
import { updatePreferencesBodySchema } from "@/entities/profile/schema";

/**
 * Partially updates theme / custom / export preferences.
 *
 * @param userId - authenticated user id
 * @param body - raw request body
 * @returns updated preferences slice
 */
export async function updatePreferences(
  userId: string,
  body: unknown,
): Promise<ProfilePreferences> {
  const parsed = updatePreferencesBodySchema.safeParse(body);

  if (!parsed.success) {
    throw new Error("Invalid preferences update payload.");
  }

  const preferences = await updatePreferencesByUserId(userId, parsed.data);

  if (!preferences) {
    throw new Error("Preferences not found.");
  }

  return toProfilePreferences(preferences);
}
