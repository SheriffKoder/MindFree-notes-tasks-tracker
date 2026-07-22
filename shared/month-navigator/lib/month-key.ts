/**
 * @file shared/month-navigator/lib/month-key.ts
 * Pure helpers for `YYYY-MM` month keys.
 */

const MONTH_KEY_PATTERN = /^\d{4}-\d{2}$/;

/**
 * Returns whether `value` is a valid `YYYY-MM` month key.
 *
 * @param value - raw month param from the URL
 */
export function isValidMonthKey(value: string | null | undefined): boolean {
  if (!value || !MONTH_KEY_PATTERN.test(value)) {
    return false;
  }

  const [, monthPart] = value.split("-");
  const monthNumber = Number(monthPart);

  return monthNumber >= 1 && monthNumber <= 12;
}

/**
 * Shifts a month key by one month forward or backward.
 *
 * @param month - `YYYY-MM` month key
 * @param delta - `-1` for previous month, `1` for next month
 * @returns shifted month key
 */
export function shiftMonth(month: string, delta: -1 | 1): string {
  if (!MONTH_KEY_PATTERN.test(month)) {
    throw new Error(`Invalid month key: ${month}`);
  }

  const [yearPart, monthPart] = month.split("-");
  let year = Number(yearPart);
  let monthNumber = Number(monthPart) + delta;

  if (monthNumber < 1) {
    monthNumber = 12;
    year -= 1;
  } else if (monthNumber > 12) {
    monthNumber = 1;
    year += 1;
  }

  return `${year}-${String(monthNumber).padStart(2, "0")}`;
}

/**
 * Formats a month key for display (e.g. `2026-07` → `July 2026`).
 *
 * @param month - `YYYY-MM` month key
 * @returns human-readable month label
 */
export function formatMonthLabel(month: string): string {
  const [yearPart, monthPart] = month.split("-");
  const year = Number(yearPart);
  const monthNumber = Number(monthPart);
  const date = new Date(year, monthNumber - 1, 1);

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}
