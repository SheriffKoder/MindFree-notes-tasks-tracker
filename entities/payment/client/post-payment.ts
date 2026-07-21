/**
 * @file entities/payment/client/post-payment.ts
 * Client fetcher for POST /api/payments.
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

  return response.json() as Promise<PostPaymentResponse>;
}
