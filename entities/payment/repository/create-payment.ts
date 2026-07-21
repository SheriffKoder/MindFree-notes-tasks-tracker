/**
 * @file entities/payment/repository/create-payment.ts
 * Inserts a payment row for the authenticated user.
 *
 * Purpose: Supabase INSERT for one payment owned by `userId`.
 * Used in: entities/payment/mutations/create-payment.ts
 * Used for: Persisting validated create payloads from the POST API route.
 *
 * Steps:
 * 1. Insert row with owner + editable fields.
 * 2. Select the created row and map to domain `Payment`.
 */

import type { Payment, PaymentRow } from "@/entities/payment/model/types";
import type { CreatePaymentBody } from "@/entities/payment/schema";
import { mapPaymentRow } from "@/entities/payment/transform";
import { PAYMENTS_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Inserts a payment row owned by `userId`.
 *
 * @param userId - owner user id
 * @param payload - validated create body
 * @returns created payment
 */
export async function createPayment(
  userId: string,
  payload: CreatePaymentBody,
): Promise<Payment> {
  const supabase = await createClient();

  /////////////////////////////////
  // 1. Insert — owner-scoped row with editable fields
  const { data, error } = await supabase
    .from(PAYMENTS_TABLE)
    .insert({
      user_id: userId,
      title: payload.title,
      amount: payload.amount,
      description: payload.description,
      date: payload.date,
      group: payload.group,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create payment: ${error.message}`);
  }

  /////////////////////////////////
  // 2. Map — Supabase row → domain Payment
  return mapPaymentRow(data as PaymentRow);
}
