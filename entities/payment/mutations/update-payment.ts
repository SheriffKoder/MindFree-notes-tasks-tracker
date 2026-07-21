/**
 * @file entities/payment/mutations/update-payment.ts
 * Server use-case for PATCH payment updates.
 */

import type { Payment } from "@/entities/payment/model/types";
import { updatePaymentById } from "@/entities/payment/repository";
import { updatePaymentBodySchema } from "@/entities/payment/schema";

/**
 * Updates an existing payment row for the authenticated user (RLS-scoped).
 *
 * @param userId - owner user id
 * @param id - payment row id
 * @param body - raw request body (validated here)
 * @returns updated domain payment
 * @throws when body is invalid or the payment is not found
 */
export async function updatePayment(
  userId: string,
  id: string,
  body: unknown,
): Promise<Payment> {
  const parsed = updatePaymentBodySchema.safeParse(body);

  if (!parsed.success) {
    throw new Error("Invalid payment update payload.");
  }

  const payment = await updatePaymentById(userId, id, parsed.data);

  if (!payment) {
    throw new Error("Payment not found.");
  }

  return payment;
}
