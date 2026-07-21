/**
 * @file features/profile/export-section/model/use-export-data.ts
 * Export email preference + trigger Excel workbook download.
 */

"use client";

import { useEffect, useState } from "react";

import {
  fetchProfileExport,
  useUpdatePreferencesMutation,
  type ProfileExportResult,
} from "@/entities/profile/client";

function downloadBase64File(
  filename: string,
  base64: string,
  mimeType: string,
) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  const blob = new Blob([bytes], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/**
 * Owns export-email draft and export action (download `.xlsx`).
 *
 * @param savedExportEmail - last server/cache value
 */
export function useExportData(savedExportEmail: string) {
  const mutation = useUpdatePreferencesMutation();
  const [exportEmail, setExportEmail] = useState(savedExportEmail);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportResult, setExportResult] = useState<ProfileExportResult | null>(
    null,
  );
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setExportEmail(savedExportEmail);
  }, [savedExportEmail]);

  const isDirty = exportEmail.trim() !== savedExportEmail;

  function saveEmail() {
    const trimmed = exportEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setValidationError("Enter a valid email address.");
      return;
    }

    setValidationError(null);
    mutation.mutate({ exportEmail: trimmed });
  }

  async function runExport() {
    setExportError(null);
    setExportResult(null);
    setIsExporting(true);

    try {
      const result = await fetchProfileExport();
      setExportResult(result);
      downloadBase64File(
        result.filename,
        result.workbookBase64,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
    } catch (error) {
      setExportError(
        error instanceof Error ? error.message : "Failed to export data.",
      );
    } finally {
      setIsExporting(false);
    }
  }

  return {
    exportEmail,
    exportError,
    exportResult,
    isDirty,
    isExporting,
    isSaving: mutation.isPending,
    saveError:
      validationError ??
      (mutation.error instanceof Error ? mutation.error.message : null),
    saveSuccess: mutation.isSuccess && !isDirty && !mutation.isPending,
    setExportEmail,
    saveEmail,
    runExport,
  };
}
