/**
 * @file entities/profile/mutations/update-profile.ts
 * Server use-case for PATCH profile account (display name).
 */

import { toProfileAccount } from "@/entities/profile/lib/map-row";
import type { ProfileAccount } from "@/entities/profile/model/read-models";
import { updateProfileDisplayName } from "@/entities/profile/repository/update-profile-row";
import { updateProfileBodySchema } from "@/entities/profile/schema";

/**
 * Updates the authenticated user's display name.
 *
 * @param userId - authenticated user id
 * @param authEmail - auth email for the account read-model slice
 * @param body - raw request body
 * @returns updated account slice
 */
export async function updateProfile(
  userId: string,
  authEmail: string,
  body: unknown,
): Promise<ProfileAccount> {
  const parsed = updateProfileBodySchema.safeParse(body);

  if (!parsed.success) {
    throw new Error("Invalid profile update payload.");
  }

  const profile = await updateProfileDisplayName(
    userId,
    parsed.data.displayName,
  );

  if (!profile) {
    throw new Error("Profile not found.");
  }

  return toProfileAccount(profile, authEmail);
}
