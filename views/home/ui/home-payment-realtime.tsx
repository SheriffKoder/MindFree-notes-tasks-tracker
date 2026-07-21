/**
 * @file views/home/ui/home-payment-realtime.tsx
 * Client island that mounts payment realtime sync once for the Home dashboard.
 *
 * Purpose: Keep payment month caches coherent across tabs while Home can write.
 * Used in: views/home/index.tsx
 * Used for: One subscription for Home quick-add (not inside notes section).
 *
 * Function Index:
 * - HomePaymentRealtime — subscribe → return null
 */

"use client";

import { usePaymentsRealtimeSync } from "@/entities/payment/client";

/**
 * Subscribes to mf_payments for the signed-in user while Home is open.
 * Renders nothing — cache patches drive payments list when that route opens.
 */
export function HomePaymentRealtime() {
  usePaymentsRealtimeSync();

  return null;
}
