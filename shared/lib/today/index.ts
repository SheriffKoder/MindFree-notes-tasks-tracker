/**
 * @file shared/lib/today/index.ts
 * Pure local "today" — wall clock + live tab-focus refresh (no UI).
 *
 * | API | Use when |
 * | --- | -------- |
 * | `getTodayIsoDate()` | server, form defaults, one-shot |
 * | `useLocalTodayIsoDate()` | client wall-clock day (no demo override) |
 * | `useTodayIsoDate()` (`shared/demo-session`) | app today (demo fixed or live) |
 */

export { getTodayIsoDate } from "@/shared/lib/today/get-today-iso-date";
export { useLocalTodayIsoDate } from "@/shared/lib/today/use-local-today-iso-date";
export {
  getLiveTodayServerSnapshot,
  getLiveTodaySnapshot,
  refreshLiveTodayFromClock,
  subscribeLiveToday,
} from "@/shared/lib/today/live-today-store";
