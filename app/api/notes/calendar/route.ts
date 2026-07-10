/**
 * @file app/api/notes/calendar/route.ts
 * GET calendar notes aggregated for a month.
 */

import { getCalendarNotesResponse } from "@/entities/note/server";
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
    const response = await getCalendarNotesResponse(searchParams.get("month"));

    return Response.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch calendar notes.";

    return Response.json({ error: message }, { status: 500 });
  }
}
