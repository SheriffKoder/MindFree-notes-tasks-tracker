/**
 * @file views/payments/ui/payments-hydration-seed.tsx
 * SSR seed for the Payments TanStack cache — non-blocking sibling of PaymentsClient.
 */

import { dehydrate } from "@tanstack/react-query";
import { connection } from "next/server";

import {
  getAuthenticatedUserId,
  getPaymentsPageInitialData,
  seedPaymentsPageCache,
} from "@/entities/payment/server";
import { getQueryClient, QueryHydration } from "@/shared/react-query";

/**
 * Merges initial payment payloads into the app QueryClient without blocking the UI shell.
 */
export async function PaymentsHydrationSeed() {
  // Satisfy Next.js dynamic route rules before time-based month defaults run.
  await connection();

  const userId = await getAuthenticatedUserId();
  const initialData = await getPaymentsPageInitialData(userId, null);
  const queryClient = getQueryClient();
  seedPaymentsPageCache(queryClient, initialData);

  return <QueryHydration state={dehydrate(queryClient)}>{null}</QueryHydration>;
}
