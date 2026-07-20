/**
 * @file entities/profile/lib/to-csv.ts
 * Minimal CSV serialization for Excel-compatible profile exports.
 */

/**
 * Escapes one CSV cell (RFC-style quotes when needed).
 */
export function escapeCsvCell(value: string | number | boolean | null | undefined): string {
  if (value == null) {
    return "";
  }

  const raw = String(value);
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }

  return raw;
}

/**
 * Builds a CSV document from headers + row objects.
 *
 * @param headers - column keys / header labels (same order)
 * @param rows - values aligned to `headers`
 */
export function toCsv(
  headers: readonly string[],
  rows: ReadonlyArray<ReadonlyArray<string | number | boolean | null | undefined>>,
): string {
  const lines = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) => row.map(escapeCsvCell).join(",")),
  ];

  // BOM helps Excel detect UTF-8.
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}
