/**
 * @file app/api/profile/preferences/route.ts
 * PATCH profile preferences (theme + export).
 */

import { updatePreferences } from "@/entities/profile/server";
import { requireAuthenticatedUserId } from "@/shared/lib/auth/require-authenticated-user";

/**
 * Partially updates theme / custom / export preferences.
 *
 * @param request - JSON preference fields
 * @returns `{ preferences }` read-model slice
 */
export async function PATCH(request: Request) {
  const userId = await requireAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const preferences = await updatePreferences(userId, body);

    return Response.json({ preferences });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update preferences.";

    if (message === "Invalid preferences update payload.") {
      return Response.json({ error: message }, { status: 400 });
    }

    if (message === "Preferences not found.") {
      return Response.json({ error: message }, { status: 404 });
    }

    return Response.json({ error: message }, { status: 500 });
  }
}
