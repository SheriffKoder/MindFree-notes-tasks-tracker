/**
 * @file entities/payment/queries/get-payments-month-response.ts
 * Read use-case: month payments list + total amount.
 */

import { parseMonthParam } from "@/entities/payment/lib/parse-month";
import type { PaymentsMonthResponse } from "@/entities/payment/model/read-models";
import { getPaymentsForMonth } from "@/entities/payment/repository";

/**
 * Sums payment amounts with cent-precision rounding.
 *
 * @param amounts - payment amounts in major currency units
 * @returns total rounded to 2 decimal places
 */
function sumAmounts(amounts: number[]): number {
  const cents = amounts.reduce(
    (sum, amount) => sum + Math.round(amount * 100),
    0,
  );

  return cents / 100;
}

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
  const month = parseMonthParam(monthParam);
  const payments = await getPaymentsForMonth(userId, month);

  return {
    month,
    payments,
    totalAmount: sumAmounts(payments.map((payment) => payment.amount)),
  };
}
