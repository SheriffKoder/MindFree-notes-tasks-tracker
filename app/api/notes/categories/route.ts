/**
 * @file app/api/notes/categories/route.ts
 * GET list + POST create for note categories.
 *
 * Purpose: HTTP surface for active (or archived) category lists and create.
 * Used in: entities/note/category/client fetchers; manage drawer / Notes page
 * Used for: Phase 05 category CRUD — list + create.
 *
 * Steps:
 * 1. Require authenticated user
 * 2. GET — optional `includeDeleted=1` for manage drawer
 * 3. POST — validate body via createNoteCategory use-case
 */

import {
  CategoryNameConflictError,
  createNoteCategory,
  getNoteCategoriesResponse,
} from "@/entities/note/server";
import { requireAuthenticatedUserId } from "@/shared/lib/auth/require-authenticated-user";

/**
 * Returns note categories for the authenticated user.
 *
 * Query: `?includeDeleted=1` includes soft-deleted (archived) rows.
 */
export async function GET(request: Request) {
  // 1. Auth gate — same pattern as other notes routes
  const userId = await requireAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Manage drawer needs archived rows; Notes/Home use active-only
  const includeDeleted =
    new URL(request.url).searchParams.get("includeDeleted") === "1";

  try {
    const response = await getNoteCategoriesResponse(userId, { includeDeleted });

    return Response.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch note categories.";

    return Response.json({ error: message }, { status: 500 });
  }
}

/**
 * Creates a user-managed note category.
 *
 * @param request - JSON body (`name`, optional `showOnHome` / `sortOrder`)
 * @returns `{ category }` with 201
 */
export async function POST(request: Request) {
  // 1. Auth gate
  const userId = await requireAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Delegate validation + insert to the category use-case
    const body = await request.json();
    const category = await createNoteCategory(userId, body);

    return Response.json({ category }, { status: 201 });
  } catch (error) {
    // 3. Map domain errors to HTTP status codes
    if (error instanceof CategoryNameConflictError) {
      return Response.json(
        { error: error.message, code: error.code },
        { status: 409 },
      );
    }

    const message =
      error instanceof Error ? error.message : "Failed to create note category.";

    if (message === "Invalid note category payload.") {
      return Response.json({ error: message }, { status: 400 });
    }

    return Response.json({ error: message }, { status: 500 });
  }
}
