/**
 * @file features/notes/note-drawer/lib/month-of-iso-date.ts
 * Derives a `YYYY-MM` month key from an ISO date.
 */

/**
 * @param isoDate - `YYYY-MM-DD`
 * @returns month key (`YYYY-MM`)
 */
export function monthOfIsoDate(isoDate: string): string {
  return isoDate.slice(0, 7);
}
