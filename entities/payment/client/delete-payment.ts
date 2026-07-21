/**
 * @file entities/payment/client/delete-payment.ts
 * Client fetcher for DELETE /api/payments/:id.
 */

/**
 * Deletes one payment row.
 *
 * @param id - payment row id
 */
export async function fetchDeletePayment(id: string): Promise<void> {
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
