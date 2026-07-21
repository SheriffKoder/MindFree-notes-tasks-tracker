/**
 * @file entities/payment/queries/get-payments-month-response.ts
 * Read use-case: month payments list + total amount.
 *
 * Purpose: Compose month key, payments list, and cent-precision total.
 * Used in: app/api/payments/route.ts (GET), get-payments-page-initial-data.ts
 * Used for: API month reads and SSR hydration payloads.
 *
 * Steps:
 * 1. Normalize the month search param.
 * 2. Fetch owner payments for the month via repository.
 * 3. Sum amounts and return the read-model payload.
 */

import { parseMonthParam } from "@/entities/payment/lib/parse-month";
import { sumAmounts } from "@/entities/payment/lib/sum-amounts";
import type { PaymentsMonthResponse } from "@/entities/payment/model/read-models";
import { getPaymentsForMonth } from "@/entities/payment/repository";

/**
 * Fetches payments for a month and computes the month total.
 *
 * @param userId - owner user id
 * @param monthParam - raw `month` search param (defaults to current month)
 * @returns month key, payments, and totalAmount
 */
export async function getPaymentsMonthResponse(
  userId: string,
  monthParam: string | null | undefined,
): Promise<PaymentsMonthResponse> {
  // 1. Month — default invalid params to current month
  const month = parseMonthParam(monthParam);

  // 2. List — owner payments in range, newest edits first
  const payments = await getPaymentsForMonth(userId, month);

  // 3. Total — cent-precision sum for the month header
  return {
    month,
    payments,
    totalAmount: sumAmounts(payments.map((payment) => payment.amount)),
  };
}
