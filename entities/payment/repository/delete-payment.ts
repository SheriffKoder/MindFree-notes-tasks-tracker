/**
 * @file entities/payment/repository/delete-payment.ts
 * Deletes one payment row owned by the current user (RLS).
 *
 * Purpose: Supabase DELETE for one owner-scoped payment row.
 * Used in: entities/payment/mutations/delete-payment.ts
 * Used for: Hard-delete from the drawer and DELETE /api/payments/:id.
 *
 * Steps:
 * 1. Delete row matching id + userId.
 * 2. Return whether a row was removed.
 */

import { PAYMENTS_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Deletes one payment row owned by the current user (RLS).
 *
 * @param userId - owner user id
 * @param id - payment row id
 * @returns whether a row was removed
 */
export async function deletePaymentById(
  userId: string,
  id: string,
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(PAYMENTS_TABLE)
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to delete payment: ${error.message}`);
  }

  return Boolean(data);
}
