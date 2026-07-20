/**
 * @file app/api/profile/security/route.ts
 * PATCH profile app lock (enable / change / disable). Never returns the hash.
 */

import { updateAppLock } from "@/entities/profile/server";
import {
  clearAppLockUnlocked,
  setAppLockUnlocked,
} from "@/features/app-lock/model/app-lock-session-cookie";
import { requireAuthenticatedUserId } from "@/shared/lib/auth/require-authenticated-user";

/**
 * Updates app-lock settings for the authenticated user.
 *
 * @param request - JSON `{ action, password?, currentPassword? }`
 * @returns `{ security }` read-model slice (`appLockEnabled` only)
 */
export async function PATCH(request: Request) {
  const userId = await requireAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const security = await updateAppLock(userId, body);
    const action =
      body && typeof body === "object" && "action" in body
        ? (body as { action?: string }).action
        : undefined;

    if (action === "enable" || action === "change") {
      await setAppLockUnlocked(userId);
    }

    if (action === "disable") {
      await clearAppLockUnlocked();
    }

    return Response.json({ security });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update app lock settings.";

    if (message === "Invalid app lock update payload.") {
      return Response.json({ error: message }, { status: 400 });
    }

    if (message === "Invalid app lock password.") {
      return Response.json({ error: message }, { status: 403 });
    }

    if (
      message === "Security settings not found." ||
      message === "App lock is not enabled." ||
      message === "App lock is already enabled."
    ) {
      return Response.json({ error: message }, { status: 409 });
    }

    return Response.json({ error: message }, { status: 500 });
  }
}
