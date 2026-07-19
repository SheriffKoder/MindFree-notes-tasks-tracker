/**
 * @file app/api/activities/route.ts
 * GET activity definitions for a kind; POST create a definition.
 *
 * Thin route: auth → validate → server use-case → JSON. Definitions are not
 * month-scoped; status filtering happens client-side.
 */

import {
  createActivity,
  getActivitiesResponse,
} from "@/entities/activity/server";
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

/**
 * Creates an activity definition (`kind` supplied in the body by the page).
 *
 * @param request - JSON body matching `createActivityBodySchema`
 * @returns created activity payload (`201`)
 */
export async function POST(request: Request) {
  const userId = await requireAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const activity = await createActivity(userId, body);

    return Response.json({ activity }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create activity.";

    if (message === "Invalid activity create payload.") {
      return Response.json({ error: message }, { status: 400 });
    }

    return Response.json({ error: message }, { status: 500 });
  }
}
