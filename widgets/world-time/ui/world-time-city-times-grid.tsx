/**
 * @file widgets/world-time/ui/world-time-city-times-grid.tsx
 * City local-time grid — one cell per city column.
 *
 * Purpose: Show each city’s code and live local time under the GMT grid.
 * Used in: widgets/world-time/ui/world-time.tsx
 */

import { WORLD_TIME_CITIES } from "@/widgets/world-time/lib/cities";
import { formatCityTime } from "@/widgets/world-time/lib/format-city-time";

/**
 * Props for {@link WorldTimeCityTimesGrid}.
 */
export interface WorldTimeCityTimesGridProps {
  /** Wall-clock instant used to format city local times. */
  now: Date;
}

/**
 * Renders a single-row grid of city codes with local times.
 *
 * @param props - current clock instant
 */
export function WorldTimeCityTimesGrid({ now }: WorldTimeCityTimesGridProps) {
  return (
    <table
      className="w-full table-fixed border-collapse text-center"
      aria-label="City local times "
    >
      <tbody>
        <tr>
          {WORLD_TIME_CITIES.map(function renderCityTimeCell(city) {
            return (
              <td
                key={city.timeZone}
                className="border-none border-[var(--color-border)] px-0.5 py-1.5"
              >
                <div className="flex min-w-0 flex-col items-center gap-0.5">
                  <span className="text-caption font-medium [color:var(--color-fg-muted)]">
                    {city.code}
                  </span>
                  <time
                    className="text-[10px] leading-tight tabular-nums [color:var(--color-fg-muted)]"
                    dateTime={now.toISOString()}
                    suppressHydrationWarning
                  >
                    {formatCityTime(now, city.timeZone)}
                  </time>
                </div>
              </td>
            );
          })}
        </tr>
      </tbody>
    </table>
  );
}
