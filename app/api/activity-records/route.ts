/**
 * @file app/api/activity-records/route.ts
 * GET records for a month (`?month=YYYY-MM`); POST upsert / DELETE by key.
 *
 * Thin route: auth → server use-case → JSON. GET's invalid/absent `month`
 * falls back to the current month (handled by the use-case). POST/DELETE key
 * a record by `(taskId, date)`; values are absolute.
 */

import {
  deleteActivityRecord,
  getActivityRecordsResponse,
  upsertActivityRecord,
} from "@/entities/activity/server";
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

/**
 * Upserts today's record by the natural key `(taskId, date)`.
 *
 * @param request - JSON body matching `upsertActivityRecordBodySchema`
 * @returns the upserted record payload (`201`)
 */
export async function POST(request: Request) {
  const userId = await requireAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const record = await upsertActivityRecord(userId, body);

    return Response.json({ record }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to upsert activity record.";

    if (message === "Invalid activity record payload.") {
      return Response.json({ error: message }, { status: 400 });
    }

    return Response.json({ error: message }, { status: 500 });
  }
}

/**
 * Removes a record by the natural key `(taskId, date)` (delete-on-empty).
 *
 * @param request - JSON body with `{ taskId, date }`
 * @returns empty success response (`204`)
 */
export async function DELETE(request: Request) {
  const userId = await requireAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    await deleteActivityRecord(userId, body);

    return new Response(null, { status: 204 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete activity record.";

    if (message === "Invalid activity record delete payload.") {
      return Response.json({ error: message }, { status: 400 });
    }

    return Response.json({ error: message }, { status: 500 });
  }
}
