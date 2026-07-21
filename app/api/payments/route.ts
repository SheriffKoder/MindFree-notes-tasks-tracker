/**
 * @file app/api/payments/route.ts
 * GET month payments; POST create payment.
 *
 * Purpose: HTTP entrypoints for month reads and payment creation.
 * Used in: entities/payment/client/post-payment.ts, payments-month-query.ts
 * Used for: TanStack month fetchers and create mutation confirmation.
 *
 * Function Index:
 * GET — month payments list + totalAmount
 * POST — create payment for authenticated user
 */

import {
  createPayment,
  getPaymentsMonthResponse,
} from "@/entities/payment/server";
import { requireAuthenticatedUserId } from "@/shared/lib/auth/require-authenticated-user";

/**
 * Returns payments for `?month=YYYY-MM` (defaults to current month).
 *
 * @param request - incoming HTTP request with optional month query
 * @returns month payments payload (`month`, `payments`, `totalAmount`)
 */
export async function GET(request: Request) {
  const userId = await requireAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Month param — optional YYYY-MM from query string
    const { searchParams } = new URL(request.url);
    const response = await getPaymentsMonthResponse(
      userId,
      searchParams.get("month"),
    );

    return Response.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch payments.";

    return Response.json({ error: message }, { status: 500 });
  }
}

/**
 * Creates a payment for the authenticated user.
 *
 * @param request - JSON body with payment fields
 * @returns created payment payload
 */
export async function POST(request: Request) {
  const userId = await requireAuthenticatedUserId();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Body — validated in createPayment use-case
    const body = await request.json();
    const payment = await createPayment(userId, body);

    return Response.json({ payment }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create payment.";

    if (message === "Invalid payment payload.") {
      return Response.json({ error: message }, { status: 400 });
    }

    return Response.json({ error: message }, { status: 500 });
  }
}
