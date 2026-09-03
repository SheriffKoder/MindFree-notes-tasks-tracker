/**
 * @file app/api/notes/home/route.ts
 * GET home notes strips; POST quick-note create (per category).
 *
 * Purpose: Home strip read model + lazy quick create.
 * Used in: home notes query / create-quick mutation
 * Used for: `{ strips }` payload; POST body requires `categoryId`.
 */

import { createQuickNote, getHomeNotesResponse } from "@/entities/note/server";
import { requireAuthenticatedUserId } from "@/shared/lib/auth/require-authenticated-user";

/**
 * Returns Home category strips (quick + starred per showOnHome category).
 *
 * @returns home notes payload `{ strips }`
 */
export async function GET() {
  const userId = await requireAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await getHomeNotesResponse(userId);

    return Response.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch home notes.";

    return Response.json({ error: message }, { status: 500 });
  }
}

/**
 * Creates a quick note for one category (lazy create from a Home strip).
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
    // Body must include categoryId — enforced by createGeneralNoteBodySchema
    const body = await request.json();
    const note = await createQuickNote(userId, body);

    return Response.json({ note }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create quick note.";

    if (message === "Invalid quick note payload.") {
      return Response.json({ error: message }, { status: 400 });
    }

    return Response.json({ error: message }, { status: 500 });
  }
}
