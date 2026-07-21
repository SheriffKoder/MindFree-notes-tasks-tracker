/**
 * @file entities/payment/cache/payment-cache-mutations.ts
 * Pure TanStack cache updaters for payment month lists.
 *
 * Purpose: Immutable list transforms used by the sync hub (no QueryClient I/O).
 * Used in: entities/payment/cache/synchronize-payment-caches.ts, mutation hooks.
 * Used for: Sort, upsert, remove, optimistic row build, and PATCH merge.
 *
 * Function Index:
 * - sortPaymentsByUpdatedAtDesc — list order matching the repository
 * - withPaymentsList — rebuild month payload (sorted + totalAmount)
 * - upsertPaymentInMonthCache — insert/replace when date belongs to month
 * - removePaymentFromMonthCache — strip by id + recompute total
 * - buildOptimisticPayment — client-temp row before server id
 * - mergePatchIntoPayment — optimistic PATCH merge
 */

import { monthKeyFromPaymentDate } from "@/entities/payment/lib/month-key-from-date";
import { sumAmounts } from "@/entities/payment/lib/sum-amounts";
import type { PaymentsMonthResponse } from "@/entities/payment/model/read-models";
import type { Payment } from "@/entities/payment/model/types";
import type { CreatePaymentBody } from "@/entities/payment/schema";
import type { UpdatePaymentBody } from "@/entities/payment/schema";

/////////////////////////////////////////////////////////////
// List rebuild helpers

/**
 * Sorts payments by `updatedAt` descending (matches repository order).
 */
export function sortPaymentsByUpdatedAtDesc(payments: Payment[]): Payment[] {
  return [...payments].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  );
}

/**
 * Rebuilds a month payload from a payments list (sorted + total).
 *
 * Steps:
 * 1. Sort by updatedAt desc.
 * 2. Sum amounts for the month total.
 * 3. Return month + payments + totalAmount.
 */
export function withPaymentsList(
  data: PaymentsMonthResponse,
  payments: Payment[],
): PaymentsMonthResponse {
  // 1. Stable list order for the UI
  const sorted = sortPaymentsByUpdatedAtDesc(payments);

  // 2–3. Keep month key; recompute total from the new list
  return {
    month: data.month,
    payments: sorted,
    totalAmount: sumAmounts(sorted.map((payment) => payment.amount)),
  };
}

/////////////////////////////////////////////////////////////
// Month-cache membership

/**
 * Inserts or replaces a payment in a month cache when it belongs to that month.
 *
 * Steps:
 * 1. Drop any existing row with the same id.
 * 2. If payment.date is outside this month — return list without it (moved away).
 * 3. Otherwise append and rebuild totals.
 */
export function upsertPaymentInMonthCache(
  data: PaymentsMonthResponse,
  payment: Payment,
): PaymentsMonthResponse {
  // 1. Remove prior copy (same id) before deciding membership
  const withoutExisting = data.payments.filter(
    (entry) => entry.id !== payment.id,
  );

  // 2. Date moved to another month — leave this month without the row
  if (monthKeyFromPaymentDate(payment.date) !== data.month) {
    return withPaymentsList(data, withoutExisting);
  }

  // 3. Belongs here — insert and recompute
  return withPaymentsList(data, [...withoutExisting, payment]);
}

/**
 * Removes a payment from a month cache by id and recomputes the total.
 */
export function removePaymentFromMonthCache(
  data: PaymentsMonthResponse,
  paymentId: string,
): PaymentsMonthResponse {
  return withPaymentsList(
    data,
    data.payments.filter((payment) => payment.id !== paymentId),
  );
}

/////////////////////////////////////////////////////////////
// Optimistic row helpers (mutation onMutate)

/**
 * Builds an optimistic payment before the server assigns an id.
 */
export function buildOptimisticPayment(input: CreatePaymentBody): Payment {
  const now = new Date().toISOString();

  return {
    id: `optimistic-payment-${now}`,
    title: input.title,
    amount: input.amount,
    description: input.description,
    date: input.date,
    group: input.group,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Merges a PATCH body into an existing payment for optimistic UI.
 *
 * Unspecified patch fields keep the previous payment values; bumps updatedAt.
 */
export function mergePatchIntoPayment(
  payment: Payment,
  patch: UpdatePaymentBody,
): Payment {
  return {
    id: payment.id,
    title: patch.title ?? payment.title,
    amount: patch.amount ?? payment.amount,
    description: patch.description ?? payment.description,
    date: patch.date ?? payment.date,
    group: patch.group ?? payment.group,
    createdAt: payment.createdAt,
    updatedAt: new Date().toISOString(),
  };
}
