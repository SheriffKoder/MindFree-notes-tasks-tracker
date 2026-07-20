/**
 * @file app/api/profile/account/route.ts
 * PATCH profile account (display name).
 */

import { updateProfile } from "@/entities/profile/server";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Updates the authenticated user's display name.
 *
 * @param request - JSON body `{ displayName }`
 * @returns `{ account }` read-model slice
 */
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const account = await updateProfile(user.id, user.email ?? "", body);

    return Response.json({ account });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update profile.";

    if (message === "Invalid profile update payload.") {
      return Response.json({ error: message }, { status: 400 });
    }

    if (message === "Profile not found.") {
      return Response.json({ error: message }, { status: 404 });
    }

    return Response.json({ error: message }, { status: 500 });
  }
}
