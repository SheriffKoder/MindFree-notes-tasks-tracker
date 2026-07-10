/**
 * @file shared/calendar/lib/today.ts
 * Local-time "today" helper for calendar grids.
 */

/**
 * Returns today's date as `YYYY-MM-DD` in local time.
 * Resolve once per grid render and pass `isToday` into cells — do not call per cell.
 *
 * @returns ISO calendar date for today
 */
export function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
