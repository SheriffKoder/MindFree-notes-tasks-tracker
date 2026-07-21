/**
 * @file entities/profile/lib/to-csv.test.ts
 * Unit tests for CSV cell escaping.
 */

import { describe, expect, it } from "vitest";

import { escapeCsvCell, toCsv } from "@/entities/profile/lib/to-csv";

describe("escapeCsvCell", () => {
  it("returns empty string for nullish values", () => {
    expect(escapeCsvCell(null)).toBe("");
    expect(escapeCsvCell(undefined)).toBe("");
  });

  it("quotes values with commas or quotes", () => {
    expect(escapeCsvCell("a,b")).toBe('"a,b"');
    expect(escapeCsvCell('say "hi"')).toBe('"say ""hi"""');
  });
});

describe("toCsv", () => {
  it("includes a UTF-8 BOM and CRLF rows", () => {
    const csv = toCsv(["id", "title"], [[1, "hello"]]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain("id,title\r\n1,hello\r\n");
  });
});
