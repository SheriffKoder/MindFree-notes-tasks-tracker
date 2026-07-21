/**
 * @file app/api/profile/route.ts
 * GET ProfilePageData for the authenticated user.
 */

import { getProfilePageData } from "@/entities/profile/server";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Returns the full Profile page read model (no password hash).
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await getProfilePageData(user.id, user.email ?? "");

    return Response.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch profile.";

    return Response.json({ error: message }, { status: 500 });
  }
}
