/**
 * @file shared/calendar/lib/resolve-calendar-date-under-point.ts
 * Resolve the calendar day under a viewport point via `data-calendar-date`.
 */

/**
 * Finds the nearest `[data-calendar-date]` under `(x, y)`, if any.
 *
 * Used when leaving the tip to decide whether to follow another day or close.
 */
export function resolveCalendarDateUnderPoint(
  x: number,
  y: number,
): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const el = document.elementFromPoint(x, y);

  if (!el || !(el instanceof Element)) {
    return null;
  }

  const cell = el.closest("[data-calendar-date]");

  if (!(cell instanceof HTMLElement)) {
    return null;
  }

  return cell.dataset.calendarDate ?? null;
}
