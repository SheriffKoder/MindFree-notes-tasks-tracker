/**
 * @file entities/payment/repository/update-payment.ts
 * Partial payment updates for a row owned by the current user (RLS).
 */

import type { Payment, PaymentRow } from "@/entities/payment/model/types";
import type { UpdatePaymentBody } from "@/entities/payment/schema";
import { mapPaymentRow } from "@/entities/payment/transform";
import { PAYMENTS_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Applies a partial update to one payment row owned by the current user.
 *
 * @param userId - owner user id
 * @param id - payment row id
 * @param patch - editable fields to merge
 * @returns updated payment, or `null` when no row matches
 */
export async function updatePaymentById(
  userId: string,
  id: string,
  patch: UpdatePaymentBody,
): Promise<Payment | null> {
  const supabase = await createClient();

  const dbPatch: Partial<
    Pick<PaymentRow, "title" | "amount" | "description" | "date" | "group">
  > = {};

  if (patch.title !== undefined) {
    dbPatch.title = patch.title;
  }

  if (patch.amount !== undefined) {
    dbPatch.amount = patch.amount;
  }

  if (patch.description !== undefined) {
    dbPatch.description = patch.description;
  }

  if (patch.date !== undefined) {
    dbPatch.date = patch.date;
  }

  if (patch.group !== undefined) {
    dbPatch.group = patch.group;
  }

  const { data, error } = await supabase
    .from(PAYMENTS_TABLE)
    .update(dbPatch)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update payment: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapPaymentRow(data as PaymentRow);
}
