/**
 * @file entities/payment/cache/payment-cache-mutations.ts
 * Pure TanStack cache updaters for payment month lists.
 */

import { monthKeyFromPaymentDate } from "@/entities/payment/lib/month-key-from-date";
import { sumAmounts } from "@/entities/payment/lib/sum-amounts";
import type { PaymentsMonthResponse } from "@/entities/payment/model/read-models";
import type { Payment } from "@/entities/payment/model/types";
import type { CreatePaymentBody } from "@/entities/payment/schema";
import type { UpdatePaymentBody } from "@/entities/payment/schema";

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
 */
export function withPaymentsList(
  data: PaymentsMonthResponse,
  payments: Payment[],
): PaymentsMonthResponse {
  const sorted = sortPaymentsByUpdatedAtDesc(payments);

  return {
    month: data.month,
    payments: sorted,
    totalAmount: sumAmounts(sorted.map((payment) => payment.amount)),
  };
}

/**
 * Inserts or replaces a payment in a month cache when it belongs to that month.
 */
export function upsertPaymentInMonthCache(
  data: PaymentsMonthResponse,
  payment: Payment,
): PaymentsMonthResponse {
  const withoutExisting = data.payments.filter(
    (entry) => entry.id !== payment.id,
  );

  if (monthKeyFromPaymentDate(payment.date) !== data.month) {
    return withPaymentsList(data, withoutExisting);
  }

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
