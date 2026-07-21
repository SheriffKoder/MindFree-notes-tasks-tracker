/**
 * @file entities/payment/queries/get-payments-page-initial-data.ts
 * Read use-case: SSR initial payload for the Payments page.
 */

import type { PaymentsMonthResponse } from "@/entities/payment/model/read-models";
import { getPaymentsMonthResponse } from "@/entities/payment/queries/get-payments-month-response";

/**
 * Initial data loaded by the Payments server page / hydration seed.
 */
export interface PaymentsPageInitialData {
  /** Month payments payload (includes resolved month + total). */
  monthPayments: PaymentsMonthResponse;
}

/**
 * Fetches the month payments payload for SSR hydration.
 *
 * @param userId - owner user id
 * @param monthParam - raw `month` search param (defaults to current month)
 * @returns initial payloads for hydration
 */
export async function getPaymentsPageInitialData(
  userId: string,
  monthParam: string | null | undefined,
): Promise<PaymentsPageInitialData> {
  const monthPayments = await getPaymentsMonthResponse(userId, monthParam);

  return { monthPayments };
}
