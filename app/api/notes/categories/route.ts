/**
 * @file app/api/notes/categories/route.ts
 * GET active note categories for the authenticated user.
 */

import { getNoteCategoriesResponse } from "@/entities/note/server";
import { requireAuthenticatedUserId } from "@/shared/lib/auth/require-authenticated-user";

/**
 * Returns active note categories for the authenticated user.
 */
export async function GET() {
  const userId = await requireAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await getNoteCategoriesResponse(userId);

    return Response.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch note categories.";

    return Response.json({ error: message }, { status: 500 });
  }
}
