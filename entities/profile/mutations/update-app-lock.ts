/**
 * @file entities/profile/mutations/update-app-lock.ts
 * Server use-case for PATCH profile security (enable / change / disable).
 *
 * Plaintext passwords never leave this module except as a scrypt hash for storage.
 */

import {
  hashAppPassword,
  verifyAppPassword,
} from "@/entities/profile/lib/hash-app-password";
import { toProfileSecurity } from "@/entities/profile/lib/map-row";
import type { ProfileSecurity } from "@/entities/profile/model/read-models";
import { getSecurityRow } from "@/entities/profile/repository/get-security-row";
import { updateSecurityByUserId } from "@/entities/profile/repository/update-security-row";
import { updateAppLockBodySchema } from "@/entities/profile/schema";

/**
 * Enables, changes, or disables the app lock for the authenticated user.
 *
 * @param userId - authenticated user id
 * @param body - raw request body
 * @returns client-safe security slice (no hash)
 */
export async function updateAppLock(
  userId: string,
  body: unknown,
): Promise<ProfileSecurity> {
  const parsed = updateAppLockBodySchema.safeParse(body);

  if (!parsed.success) {
    throw new Error("Invalid app lock update payload.");
  }

  const current = await getSecurityRow(userId);

  if (!current) {
    throw new Error("Security settings not found.");
  }

  const { action, password, currentPassword } = parsed.data;

  if (action === "enable") {
    if (current.appLockEnabled) {
      throw new Error("App lock is already enabled.");
    }

    const appPasswordHash = await hashAppPassword(password!);
    const updated = await updateSecurityByUserId(userId, {
      appLockEnabled: true,
      appPasswordHash,
    });

    if (!updated) {
      throw new Error("Security settings not found.");
    }

    return toProfileSecurity(updated);
  }

  if (!current.appLockEnabled || !current.appPasswordHash) {
    throw new Error("App lock is not enabled.");
  }

  const matches = await verifyAppPassword(
    currentPassword!,
    current.appPasswordHash,
  );

  if (!matches) {
    throw new Error("Invalid app lock password.");
  }

  if (action === "change") {
    const appPasswordHash = await hashAppPassword(password!);
    const updated = await updateSecurityByUserId(userId, {
      appLockEnabled: true,
      appPasswordHash,
    });

    if (!updated) {
      throw new Error("Security settings not found.");
    }

    return toProfileSecurity(updated);
  }

  // disable
  const updated = await updateSecurityByUserId(userId, {
    appLockEnabled: false,
    appPasswordHash: null,
  });

  if (!updated) {
    throw new Error("Security settings not found.");
  }

  return toProfileSecurity(updated);
}
