/**
 * @file entities/profile/lib/build-export-workbook.test.ts
 * Ensures the export workbook exposes the expected sheet tabs.
 */

import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";

import { buildExportWorkbook } from "@/entities/profile/lib/build-export-workbook";

describe("buildExportWorkbook", () => {
  it("creates Notes, Tasks, Reminders, and Records sheets", () => {
    const buffer = buildExportWorkbook({
      notes: [],
      tasks: [],
      reminders: [],
      records: [],
    });

    const workbook = XLSX.read(buffer, { type: "buffer" });
    expect(workbook.SheetNames).toEqual([
      "Notes",
      "Tasks",
      "Reminders",
      "Records",
    ]);
  });
});
