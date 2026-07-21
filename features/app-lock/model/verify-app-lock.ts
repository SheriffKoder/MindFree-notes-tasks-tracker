/**
 * @file features/app-lock/model/verify-app-lock.ts
 * Verifies the app-lock password and sets the unlock session cookie.
 */

import { verifyAppPassword } from "@/entities/profile/lib/hash-app-password";
import { getSecurityRow } from "@/entities/profile/repository/get-security-row";
import { setAppLockUnlocked } from "@/features/app-lock/model/app-lock-session-cookie";

export type VerifyAppLockResult =
  | { ok: true }
  | { ok: false; reason: "not_enabled" | "invalid_password" };

/**
 * Verifies plaintext against the stored hash and unlocks the session on success.
 *
 * @param userId - authenticated user id
 * @param password - plaintext candidate (never logged)
 */
export async function verifyAndUnlockAppLock(
  userId: string,
  password: string,
): Promise<VerifyAppLockResult> {
  const security = await getSecurityRow(userId);

  if (!security?.appLockEnabled || !security.appPasswordHash) {
    return { ok: false, reason: "not_enabled" };
  }

  const matches = await verifyAppPassword(password, security.appPasswordHash);

  if (!matches) {
    return { ok: false, reason: "invalid_password" };
  }

  await setAppLockUnlocked(userId);
  return { ok: true };
}
