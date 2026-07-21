/**
 * @file entities/payment/hooks/payment-mutation-pending.ts
 * Tracks in-flight payment mutation ids so realtime can skip echo events.
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
