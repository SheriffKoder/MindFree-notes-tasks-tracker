/**
 * @file entities/payment/hooks/index.ts
 * Segment barrel for payment React read hooks and write mutations.
 *
 * Purpose: Public exports for TanStack payment hooks and pending-id helpers.
 * Used in: entities/payment/client.ts, payment drawer orchestrators
 * Used for: Month reads, mutations, realtime sync, and realtime dedupe flags.
 */

export { usePaymentsMonthQuery } from "@/entities/payment/hooks/use-payments-month-query";
export { useCreatePaymentMutation } from "@/entities/payment/hooks/use-create-payment-mutation";
export type { CreatePaymentMutationInput } from "@/entities/payment/hooks/use-create-payment-mutation";
export { useUpdatePaymentMutation } from "@/entities/payment/hooks/use-update-payment-mutation";
export type { UpdatePaymentMutationInput } from "@/entities/payment/hooks/use-update-payment-mutation";
export { useDeletePaymentMutation } from "@/entities/payment/hooks/use-delete-payment-mutation";
export type { DeletePaymentMutationInput } from "@/entities/payment/hooks/use-delete-payment-mutation";
export {
  clearPaymentMutationPending,
  isPaymentMutationPending,
  markPaymentMutationPending,
} from "@/entities/payment/hooks/payment-mutation-pending";
export { usePaymentsRealtimeSync } from "@/entities/payment/hooks/use-payments-realtime-sync";
export type {
  RealtimePaymentChangePayload,
  UsePaymentsRealtimeSyncOptions,
} from "@/entities/payment/hooks/use-payments-realtime-sync";
