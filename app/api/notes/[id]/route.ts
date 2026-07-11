/**
 * @file app/api/notes/[id]/route.ts
 * PATCH autosave and DELETE for an existing note row.
 */

import { deleteNote, updateNote } from "@/entities/note/server";
import { NoteDateConflictError } from "@/entities/note/mutations/note-date-conflict-error";
import { requireAuthenticatedUserId } from "@/shared/lib/auth/require-authenticated-user";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Partially updates one note (`title`, `content`, `starred`, `isImportant`, `date`).
 *
 * @param request - incoming HTTP request with JSON body
 * @param context - dynamic route params
 * @returns updated note payload
 */
export async function PATCH(request: Request, context: RouteContext) {
  const userId = await requireAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = await request.json();
    const note = await updateNote(id, body);

    return Response.json({ note });
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
      error instanceof Error ? error.message : "Failed to update note.";

    if (message === "Note not found.") {
      return Response.json({ error: message }, { status: 404 });
    }

    if (message === "Invalid note update payload.") {
      return Response.json({ error: message }, { status: 400 });
    }

    return Response.json({ error: message }, { status: 500 });
  }
}

/**
 * Deletes one note row owned by the authenticated user.
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
    await deleteNote(id);

    return new Response(null, { status: 204 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete note.";

    if (message === "Note not found.") {
      return Response.json({ error: message }, { status: 404 });
    }

    return Response.json({ error: message }, { status: 500 });
  }
}
