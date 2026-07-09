/**
 * @file app/api/notes/general/route.ts
 * GET all general notes for the authenticated user.
 */

import { getGeneralNotesResponse } from "@/entities/note";
import { requireAuthenticatedUserId } from "@/shared/lib/auth/require-authenticated-user";

/**
 * Returns every general note (`date IS NULL`, `is_quick = false`).
 *
 * @returns general notes payload
 */
export async function GET() {
  const userId = await requireAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await getGeneralNotesResponse();

    return Response.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch general notes.";

    return Response.json({ error: message }, { status: 500 });
  }
}
