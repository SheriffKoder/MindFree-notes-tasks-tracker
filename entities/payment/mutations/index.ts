/**
 * @file entities/payment/mutations/index.ts
 * Segment barrel for payment server write use-cases.
 *
 * Purpose: Public exports for validated payment write operations.
 * Used in: entities/payment/server.ts, app/api/payments/*
 * Used for: POST/PATCH/DELETE API route delegation.
 */

export { createPayment } from "@/entities/payment/mutations/create-payment";
export { updatePayment } from "@/entities/payment/mutations/update-payment";
export { deletePayment } from "@/entities/payment/mutations/delete-payment";
