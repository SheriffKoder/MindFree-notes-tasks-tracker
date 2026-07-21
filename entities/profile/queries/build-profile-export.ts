/**
 * @file entities/profile/queries/build-profile-export.ts
 * Assembles auth-scoped notes + activities into a multi-sheet Excel workbook.
 *
 * V1 delivers one `.xlsx` download (tabs: Notes, Tasks, Reminders, Records).
 * Email delivery is deferred — see response `delivery` field.
 */

import { getActivities, getAllActivityRecords } from "@/entities/activity/repository";
import { getAllNotes } from "@/entities/note/repository";
import { buildExportWorkbook } from "@/entities/profile/lib/build-export-workbook";
import type { ProfileExportResult } from "@/entities/profile/model/export";
import { getPreferencesRow } from "@/entities/profile/repository";

export type { ProfileExportResult } from "@/entities/profile/model/export";

/**
 * Builds a multi-sheet Excel export for the authenticated user.
 *
 * @param userId - authenticated user id
 * @param fallbackEmail - auth email used when preferences row is missing email
 */
export async function buildProfileExport(
  userId: string,
  fallbackEmail: string,
): Promise<ProfileExportResult> {
  const [preferences, notes, tasks, reminders, records] = await Promise.all([
    getPreferencesRow(userId),
    getAllNotes(userId),
    getActivities(userId, "task"),
    getActivities(userId, "reminder"),
    getAllActivityRecords(userId),
  ]);

  const exportEmail = preferences?.exportEmail || fallbackEmail;
  const generatedAt = new Date().toISOString();
  const day = generatedAt.slice(0, 10);
  const filename = `mindfree-export-${day}.xlsx`;

  const workbook = buildExportWorkbook({
    notes,
    tasks,
    reminders,
    records,
  });

  const counts = {
    notes: notes.length,
    tasks: tasks.length,
    reminders: reminders.length,
    records: records.length,
  };

  console.info("[profile-export]", {
    userId,
    exportEmail,
    generatedAt,
    filename,
    counts,
    delivery: "download",
  });

  return {
    exportEmail,
    generatedAt,
    filename,
    workbookBase64: workbook.toString("base64"),
    counts,
    delivery: "download",
    message:
      "Export ready as Excel (.xlsx) with Notes, Tasks, Reminders, and Records sheets. Email delivery is not configured yet — the file downloads in the browser. Destination on file: " +
      exportEmail,
  };
}
