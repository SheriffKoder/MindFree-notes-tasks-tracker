/**
 * @file shared/lib/today/get-today-iso-date.ts
 * Pure local-time "today" helper (`YYYY-MM-DD`).
 *
 * Contract (see barrel `index.ts`):
 * - `getTodayIsoDate()` — one-shot / server / form defaults (no React).
 * - `useLocalTodayIsoDate()` — client wall-clock day that rolls on tab focus.
 * - `useTodayIsoDate()` (`shared/demo-session`) — app "today" (demo override or live).
 */

/**
 * Returns today's date as `YYYY-MM-DD` in local time.
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
