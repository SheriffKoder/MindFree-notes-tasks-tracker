/**
 * @file app/api/notes/general/route.ts
 * GET all general notes; POST lazy general note create.
 */

import {
  createGeneralNote,
  getGeneralNotesResponse,
} from "@/entities/note/server";
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

/**
 * Creates a general note (lazy create from the drawer).
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
    const note = await createGeneralNote(body);

    return Response.json({ note }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create general note.";

    if (message === "Invalid general note payload.") {
      return Response.json({ error: message }, { status: 400 });
    }

    return Response.json({ error: message }, { status: 500 });
  }
}
