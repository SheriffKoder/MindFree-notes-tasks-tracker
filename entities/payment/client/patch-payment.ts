/**
 * @file entities/payment/client/patch-payment.ts
 * Client fetcher for PATCH /api/payments/:id.
 *
 * Purpose: Browser PATCH for payment update mutations.
 * Used in: entities/payment/hooks/use-update-payment-mutation.ts
 * Used for: Autosave patches and optimistic hub reconciliation.
 *
 * Steps:
 * 1. PATCH partial JSON body to /api/payments/:id.
 * 2. Attach HTTP status on errors; return confirmed payment on success.
 */

import type { Payment } from "@/entities/payment/model/types";
import type { UpdatePaymentBody } from "@/entities/payment/schema";

export interface PatchPaymentResponse {
  payment: Payment;
}

/**
 * Partially updates one payment row.
 *
 * @param id - payment row id
 * @param body - partial patch payload
 * @returns server-confirmed payment
 */
export async function fetchPatchPayment(
  id: string,
  body: UpdatePaymentBody,
): Promise<PatchPaymentResponse> {
  /////////////////////////////////
  // 1. Request — same-origin PATCH with partial JSON body
  const response = await fetch(`/api/payments/${encodeURIComponent(id)}`, {
    method: "PATCH",
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
    const error = new Error(
      errorBody?.error ?? "Failed to update payment.",
    ) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  /////////////////////////////////
  // 2. Success — server-confirmed payment row
  return response.json() as Promise<PatchPaymentResponse>;
}
