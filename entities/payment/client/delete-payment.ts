/**
 * @file entities/payment/client/delete-payment.ts
 * Client fetcher for DELETE /api/payments/:id.
 *
 * Purpose: Browser DELETE for payment removal mutations.
 * Used in: entities/payment/hooks/use-delete-payment-mutation.ts
 * Used for: Hard-delete from the drawer with hub cache cleanup.
 *
 * Steps:
 * 1. DELETE /api/payments/:id with same-origin credentials.
 * 2. Parse error JSON or return void on 2xx.
 */

/**
 * Deletes one payment row.
 *
 * @param id - payment row id
 */
export async function fetchDeletePayment(id: string): Promise<void> {
  /////////////////////////////////
  // 1. Request — same-origin DELETE
  const response = await fetch(`/api/payments/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "same-origin",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Failed to delete payment.");
  }
}
