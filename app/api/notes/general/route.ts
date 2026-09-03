/**
 * @file app/api/notes/general/route.ts
 * GET undated notes for one category; POST lazy general note create.
 *
 * Purpose: Category-scoped undated list + create HTTP surface.
 * Used in: generalNotesQuery / useCreateGeneralNoteMutation
 * Used for: `?categoryId=` on GET; body `categoryId` on POST (required).
 */

import {
  createGeneralNote,
  getGeneralNotesResponse,
} from "@/entities/note/server";
import { requireAuthenticatedUserId } from "@/shared/lib/auth/require-authenticated-user";

/**
 * Returns undated notes (`date IS NULL`, `is_quick = false`) for one category.
 *
 * @returns general notes payload `{ categoryId, generalNotes }`
 */
export async function GET(request: Request) {
  const userId = await requireAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Category scoping is required — undated lists are per-category
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");

  if (!categoryId) {
    return Response.json(
      { error: "categoryId query parameter is required." },
      { status: 400 },
    );
  }

  try {
    const response = await getGeneralNotesResponse(userId, categoryId);

    return Response.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch general notes.";

    return Response.json({ error: message }, { status: 500 });
  }
}

/**
 * Creates a general note (lazy create from the drawer).
 *
 * @param request - JSON body with `categoryId` + editable fields
 * @returns created note payload
 */
export async function POST(request: Request) {
  const userId = await requireAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Schema requires categoryId — missing/invalid → 400 via use-case message
    const body = await request.json();
    const note = await createGeneralNote(userId, body);

    return Response.json({ note }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create general note.";

    if (message === "Invalid general note payload.") {
      return Response.json({ error: message }, { status: 400 });
    }

    return Response.json({ error: message }, { status: 500 });
  }
}
