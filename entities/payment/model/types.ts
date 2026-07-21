/**
 * @file entities/payment/model/types.ts
 * Domain and database-row types for payments.
 */

/**
 * Payment shape returned by the API and used across the Payments page.
 */
export interface Payment {
  /** Row id. */
  id: string;
  /** Display title. */
  title: string;
  /** Amount in major currency units (2 decimal places). */
  amount: number;
  /** Optional longer description. */
  description: string;
  /** Payment date (`YYYY-MM-DD`) — month filter + week grouping. */
  date: string;
  /** Free-form group id/label (UI options in shared/config/payment-groups). */
  group: string;
  /** Row creation timestamp (ISO). */
  createdAt: string;
  /** Last update timestamp (ISO) — within-week list order. */
  updatedAt: string;
}

/**
 * Supabase row shape for `mf_payments` before domain mapping.
 * `amount` may arrive as string from PostgREST numeric columns.
 * `group` is a reserved SQL word; PostgREST still exposes it as `group`.
 */
export interface PaymentRow {
  id: string;
  user_id: string;
  title: string;
  amount: string | number;
  description: string;
  date: string;
  group: string;
  created_at: string;
  updated_at: string;
}
