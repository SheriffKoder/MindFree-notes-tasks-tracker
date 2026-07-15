/**
 * @file app/api/activity-records/route.ts
 * GET completion records for a month (`?month=YYYY-MM`).
 *
 * Thin route: auth → server use-case → JSON. An invalid/absent `month` falls
 * back to the current month (handled by the use-case).
 */

import { getActivityRecordsResponse } from "@/entities/activity/server";
import { requireAuthenticatedUserId } from "@/shared/lib/auth/require-authenticated-user";

/**
 * Returns completion records whose `date` falls in `?month=YYYY-MM`.
 *
 * @param request - incoming HTTP request
 * @returns records payload, `401` when unauthenticated
 */
export async function GET(request: Request) {
  const userId = await requireAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  try {
    const response = await getActivityRecordsResponse(
      userId,
      searchParams.get("month"),
    );

    return Response.json(response);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch activity records.";

    return Response.json({ error: message }, { status: 500 });
  }
}
