/**
 * @file entities/payment/hooks/index.ts
 * Segment barrel for payment React read hooks and write mutations.
 */

export { usePaymentsMonthQuery } from "@/entities/payment/hooks/use-payments-month-query";
export { useCreatePaymentMutation } from "@/entities/payment/hooks/use-create-payment-mutation";
export type { CreatePaymentMutationInput } from "@/entities/payment/hooks/use-create-payment-mutation";
export { useUpdatePaymentMutation } from "@/entities/payment/hooks/use-update-payment-mutation";
export type { UpdatePaymentMutationInput } from "@/entities/payment/hooks/use-update-payment-mutation";
export { useDeletePaymentMutation } from "@/entities/payment/hooks/use-delete-payment-mutation";
export type { DeletePaymentMutationInput } from "@/entities/payment/hooks/use-delete-payment-mutation";
