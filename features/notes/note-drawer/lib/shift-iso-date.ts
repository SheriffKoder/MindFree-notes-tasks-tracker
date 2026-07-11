/**
 * @file features/notes/note-drawer/lib/shift-iso-date.ts
 * Pure ±1 day navigation on `YYYY-MM-DD` ISO dates.
 */

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Shifts an ISO date by one calendar day forward or backward.
 *
 * @param isoDate - `YYYY-MM-DD`
 * @param delta - `-1` for previous day, `1` for next day
 * @returns shifted ISO date
 */
export function shiftIsoDate(isoDate: string, delta: -1 | 1): string {
  if (!ISO_DATE_PATTERN.test(isoDate)) {
    throw new Error(`Invalid ISO date: ${isoDate}`);
  }

  const [yearPart, monthPart, dayPart] = isoDate.split("-");
  const date = new Date(
    Number(yearPart),
    Number(monthPart) - 1,
    Number(dayPart),
  );

  date.setDate(date.getDate() + delta);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
