/**
 * @file app/api/payments/[id]/route.ts
 * PATCH and DELETE for an existing payment row.
 *
 * Purpose: HTTP entrypoints for partial updates and hard-delete.
 * Used in: entities/payment/client/patch-payment.ts, delete-payment.ts
 * Used for: Drawer autosave patches and immediate delete mutations.
 *
 * Function Index:
 * PATCH — partial update one payment
 * DELETE — remove one payment (204 on success)
 */

import { deletePayment, updatePayment } from "@/entities/payment/server";
import { requireAuthenticatedUserId } from "@/shared/lib/auth/require-authenticated-user";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Partially updates one payment.
 *
 * @param request - incoming HTTP request with JSON body
 * @param context - dynamic route params
 * @returns updated payment payload
 */
export async function PATCH(request: Request, context: RouteContext) {
  const userId = await requireAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    // 1. Body — validated in updatePayment use-case
    const body = await request.json();
    const payment = await updatePayment(userId, id, body);

    return Response.json({ payment });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update payment.";

    if (message === "Payment not found.") {
      return Response.json({ error: message }, { status: 404 });
    }

    if (message === "Invalid payment update payload.") {
      return Response.json({ error: message }, { status: 400 });
    }

    return Response.json({ error: message }, { status: 500 });
  }
}

/**
 * Deletes one payment row owned by the authenticated user.
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
    // 1. Delete — owner-scoped row removal via use-case
    await deletePayment(userId, id);

    return new Response(null, { status: 204 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete payment.";

    if (message === "Payment not found.") {
      return Response.json({ error: message }, { status: 404 });
    }

    return Response.json({ error: message }, { status: 500 });
  }
}
