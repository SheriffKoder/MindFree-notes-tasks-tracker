/**
 * @file entities/payment/lib/parse-month.ts
 * Month param parsing and date-range helpers for payment month queries.
 *
 * Purpose: Normalize URL month params and derive SQL date bounds.
 * Used in: entities/payment/queries/*, views/payments/model/use-payments-url-state.ts
 * Used for: Month navigation, repository filters, and default-to-current-month behavior.
 *
 * Function Index:
 * getCurrentMonth — local YYYY-MM for today
 * parseMonthParam — validate URL month or fall back
 * getMonthRange — inclusive start / exclusive end + calendar metadata
 */

const MONTH_PARAM_PATTERN = /^\d{4}-\d{2}$/;

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
 * Validates and normalizes a `month` search param.
 *
 * @param value - raw `month` param from the URL or API
 * @returns valid `YYYY-MM` month or the current month when invalid
 */
export function parseMonthParam(value: string | null | undefined): string {
  // 1. Guard — missing or malformed YYYY-MM → current month
  if (!value || !MONTH_PARAM_PATTERN.test(value)) {
    return getCurrentMonth();
  }

  const [, monthPart] = value.split("-");
  const monthNumber = Number(monthPart);

  // 2. Range — reject impossible month numbers
  if (monthNumber < 1 || monthNumber > 12) {
    return getCurrentMonth();
  }

  return value;
}

/**
 * Inclusive/exclusive date bounds for filtering payments by month.
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
