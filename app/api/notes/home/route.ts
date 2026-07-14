/**
 * @file app/api/notes/home/route.ts
 * GET home notes — quick note slot and starred carousel.
 */

import { createQuickNote, getHomeNotesResponse } from "@/entities/note/server";
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
    const response = await getHomeNotesResponse(userId);

    return Response.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch home notes.";

    return Response.json({ error: message }, { status: 500 });
  }
}

/**
 * Creates a quick note (lazy create from the home strip).
 *
 * @param request - JSON body with editable fields
 * @returns created note payload
 */
export async function POST(request: Request) {
  const userId = await requireAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const note = await createQuickNote(userId, body);

    return Response.json({ note }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create quick note.";

    if (message === "Invalid quick note payload.") {
      return Response.json({ error: message }, { status: 400 });
    }

    return Response.json({ error: message }, { status: 500 });
  }
}
