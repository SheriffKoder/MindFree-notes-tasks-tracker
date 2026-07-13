/**
 * @file app/api/notes/home/route.ts
 * GET home notes — quick note slot and starred carousel.
 */

import { getHomeNotesResponse } from "@/entities/note/server";
import { requireAuthenticatedUserId } from "@/shared/lib/auth/require-authenticated-user";

/**
 * Returns the quick note and starred notes for the authenticated user.
 *
 * @returns home notes payload
 */
export async function GET() {
  const userId = await requireAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await getHomeNotesResponse();

    return Response.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch home notes.";

    return Response.json({ error: message }, { status: 500 });
  }
}
