/**
 * @file app/api/profile/export/route.ts
 * POST — build auth-scoped CSV export for notes + activities.
 *
 * V1 returns downloadable CSV payloads. Email send is intentionally deferred.
 */

import { buildProfileExport } from "@/entities/profile/server";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Generates Excel-compatible CSV files for the signed-in user.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await buildProfileExport(user.id, user.email ?? "");

    return Response.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to build export.";

    console.error("[profile-export]", { userId: user.id, error: message });

    return Response.json({ error: message }, { status: 500 });
  }
}
