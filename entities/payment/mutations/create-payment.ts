/**
 * @file entities/payment/mutations/create-payment.ts
 * Server use-case for payment creation.
 */

import type { Payment } from "@/entities/payment/model/types";
import { createPayment as createPaymentRow } from "@/entities/payment/repository";
import {
  createPaymentBodySchema,
  type CreatePaymentBody,
} from "@/entities/payment/schema";

/**
 * Inserts a payment for the user after validating the request body.
 *
 * @param userId - owner user id
 * @param body - raw request body (validated here)
 * @returns created domain payment
 * @throws when body is invalid
 */
export async function createPayment(
  userId: string,
  body: unknown,
): Promise<Payment> {
  const parsed = createPaymentBodySchema.safeParse(body);

  if (!parsed.success) {
    throw new Error("Invalid payment payload.");
  }

  const payload: CreatePaymentBody = parsed.data;
  return createPaymentRow(userId, payload);
}
