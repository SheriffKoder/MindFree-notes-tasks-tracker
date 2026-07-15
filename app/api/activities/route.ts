/**
 * @file app/api/activities/route.ts
 * GET activity definitions for a kind (`?kind=task|reminder`).
 *
 * Thin route: auth → validate `kind` → server use-case → JSON. Definitions are
 * not month-scoped; status filtering happens client-side. POST (create) lands
 * in Step 12.
 */

import { getActivitiesResponse } from "@/entities/activity/server";
import { activityKindSchema } from "@/entities/activity/schema/activity-form.schema";
import { requireAuthenticatedUserId } from "@/shared/lib/auth/require-authenticated-user";

/**
 * Returns definitions for `?kind=task|reminder` (active and archived).
 *
 * @param request - incoming HTTP request
 * @returns definitions payload, `400` on bad kind, `401` when unauthenticated
 */
export async function GET(request: Request) {
  const userId = await requireAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsedKind = activityKindSchema.safeParse(searchParams.get("kind"));

  if (!parsedKind.success) {
    return Response.json(
      { error: "Query param `kind` must be `task` or `reminder`." },
      { status: 400 },
    );
  }

  try {
    const response = await getActivitiesResponse(userId, parsedKind.data);

    return Response.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch activities.";

    return Response.json({ error: message }, { status: 500 });
  }
}
