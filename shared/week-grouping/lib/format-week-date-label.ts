/**
 * @file shared/week-grouping/lib/format-week-date-label.ts
 * Display labels for week range headers (`DD-MM-'YY`).
 */

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);

  return new Date(year, month - 1, day);
}

/**
 * Formats an ISO date as `DD-MM-'YY` (e.g. `09-07-'26`).
 *
 * @param isoDate - `YYYY-MM-DD`
 * @returns short display label
 */
export function formatWeekDateLabel(isoDate: string): string {
  if (!ISO_DATE_PATTERN.test(isoDate)) {
    return isoDate;
  }

  const [year, month, day] = isoDate.split("-");

  return `${day}-${month}-'${year.slice(-2)}`;
}

/**
 * Formats an ISO date with weekday prefix (e.g. `Mon 09-07-'26`).
 *
 * @param isoDate - `YYYY-MM-DD`
 * @returns weekday + short date label
 */
export function formatWeekDateLabelWithWeekday(isoDate: string): string {
  if (!ISO_DATE_PATTERN.test(isoDate)) {
    return isoDate;
  }

  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
    parseIsoDate(isoDate),
  );

  return `${weekday} ${formatWeekDateLabel(isoDate)}`;
}

/**
 * Formats a week range for list section headers.
 *
 * @param rangeStart - inclusive ISO start date
 * @param rangeEnd - inclusive ISO end date
 * @returns e.g. `Mon 01-07-'26 to Sun 07-07-'26`
 */
export function formatWeekRangeLabel(rangeStart: string, rangeEnd: string): string {
  return `${formatWeekDateLabelWithWeekday(rangeStart)} to ${formatWeekDateLabelWithWeekday(rangeEnd)}`;
}
