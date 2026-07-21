/**
 * @file entities/payment/client/post-payment.ts
 * Client fetcher for POST /api/payments.
 *
 * Purpose: Browser POST for payment creation mutations.
 * Used in: entities/payment/hooks/use-create-payment-mutation.ts
 * Used for: Confirming optimistic create rows with the server response.
 *
 * Steps:
 * 1. POST JSON body to /api/payments.
 * 2. Parse error JSON or return confirmed payment payload.
 */

import type { Payment } from "@/entities/payment/model/types";
import type { CreatePaymentBody } from "@/entities/payment/schema";

export interface PostPaymentResponse {
  payment: Payment;
}

/**
 * Creates a payment row.
 *
 * @param body - create payload
 * @returns server-confirmed payment
 */
export async function fetchPostPayment(
  body: CreatePaymentBody,
): Promise<PostPaymentResponse> {
  /////////////////////////////////
  // 1. Request — same-origin POST with JSON body
  const response = await fetch("/api/payments", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(errorBody?.error ?? "Failed to create payment.");
  }

  /////////////////////////////////
  // 2. Success — server-confirmed payment row
  return response.json() as Promise<PostPaymentResponse>;
}
