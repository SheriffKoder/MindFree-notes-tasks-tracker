/**
 * @file widgets/world-time/ui/world-time-gmt-grid.tsx
 * GMT offset grid — one cell per city column.
 *
 * Purpose: Show each city’s live GMT/UTC offset under the map.
 * Used in: widgets/world-time/ui/world-time.tsx
 */

import { WORLD_TIME_CITIES } from "@/widgets/world-time/lib/cities";
import { formatGmtOffset } from "@/widgets/world-time/lib/format-gmt-offset";

/**
 * Props for {@link WorldTimeGmtGrid}.
 */
export interface WorldTimeGmtGridProps {
  /** Wall-clock instant used to resolve DST-aware offsets. */
  now: Date;
}

/**
 * Renders a single-row grid of GMT offset labels.
 *
 * @param props - current clock instant
 */
export function WorldTimeGmtGrid({ now }: WorldTimeGmtGridProps) {
  return (
    <table
      className="w-full table-fixed border-collapse text-center"
      aria-label="GMT offsets"
    >
      <tbody>
        <tr>
          {WORLD_TIME_CITIES.map(function renderGmtCell(city) {
            return (
              <td
                key={city.timeZone}
                className="border border-[var(--color-border)] px-0.5 py-1 text-caption font-medium [color:var(--color-fg-muted)]"
              >
                <span className="sr-only">{city.label} </span>
                <span suppressHydrationWarning>
                  {formatGmtOffset(now, city.timeZone)}
                </span>
              </td>
            );
          })}
        </tr>
      </tbody>
    </table>
  );
}
