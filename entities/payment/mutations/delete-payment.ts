/**
 * @file entities/payment/mutations/delete-payment.ts
 * Server use-case for deleting an existing payment row.
 *
 * Purpose: Owner-scoped DELETE with not-found mapping.
 * Used in: app/api/payments/[id]/route.ts (DELETE)
 * Used for: Hard-delete from the payment drawer title actions.
 *
 * Steps:
 * 1. Delete row via repository.
 * 2. Throw when no row matched (404 at route layer).
 */

import { deletePaymentById } from "@/entities/payment/repository";

/**
 * Deletes one payment row owned by the authenticated user (RLS-scoped).
 *
 * @param userId - owner user id
 * @param id - payment row id
 * @throws when the payment is not found
 */
export async function deletePayment(userId: string, id: string): Promise<void> {
  // 1. Delete — owner-scoped row removal
  const deleted = await deletePaymentById(userId, id);

  // 2. Not found — surface to API route as 404
  if (!deleted) {
    throw new Error("Payment not found.");
  }
}
