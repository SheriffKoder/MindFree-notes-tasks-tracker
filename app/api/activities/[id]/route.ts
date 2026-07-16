/**
 * @file app/api/activities/[id]/route.ts
 * PATCH (edit / archive / restore) and DELETE for one activity definition.
 *
 * Thin route: auth → use-case → JSON. Archive/restore are ordinary PATCH
 * bodies with `archivedAt` (set or null) — no separate archive endpoint.
 */

import {
  deleteActivity,
  updateActivity,
} from "@/entities/activity/server";
import { requireAuthenticatedUserId } from "@/shared/lib/auth/require-authenticated-user";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Partially updates one activity (`title`, schedule, `archivedAt`, …).
 *
 * @param request - incoming HTTP request with JSON body
 * @param context - dynamic route params
 * @returns updated activity payload
 */
export async function PATCH(request: Request, context: RouteContext) {
  const userId = await requireAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const activity = await updateActivity(userId, id, body);

    return Response.json({ activity });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update activity.";

    if (message === "Activity not found.") {
      return Response.json({ error: message }, { status: 404 });
    }

    if (message === "Invalid activity update payload.") {
      return Response.json({ error: message }, { status: 400 });
    }

    return Response.json({ error: message }, { status: 500 });
  }
}

/**
 * Hard-deletes one activity definition (records cascade via FK).
 *
 * @param _request - incoming HTTP request (unused)
 * @param context - dynamic route params
 * @returns empty success response
 */
export async function DELETE(_request: Request, context: RouteContext) {
  const userId = await requireAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    await deleteActivity(userId, id);

    return new Response(null, { status: 204 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete activity.";

    if (message === "Activity not found.") {
      return Response.json({ error: message }, { status: 404 });
    }

    return Response.json({ error: message }, { status: 500 });
  }
}
