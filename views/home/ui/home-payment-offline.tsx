/**
 * @file views/home/ui/home-payment-offline.tsx
 * Client island that mounts payment offline sync once for the Home dashboard.
 *
 * Purpose: Merge pending payment writes on load / cross-tab storage and flush
 *          on reconnect — so Home quick-add works offline.
 * Used in: views/home/index.tsx
 * Used for: Register createPaymentsOfflineSyncAdapter while Home is open.
 *
 * Function Index:
 * - HomePaymentOffline — adapter + useOfflineSync → return null
 *
 * Steps:
 * 1. Build payment offline adapter bound to the query client.
 * 2. Register with useOfflineSync for the signed-in user.
 */

"use client";

import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { createPaymentsOfflineSyncAdapter } from "@/entities/payment/offline";
import { useAuthUserId, useOfflineSync } from "@/shared/offline-queue";

/**
 * Registers the payment offline adapter while Home is open.
 * Renders nothing — cache patches drive `/payments` when that route opens.
 */
export function HomePaymentOffline() {
  /////////////////////////////////
  // 1. Adapter — payment entity ↔ shared offline queue
  const queryClient = useQueryClient();
  const userId = useAuthUserId();
  const paymentsOfflineAdapter = useMemo(
    () => createPaymentsOfflineSyncAdapter(queryClient),
    [queryClient],
  );

  /////////////////////////////////
  // 2. Sync — merge on load; flush on reconnect / focus
  useOfflineSync(userId, [paymentsOfflineAdapter]);

  return null;
}
