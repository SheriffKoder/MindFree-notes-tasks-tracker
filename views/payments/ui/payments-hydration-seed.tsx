/**
 * @file views/payments/ui/payments-hydration-seed.tsx
 * SSR seed for the Payments TanStack cache — non-blocking sibling of PaymentsClient.
 *
 * Purpose: Prefetch and dehydrate month payments without blocking the UI shell.
 * Used in: app/(app)/payments/page.tsx
 * Used for: Warm TanStack cache on first paint for the default/current month.
 *
 * Steps:
 * 1. Satisfy Next.js dynamic route rules (connection).
 * 2. Load authenticated SSR initial data and seed the QueryClient.
 * 3. Dehydrate state for client hydration.
 */

import { dehydrate } from "@tanstack/react-query";
import { connection } from "next/server";

import {
  getPaymentsPageInitialData,
  seedPaymentsPageCache,
} from "@/entities/payment/server";
import { getAuthenticatedDemoSession } from "@/shared/lib/auth/get-demo-session";
import { getQueryClient, QueryHydration } from "@/shared/react-query";

/**
 * Merges initial payment payloads into the app QueryClient without blocking the UI shell.
 */
export async function PaymentsHydrationSeed() {
  // 1. Dynamic route — required before time-based month defaults
  await connection();

  // 2. SSR payload — auth + month list for cache seeding
  const { userId, isDemoUser } = await getAuthenticatedDemoSession();
  const initialData = await getPaymentsPageInitialData(userId, null, {
    isDemoUser,
  });
  const queryClient = getQueryClient();
  seedPaymentsPageCache(queryClient, initialData);

  // 3. Dehydrate — merge into client QueryClient on hydration
  return <QueryHydration state={dehydrate(queryClient)}>{null}</QueryHydration>;
}
