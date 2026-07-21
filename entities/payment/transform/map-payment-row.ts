/**
 * @file entities/payment/transform/map-payment-row.ts
 * Maps Supabase payment rows to domain `Payment` objects.
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
    amount: Number(row.amount),
    description: row.description,
    date: row.date,
    group: row.group,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
