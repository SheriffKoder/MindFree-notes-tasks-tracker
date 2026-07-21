/**
 * @file features/payments/payment-list-card/index.ts
 * Public exports for payment list card feature.
 *
 * Purpose: Feature barrel for month-list payment row UI.
 * Used in: views/payments/ui/payments-month-list.tsx
 * Used for: PaymentListCard and amount formatting helper.
 */

export {
  PaymentListCard,
  type PaymentListCardProps,
} from "@/features/payments/payment-list-card/ui/payment-list-card";
export { formatPaymentAmount } from "@/features/payments/payment-list-card/lib/format-payment-amount";
