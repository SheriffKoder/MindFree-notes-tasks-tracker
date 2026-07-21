/**
 * @file entities/payment/transform/index.ts
 * Public surface for payment pure data transforms.
 *
 * Purpose: Segment barrel for row → domain mapping.
 * Used in: entities/payment/repository/*
 * Used for: Normalizing Supabase rows before they leave the repository layer.
 */

export { mapPaymentRow } from "@/entities/payment/transform/map-payment-row";
