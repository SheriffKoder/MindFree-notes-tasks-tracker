/**
 * @file app/api/profile/security/unlock/route.ts
 * Unlock session for app lock (POST) and unlock status (GET).
 */

import { getSecurityRow } from "@/entities/profile/server";
import {
  isAppLockUnlocked,
  setAppLockUnlocked,
} from "@/features/app-lock/model/app-lock-session-cookie";
import { verifyAndUnlockAppLock } from "@/features/app-lock/model/verify-app-lock";
import { requireAuthenticatedUserId } from "@/shared/lib/auth/require-authenticated-user";
import { z } from "zod";

const unlockBodySchema = z.object({
  password: z
    .string()
    .min(1, "Password is required.")
    .max(128, "Password must be 128 characters or fewer."),
});

/**
 * Returns whether app lock is enabled and whether this session is unlocked.
 */
export async function GET() {
  const userId = await requireAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const security = await getSecurityRow(userId);
  const appLockEnabled = security?.appLockEnabled ?? false;

  if (!appLockEnabled) {
    return Response.json({
      appLockEnabled: false,
      unlocked: true,
    });
  }

  const unlocked = await isAppLockUnlocked(userId);

  return Response.json({
    appLockEnabled: true,
    unlocked,
  });
}

/**
 * Verifies the app-lock password and sets the unlock cookie.
 */
export async function POST(request: Request) {
  const userId = await requireAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = unlockBodySchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid unlock payload." },
        { status: 400 },
      );
    }

    const result = await verifyAndUnlockAppLock(userId, parsed.data.password);

    if (!result.ok) {
      if (result.reason === "not_enabled") {
        await setAppLockUnlocked(userId);
        return Response.json({ unlocked: true, appLockEnabled: false });
      }

      return Response.json(
        { error: "Invalid app lock password." },
        { status: 403 },
      );
    }

    return Response.json({ unlocked: true, appLockEnabled: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to unlock app.";

    return Response.json({ error: message }, { status: 500 });
  }
}
