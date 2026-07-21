/**
 * @file features/app-lock/client/unlock-app-lock.ts
 * Client fetchers for app-lock unlock session endpoints.
 */

export interface AppLockUnlockStatus {
  appLockEnabled: boolean;
  unlocked: boolean;
}

/**
 * Reads unlock status for the current session.
 */
export async function fetchAppLockUnlockStatus(): Promise<AppLockUnlockStatus> {
  const response = await fetch("/api/profile/security/unlock", {
    credentials: "same-origin",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Failed to read app lock status.");
  }

  return response.json() as Promise<AppLockUnlockStatus>;
}

/**
 * Verifies the password and unlocks the session cookie.
 */
export async function fetchUnlockAppLock(
  password: string,
): Promise<AppLockUnlockStatus> {
  const response = await fetch("/api/profile/security/unlock", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Failed to unlock app.");
  }

  return response.json() as Promise<AppLockUnlockStatus>;
}
