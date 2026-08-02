/**
 * @file widgets/world-time/ui/world-time-city-times-grid.tsx
 * City local-time grid + weather row — one column per city.
 *
 * Purpose: Show each city’s code, live local time, and current weather.
 * Used in: widgets/world-time/ui/world-time.tsx
 */

"use client";

import { WORLD_TIME_CITIES } from "@/widgets/world-time/lib/cities";
import { formatCityTime } from "@/widgets/world-time/lib/format-city-time";
import { useWorldTimeWeather } from "@/widgets/world-time/model/use-world-time-weather";
import { WorldTimeWeatherCell } from "@/widgets/world-time/ui/world-time-weather-cell";

/**
 * Props for {@link WorldTimeCityTimesGrid}.
 */
export interface WorldTimeCityTimesGridProps {
  /** Wall-clock instant used to format city local times. */
  now: Date;
}

/**
 * Renders a two-row grid: city codes + local times, then weather.
 *
 * @param props - current clock instant
 */
export function WorldTimeCityTimesGrid({ now }: WorldTimeCityTimesGridProps) {
  const { byCode, isPending } = useWorldTimeWeather();

  return (
    <table
      className="w-full table-fixed border-collapse text-center"
      aria-label="City local times and weather"
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
        <tr>
          {WORLD_TIME_CITIES.map(function renderCityWeatherCell(city) {
            return (
              <td
                key={`weather-${city.timeZone}`}
                className="border-none border-[var(--color-border)] px-0.5 pb-1 pt-0"
              >
                <WorldTimeWeatherCell
                  cityLabel={city.label}
                  isPending={isPending}
                  weather={byCode.get(city.code)}
                />
              </td>
            );
          })}
        </tr>
      </tbody>
    </table>
  );
}
