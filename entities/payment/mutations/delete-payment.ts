/**
 * @file entities/payment/mutations/delete-payment.ts
 * Server use-case for deleting an existing payment row.
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
  const deleted = await deletePaymentById(userId, id);

  if (!deleted) {
    throw new Error("Payment not found.");
  }
}
