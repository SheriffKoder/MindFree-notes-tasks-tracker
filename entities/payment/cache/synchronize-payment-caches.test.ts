/**
 * @file entities/payment/cache/synchronize-payment-caches.test.ts
 * Locks payment cache hub: create, same-month update, cross-month relocate, delete.
 */

import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it } from "vitest";

import { synchronizePaymentCaches } from "@/entities/payment/cache/synchronize-payment-caches";
import { paymentsMonthQueryKey } from "@/entities/payment/client/query-keys";
import type { PaymentsMonthResponse } from "@/entities/payment/model/read-models";
import type { Payment } from "@/entities/payment/model/types";

function buildPayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: "pay-1",
    title: "Rent",
    amount: 100,
    description: "",
    date: "2026-07-15",
    group: "home",
    createdAt: "2026-07-01T10:00:00.000Z",
    updatedAt: "2026-07-01T10:00:00.000Z",
    ...overrides,
  };
}

function emptyMonth(month: string): PaymentsMonthResponse {
  return { month, payments: [], totalAmount: 0 };
}

describe("synchronizePaymentCaches", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it("creates into a warm month cache and recomputes total", () => {
    queryClient.setQueryData(paymentsMonthQueryKey("2026-07"), emptyMonth("2026-07"));

    const payment = buildPayment({ amount: 25.5 });

    synchronizePaymentCaches(queryClient, { type: "create", payment });

    const month = queryClient.getQueryData<PaymentsMonthResponse>(
      paymentsMonthQueryKey("2026-07"),
    );

    expect(month?.payments).toHaveLength(1);
    expect(month?.totalAmount).toBe(25.5);
  });

  it("does not create into a cold month cache", () => {
    synchronizePaymentCaches(queryClient, {
      type: "create",
      payment: buildPayment(),
    });

    expect(
      queryClient.getQueryData(paymentsMonthQueryKey("2026-07")),
    ).toBeUndefined();
  });

  it("updates in place within the same month", () => {
    const previous = buildPayment();
    queryClient.setQueryData(paymentsMonthQueryKey("2026-07"), {
      month: "2026-07",
      payments: [previous],
      totalAmount: 100,
    });

    const next = buildPayment({
      title: "Rent updated",
      amount: 120,
      updatedAt: "2026-07-02T10:00:00.000Z",
    });

    synchronizePaymentCaches(queryClient, { type: "update", previous, next });

    const month = queryClient.getQueryData<PaymentsMonthResponse>(
      paymentsMonthQueryKey("2026-07"),
    );

    expect(month?.payments).toHaveLength(1);
    expect(month?.payments[0]?.title).toBe("Rent updated");
    expect(month?.totalAmount).toBe(120);
  });

  it("relocates across months when date changes", () => {
    const previous = buildPayment({ date: "2026-07-15" });
    const next = buildPayment({
      date: "2026-08-01",
      updatedAt: "2026-07-03T10:00:00.000Z",
    });

    queryClient.setQueryData(paymentsMonthQueryKey("2026-07"), {
      month: "2026-07",
      payments: [previous],
      totalAmount: 100,
    });
    queryClient.setQueryData(
      paymentsMonthQueryKey("2026-08"),
      emptyMonth("2026-08"),
    );

    synchronizePaymentCaches(queryClient, { type: "update", previous, next });

    const july = queryClient.getQueryData<PaymentsMonthResponse>(
      paymentsMonthQueryKey("2026-07"),
    );
    const august = queryClient.getQueryData<PaymentsMonthResponse>(
      paymentsMonthQueryKey("2026-08"),
    );

    expect(july?.payments).toHaveLength(0);
    expect(july?.totalAmount).toBe(0);
    expect(august?.payments).toHaveLength(1);
    expect(august?.payments[0]?.id).toBe("pay-1");
    expect(august?.totalAmount).toBe(100);
  });

  it("deletes from all warm month caches", () => {
    const payment = buildPayment();
    queryClient.setQueryData(paymentsMonthQueryKey("2026-07"), {
      month: "2026-07",
      payments: [payment],
      totalAmount: 100,
    });

    synchronizePaymentCaches(queryClient, { type: "delete", payment });

    const month = queryClient.getQueryData<PaymentsMonthResponse>(
      paymentsMonthQueryKey("2026-07"),
    );

    expect(month?.payments).toHaveLength(0);
    expect(month?.totalAmount).toBe(0);
  });
});
