/**
 * @file entities/payment/schema/index.ts
 * Public surface for payment write contracts (Zod).
 *
 * Purpose: Segment barrel for create/update request and response schemas.
 * Used in: entities/payment/mutations/*, entities/payment/server.ts
 * Used for: Validating API write bodies and typing mutation payloads.
 */

export {
  createPaymentBodySchema,
  createPaymentResponseSchema,
} from "@/entities/payment/schema/create-payment.schema";
export type {
  CreatePaymentBody,
  CreatePaymentResponse,
} from "@/entities/payment/schema/create-payment.schema";
export {
  updatePaymentBodySchema,
  updatePaymentResponseSchema,
} from "@/entities/payment/schema/update-payment.schema";
export type {
  UpdatePaymentBody,
  UpdatePaymentResponse,
} from "@/entities/payment/schema/update-payment.schema";
