/**
 * @file entities/profile/model/export.ts
 * Client-safe types for profile data export responses.
 */

export interface ProfileExportResult {
  exportEmail: string;
  generatedAt: string;
  filename: string;
  /** Base64-encoded `.xlsx` workbook (Notes / Tasks / Reminders / Records sheets). */
  workbookBase64: string;
  counts: {
    notes: number;
    tasks: number;
    reminders: number;
    records: number;
  };
  /**
   * V1 always returns `download`. Switch to `email` when a mail provider is wired.
   * TODO(profile-export-email): send the workbook to `exportEmail` via Resend/SES/etc.
   */
  delivery: "download";
  message: string;
}
