/**
 * @file entities/payment/transform/map-payment-row.ts
 * Maps Supabase payment rows to domain `Payment` objects.
 *
 * Purpose: Pure row → domain mapping at repository and realtime boundaries.
 * Used in: entities/payment/repository/*, cache sync helpers
 * Used for: Normalizing PostgREST numeric `amount` and snake_case timestamps.
 */

import type { Payment, PaymentRow } from "@/entities/payment/model/types";

/**
 * Maps a Supabase payment row to the domain `Payment` type.
 *
 * @param row - raw database row
 * @returns domain payment
 */
export function mapPaymentRow(row: PaymentRow): Payment {
  return {
    id: row.id,
    title: row.title,
    // PostgREST numeric may arrive as string — coerce to number
    amount: Number(row.amount),
    description: row.description,
    date: row.date,
    group: row.group,
    // snake_case timestamps → camelCase domain fields
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
