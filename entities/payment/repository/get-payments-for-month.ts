/**
 * @file entities/payment/repository/get-payments-for-month.ts
 * Fetches payments whose `date` falls in a `YYYY-MM` month.
 */

import { getMonthRange } from "@/entities/payment/lib/parse-month";
import type { Payment, PaymentRow } from "@/entities/payment/model/types";
import { mapPaymentRow } from "@/entities/payment/transform";
import { PAYMENTS_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Fetches payments for the given month, newest updates first.
 *
 * @param userId - owner user id
 * @param month - `YYYY-MM` month key
 * @returns payments in the month, ordered by `updated_at` descending
 */
export async function getPaymentsForMonth(
  userId: string,
  month: string,
): Promise<Payment[]> {
  const { monthStart, monthEnd } = getMonthRange(month);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(PAYMENTS_TABLE)
    .select("*")
    .eq("user_id", userId)
    .gte("date", monthStart)
    .lt("date", monthEnd)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch payments: ${error.message}`);
  }

  return (data as PaymentRow[] | null)?.map(mapPaymentRow) ?? [];
}
