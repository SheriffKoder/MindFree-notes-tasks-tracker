/**
 * @file features/app-lock/server.ts
 * Server-only app lock session helpers.
 *
 * Do not import from `"use client"` modules.
 */

export {
  APP_LOCK_UNLOCKED_COOKIE,
  clearAppLockUnlocked,
  isAppLockUnlocked,
  setAppLockUnlocked,
} from "@/features/app-lock/model/app-lock-session-cookie";
export {
  verifyAndUnlockAppLock,
  type VerifyAppLockResult,
} from "@/features/app-lock/model/verify-app-lock";
