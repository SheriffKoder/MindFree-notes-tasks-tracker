/**
 * @file app/api/notes/calendar/route.ts
 * GET calendar notes aggregated for a month; POST lazy calendar note create.
 */

import {
  createCalendarNote,
  getCalendarNotesResponse,
  NoteDateConflictError,
} from "@/entities/note/server";
import { requireAuthenticatedUserId } from "@/shared/lib/auth/require-authenticated-user";

/**
 * Returns calendar notes for `?month=YYYY-MM`.
 *
 * @param request - incoming HTTP request
 * @returns aggregated calendar payload
 */
export async function GET(request: Request) {
  const userId = await requireAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  try {
    const response = await getCalendarNotesResponse(
      userId,
      searchParams.get("month"),
    );

    return Response.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch calendar notes.";

    return Response.json({ error: message }, { status: 500 });
  }
}

/**
 * Creates a calendar note for one day (lazy create from the drawer).
 *
 * @param request - JSON body with `date` and editable fields
 * @returns created note payload
 */
export async function POST(request: Request) {
  const userId = await requireAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const note = await createCalendarNote(userId, body);

    return Response.json({ note }, { status: 201 });
  } catch (error) {
    if (error instanceof NoteDateConflictError) {
      return Response.json(
        {
          error: error.message,
          conflictingNoteId: error.conflictingNoteId,
        },
        { status: 409 },
      );
    }

    const message =
      error instanceof Error ? error.message : "Failed to create calendar note.";

    if (message === "Invalid calendar note payload.") {
      return Response.json({ error: message }, { status: 400 });
    }

    return Response.json({ error: message }, { status: 500 });
  }
}
