/**
 * @file entities/payment/repository/create-payment.ts
 * Inserts a payment row for the authenticated user.
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

  return mapPaymentRow(data as PaymentRow);
}
