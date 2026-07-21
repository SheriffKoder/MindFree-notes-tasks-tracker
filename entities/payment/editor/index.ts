/**
 * @file entities/payment/editor/index.ts
 * Payment editor form — schema, hook, and UI.
 *
 * Purpose: Public surface for the reusable payment editor island.
 * Used in: features/payments/payment-drawer/ui/payment-drawer.tsx
 * Used for: Form schema, hook, fields, and last-saved footer primitives.
 */

export { formatPaymentLastEditedAt } from "@/entities/payment/editor/lib/format-last-edited";
export {
  paymentFormSchema,
  type PaymentFormSchema,
} from "@/entities/payment/editor/model/payment-form.schema";
export type {
  PaymentFormChangeMeta,
  PaymentFormFieldErrors,
  PaymentFormFooterMeta,
  PaymentFormProps,
  PaymentFormValues,
  PaymentSaveStatus,
  UsePaymentFormOptions,
  UsePaymentFormResult,
} from "@/entities/payment/editor/model/types";
export { usePaymentForm } from "@/entities/payment/editor/model/use-payment-form";
export { PaymentForm } from "@/entities/payment/editor/ui/payment-form";
export { PaymentFormLastSaved } from "@/entities/payment/editor/ui/payment-form-last-saved";
