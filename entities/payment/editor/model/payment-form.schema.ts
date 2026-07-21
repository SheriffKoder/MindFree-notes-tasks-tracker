/**
 * @file entities/payment/editor/model/payment-form.schema.ts
 * Zod schema for the payment editor form.
 */

import { z } from "zod";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validates editable payment fields shown in the drawer editor.
 */
export const paymentFormSchema = z.object({
  title: z
    .string()
    .max(200, "Title must be 200 characters or fewer."),
  amount: z
    .number()
    .finite()
    .min(0, "Amount must be zero or greater."),
  description: z
    .string()
    .max(10_000, "Description must be 10,000 characters or fewer."),
  date: z.string().regex(ISO_DATE_PATTERN, "Date must be YYYY-MM-DD."),
  group: z.string().max(100, "Group must be 100 characters or fewer."),
});

/**
 * Parsed payment form values inferred from {@link paymentFormSchema}.
 */
export type PaymentFormSchema = z.infer<typeof paymentFormSchema>;
