/**
 * @file entities/payment/schema/update-payment.schema.ts
 * Zod contract for PATCH payment updates.
 */

import { z } from "zod";

import type { Payment } from "@/entities/payment/model/types";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Partial PATCH body — any subset of editable payment fields.
 */
export const updatePaymentBodySchema = z.object({
  title: z.string().optional(),
  amount: z
    .number()
    .finite()
    .min(0, "Amount must be zero or greater.")
    .optional(),
  description: z.string().optional(),
  date: z
    .string()
    .regex(ISO_DATE_PATTERN, "Date must be YYYY-MM-DD.")
    .optional(),
  group: z.string().optional(),
});

export type UpdatePaymentBody = z.infer<typeof updatePaymentBodySchema>;

/** Successful PATCH response shape. */
export const updatePaymentResponseSchema = z.object({
  payment: z.custom<Payment>(),
});

export type UpdatePaymentResponse = z.infer<typeof updatePaymentResponseSchema>;
