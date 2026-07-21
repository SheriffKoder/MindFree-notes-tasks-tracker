/**
 * @file entities/profile/client/post-export.ts
 * Client fetcher for POST /api/profile/export.
 */

import type { ProfileExportResult } from "@/entities/profile/model/export";

/**
 * Requests a profile data export (CSV payloads for download).
 */
export async function fetchProfileExport(): Promise<ProfileExportResult> {
  const response = await fetch("/api/profile/export", {
    method: "POST",
    credentials: "same-origin",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Failed to export data.");
  }

  return response.json() as Promise<ProfileExportResult>;
}
