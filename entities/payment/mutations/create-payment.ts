/**
 * @file entities/payment/mutations/create-payment.ts
 * Server use-case for payment creation.
 *
 * Purpose: Validate POST body and delegate to the repository INSERT.
 * Used in: app/api/payments/route.ts (POST)
 * Used for: Creating payments from the drawer autosave and explicit saves.
 *
 * Steps:
 * 1. Parse raw body with Zod create schema.
 * 2. Insert validated payload via repository.
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
  // 1. Validate — reject malformed create payloads early
  const parsed = createPaymentBodySchema.safeParse(body);

  if (!parsed.success) {
    throw new Error("Invalid payment payload.");
  }

  // 2. Persist — insert owner-scoped row
  const payload: CreatePaymentBody = parsed.data;
  return createPaymentRow(userId, payload);
}
