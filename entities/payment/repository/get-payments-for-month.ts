/**
 * @file entities/payment/repository/get-payments-for-month.ts
 * Fetches payments whose `date` falls in a `YYYY-MM` month.
 *
 * Purpose: Month-scoped SELECT for the payments list query.
 * Used in: entities/payment/queries/get-payments-month-response.ts
 * Used for: SSR hydration, GET /api/payments, and TanStack month caches.
 *
 * Steps:
 * 1. Derive inclusive start / exclusive end dates for the month key.
 * 2. Query owner rows in range, newest `updated_at` first.
 * 3. Map each Supabase row to domain `Payment`.
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
  // 1. Month bounds — SQL date filter for payment.date
  const { monthStart, monthEnd } = getMonthRange(month);
  const supabase = await createClient();

  /////////////////////////////////
  // 2. Query — owner rows in month, newest edits first
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

  /////////////////////////////////
  // 3. Map — rows → domain payments
  return (data as PaymentRow[] | null)?.map(mapPaymentRow) ?? [];
}
