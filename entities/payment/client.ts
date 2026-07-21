/**
 * @file entities/payment/client.ts
 * Client-side TanStack Query exports for payment read caches + write mutations.
 *
 * Purpose: Single import surface for `"use client"` payment modules.
 * Used in: views/payments/*, features/payments/*, payment drawer orchestrators
 * Used for: Browser fetchers, query hooks, mutations, and cache hub helpers.
 *
 * Import from here in `"use client"` modules — no server/repository code.
 */

export {
  fetchDeletePayment,
  fetchPatchPayment,
  fetchPaymentsMonth,
  fetchPostPayment,
  paymentsMonthQueryKey,
  paymentsMonthQueryOptions,
  paymentsQueryKeyPrefix,
  type PatchPaymentResponse,
  type PostPaymentResponse,
} from "@/entities/payment/client/index";
export {
  useCreatePaymentMutation,
  useDeletePaymentMutation,
  usePaymentsMonthQuery,
  usePaymentsRealtimeSync,
  useUpdatePaymentMutation,
  clearPaymentMutationPending,
  isPaymentMutationPending,
  markPaymentMutationPending,
  type CreatePaymentMutationInput,
  type DeletePaymentMutationInput,
  type RealtimePaymentChangePayload,
  type UpdatePaymentMutationInput,
  type UsePaymentsRealtimeSyncOptions,
} from "@/entities/payment/hooks";
export type { Payment } from "@/entities/payment/model/types";
export type { PaymentsMonthResponse } from "@/entities/payment/model/read-models";
export type {
  CreatePaymentBody,
  UpdatePaymentBody,
} from "@/entities/payment/schema";
export {
  applyRealtimePaymentChange,
  findPaymentInCache,
  synchronizePaymentCaches,
  type ApplyRealtimePaymentChangeResult,
  type PaymentChange,
  type RealtimePaymentChangeEvent,
} from "@/entities/payment/cache";
