/**
 * @file entities/note/lib/parse-month.ts
 * Month param parsing and calendar range helpers.
 */

import { getDemoDefaultMonth } from "@/shared/lib/auth/demo-login-config";

const MONTH_PARAM_PATTERN = /^\d{4}-\d{2}$/;

/**
 * Options for {@link parseMonthParam} fallback resolution.
 */
export interface ParseMonthParamOptions {
  /** When true, prefer the demo default month over local today. */
  isDemoUser?: boolean;
  /**
   * Client-provided demo month from layout context. Server callers may omit —
   * env is read via {@link getDemoDefaultMonth}.
   */
  demoDefaultMonth?: string | null;
}

/**
 * Returns the current month as `YYYY-MM` in local time.
 *
 * @returns current month key
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

/**
 * Resolves the default month when `?month=` is missing or invalid.
 */
function resolveDefaultMonthKey(options: ParseMonthParamOptions = {}): string {
  if (options.isDemoUser) {
    const demoMonth = options.demoDefaultMonth ?? getDemoDefaultMonth();

    if (demoMonth) {
      return demoMonth;
    }
  }

  return getCurrentMonth();
}

/**
 * Validates and normalizes a `month` search param.
 *
 * @param value - raw `month` param from the URL or API
 * @param options - optional demo-session flags for fallback resolution
 * @returns valid `YYYY-MM` month or the resolved default when invalid
 */
export function parseMonthParam(
  value: string | null | undefined,
  options: ParseMonthParamOptions = {},
): string {
  if (!value || !MONTH_PARAM_PATTERN.test(value)) {
    return resolveDefaultMonthKey(options);
  }

  const [, monthPart] = value.split("-");
  const monthNumber = Number(monthPart);

  if (monthNumber < 1 || monthNumber > 12) {
    return resolveDefaultMonthKey(options);
  }

  return value;
}

/**
 * Inclusive/exclusive date bounds for filtering calendar notes by month.
 */
export interface MonthRange {
  /** First day of the month (`YYYY-MM-01`). */
  monthStart: string;
  /** First day of the next month (exclusive upper bound). */
  monthEnd: string;
  /** Four-digit year. */
  year: number;
  /** Month number (1–12). */
  monthNumber: number;
  /** Number of days in the month (28–31). */
  daysInMonth: number;
}

/**
 * Derives SQL date bounds and calendar metadata for a month key.
 *
 * @param month - `YYYY-MM` month key
 * @returns month range metadata
 */
export function getMonthRange(month: string): MonthRange {
  const [yearPart, monthPart] = month.split("-");
  const year = Number(yearPart);
  const monthNumber = Number(monthPart);
  const monthStart = `${month}-01`;

  const nextYear = monthNumber === 12 ? year + 1 : year;
  const nextMonth = monthNumber === 12 ? 1 : monthNumber + 1;
  const monthEnd = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
  const daysInMonth = new Date(year, monthNumber, 0).getDate();

  return {
    monthStart,
    monthEnd,
    year,
    monthNumber,
    daysInMonth,
  };
}
