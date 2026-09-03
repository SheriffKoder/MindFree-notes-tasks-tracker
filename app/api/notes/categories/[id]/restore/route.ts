/**
 * @file app/api/notes/categories/[id]/restore/route.ts
 * POST restore for a soft-deleted note category.
 *
 * Purpose: Explicit restore endpoint (preferred over PATCH deletedAt null).
 * Used in: entities/note/category/client/restore-category.ts
 * Used for: Reactivate archived categories from the manage drawer.
 *
 * Steps:
 * 1. Require authenticated user + resolve `:id`
 * 2. Call restoreNoteCategory; map name conflicts to 409
 */

import {
  CategoryNameConflictError,
  restoreNoteCategory,
} from "@/entities/note/server";
import { requireAuthenticatedUserId } from "@/shared/lib/auth/require-authenticated-user";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Restores an archived note category.
 *
 * @returns `{ category }` with cleared `deletedAt`
 */
export async function POST(_request: Request, context: RouteContext) {
  // 1. Auth gate
  const userId = await requireAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    // 2. Clear deleted_at; unique name may conflict with an active sibling
    const category = await restoreNoteCategory(userId, id);

    return Response.json({ category });
  } catch (error) {
    if (error instanceof CategoryNameConflictError) {
      return Response.json(
        { error: error.message, code: error.code },
        { status: 409 },
      );
    }

    const message =
      error instanceof Error ? error.message : "Failed to restore note category.";

    if (message === "Category not found.") {
      return Response.json({ error: message }, { status: 404 });
    }

    return Response.json({ error: message }, { status: 500 });
  }
}
