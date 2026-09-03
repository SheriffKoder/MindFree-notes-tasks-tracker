/**
 * @file app/api/notes/categories/[id]/route.ts
 * PATCH update + DELETE soft/hard for one note category.
 *
 * Purpose: Per-category write routes for the manage drawer.
 * Used in: entities/note/category/client patch/delete fetchers
 * Used for: Update fields; soft-delete by default; hard-delete with `?hard=1`.
 *
 * Steps:
 * 1. Require authenticated user + resolve `:id`
 * 2. PATCH — partial update via updateNoteCategory
 * 3. DELETE — soft unless `hard=1`; Diary hard-delete → 403
 */

import {
  CategoryNameConflictError,
  DefaultCategoryProtectedError,
  hardDeleteNoteCategory,
  softDeleteNoteCategory,
  updateNoteCategory,
} from "@/entities/note/server";
import { requireAuthenticatedUserId } from "@/shared/lib/auth/require-authenticated-user";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Partially updates one note category (`name`, `showOnHome`, `sortOrder`).
 */
export async function PATCH(request: Request, context: RouteContext) {
  // 1. Auth gate
  const userId = await requireAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Resolve dynamic id from the App Router context
  const { id } = await context.params;

  try {
    const body = await request.json();
    const category = await updateNoteCategory(userId, id, body);

    return Response.json({ category });
  } catch (error) {
    if (error instanceof CategoryNameConflictError) {
      return Response.json(
        { error: error.message, code: error.code },
        { status: 409 },
      );
    }

    const message =
      error instanceof Error ? error.message : "Failed to update note category.";

    if (message === "Category not found.") {
      return Response.json({ error: message }, { status: 404 });
    }

    if (message === "Invalid note category payload.") {
      return Response.json({ error: message }, { status: 400 });
    }

    return Response.json({ error: message }, { status: 500 });
  }
}

/**
 * Soft-deletes a category, or hard-deletes when `?hard=1`.
 *
 * Hard-delete cascades notes; the default Diary category cannot be hard-deleted.
 */
export async function DELETE(request: Request, context: RouteContext) {
  // 1. Auth gate
  const userId = await requireAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  // 2. Hard delete is opt-in — default keeps notes via soft archive
  const hard = new URL(request.url).searchParams.get("hard") === "1";

  try {
    if (hard) {
      await hardDeleteNoteCategory(userId, id);
    } else {
      await softDeleteNoteCategory(userId, id);
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    // 3. Diary protection is a domain rule — surface as 403
    if (error instanceof DefaultCategoryProtectedError) {
      return Response.json(
        { error: error.message, code: error.code },
        { status: 403 },
      );
    }

    const message =
      error instanceof Error ? error.message : "Failed to delete note category.";

    if (message === "Category not found.") {
      return Response.json({ error: message }, { status: 404 });
    }

    return Response.json({ error: message }, { status: 500 });
  }
}
