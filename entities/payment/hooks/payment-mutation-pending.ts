/**
 * @file entities/payment/hooks/payment-mutation-pending.ts
 * Tracks in-flight payment mutation ids so realtime can skip echo events.
 *
 * Purpose: Module-level pending-id registry for mutation vs realtime dedupe.
 * Used in: entities/payment/hooks/use-*-payment-mutation.ts, cache sync hub
 * Used for: Skipping Supabase realtime echoes while TanStack mutations settle.
 *
 * Function Index:
 * markPaymentMutationPending — register an in-flight payment id
 * clearPaymentMutationPending — clear after mutation settles
 * isPaymentMutationPending — gate for realtime apply paths
 */

const pendingPaymentIds = new Set<string>();

/**
 * Marks a payment id as having an in-flight TanStack mutation.
 */
export function markPaymentMutationPending(paymentId: string): void {
  pendingPaymentIds.add(paymentId);
}

/**
 * Clears the pending flag after a mutation settles.
 */
export function clearPaymentMutationPending(paymentId: string): void {
  pendingPaymentIds.delete(paymentId);
}

/**
 * @returns whether a mutation is currently in flight for the payment id.
 */
export function isPaymentMutationPending(paymentId: string): boolean {
  return pendingPaymentIds.has(paymentId);
}
