/**
 * @file entities/payment/repository/index.ts
 * Public surface for the Payment repository (Supabase data access, RLS-scoped).
 *
 * Purpose: Segment barrel for owner-scoped payment data access.
 * Used in: entities/payment/mutations/*, entities/payment/queries/*
 * Used for: Server-only Supabase reads/writes without leaking into client bundles.
 */

export { getAuthenticatedUserId } from "@/entities/payment/repository/get-authenticated-user-id";
export { getPaymentsForMonth } from "@/entities/payment/repository/get-payments-for-month";
export { createPayment } from "@/entities/payment/repository/create-payment";
export { updatePaymentById } from "@/entities/payment/repository/update-payment";
export { deletePaymentById } from "@/entities/payment/repository/delete-payment";
