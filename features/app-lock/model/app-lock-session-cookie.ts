/**
 * @file features/app-lock/model/app-lock-session-cookie.ts
 * HttpOnly cookie marking the current browser session as app-lock unlocked.
 *
 * Cleared on logout. Value is the authenticated user id (must match).
 */

import { cookies } from "next/headers";

/** Cookie name for the unlock session flag. */
export const APP_LOCK_UNLOCKED_COOKIE = "mf_app_lock_unlocked";

/**
 * Marks the current session unlocked for `userId`.
 */
export async function setAppLockUnlocked(userId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(APP_LOCK_UNLOCKED_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

/**
 * Clears the unlock session cookie (e.g. on logout).
 */
export async function clearAppLockUnlocked(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(APP_LOCK_UNLOCKED_COOKIE);
}

/**
 * Whether the unlock cookie is present and matches `userId`.
 */
export async function isAppLockUnlocked(userId: string): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(APP_LOCK_UNLOCKED_COOKIE)?.value === userId;
}
