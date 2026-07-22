/**
 * @file entities/payment/queries/get-payments-page-initial-data.ts
 * Read use-case: SSR initial payload for the Payments page.
 *
 * Purpose: Bundle month payments for SSR cache seeding.
 * Used in: views/payments/ui/payments-hydration-seed.tsx
 * Used for: Writing the first warm month cache before client hydration.
 *
 * Steps:
 * 1. Load month payments via getPaymentsMonthResponse.
 * 2. Wrap in PaymentsPageInitialData for the hydration seeder.
 */

import type { PaymentsMonthResponse } from "@/entities/payment/model/read-models";
import {
  type ParseMonthParamOptions,
} from "@/entities/payment/lib/parse-month";
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
 * @param parseOptions - optional demo-session flags for fallback resolution
 * @returns initial payloads for hydration
 */
export async function getPaymentsPageInitialData(
  userId: string,
  monthParam: string | null | undefined,
  parseOptions: ParseMonthParamOptions = {},
): Promise<PaymentsPageInitialData> {
  // 1. Month payload — list + total for SSR seed
  const monthPayments = await getPaymentsMonthResponse(
    userId,
    monthParam,
    parseOptions,
  );

  // 2. Wrap — shape consumed by hydration seeder
  return { monthPayments };
}
