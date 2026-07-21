/**
 * @file features/app-lock/index.ts
 * Client-safe public exports for the app lock gate.
 *
 * Server cookie helpers: import from `@/features/app-lock/server`.
 */

export { AppLockGate, type AppLockGateProps } from "@/features/app-lock/ui/app-lock-gate";
export {
  fetchAppLockUnlockStatus,
  fetchUnlockAppLock,
  type AppLockUnlockStatus,
} from "@/features/app-lock/client/unlock-app-lock";
