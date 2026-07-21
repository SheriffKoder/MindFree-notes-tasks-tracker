/**
 * @file entities/payment/schema/create-payment.schema.ts
 * Zod contract for POST payment creation.
 *
 * Purpose: Validate POST /api/payments request bodies.
 * Used in: entities/payment/mutations/create-payment.ts, client create mutation
 * Used for: Server-side validation and typed create payloads in the drawer save path.
 */

import { z } from "zod";

import type { Payment } from "@/entities/payment/model/types";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Body for creating a payment row.
 */
export const createPaymentBodySchema = z.object({
  title: z.string(),
  amount: z.number().finite().min(0, "Amount must be zero or greater."),
  description: z.string().default(""),
  date: z.string().regex(ISO_DATE_PATTERN, "Date must be YYYY-MM-DD."),
  group: z.string().default(""),
});

export type CreatePaymentBody = z.infer<typeof createPaymentBodySchema>;

/** Successful create response shape. */
export const createPaymentResponseSchema = z.object({
  payment: z.custom<Payment>(),
});

export type CreatePaymentResponse = z.infer<typeof createPaymentResponseSchema>;
