/**
 * @file widgets/world-time/ui/world-time-city-times-grid.tsx
 * City local-time grid + weather row — one column per city.
 *
 * Purpose: Show each city’s code, live local time, and current weather.
 * Used in: widgets/world-time/ui/world-time.tsx
 */

"use client";

import {
  WORLD_TIME_CITIES,
  type WorldTimeCity,
} from "@/widgets/world-time/lib/cities";
import { formatCityTime } from "@/widgets/world-time/lib/format-city-time";
import { useWorldTimeWeather } from "@/widgets/world-time/model/use-world-time-weather";
import { WorldTimeWeatherCell } from "@/widgets/world-time/ui/world-time-weather-cell";

/**
 * Props for {@link WorldTimeCityTimesGrid}.
 */
export interface WorldTimeCityTimesGridProps {
  /** Wall-clock instant used to format city local times. */
  now: Date;
  /** Code of the city currently locked for scrubbing, if any. */
  lockedCode?: string;
  /** Fired when a city code is activated (parent owns lock state). */
  onSelectCity?: (city: WorldTimeCity) => void;
  /** Fired when pointer/focus enters a city code. */
  onHoverCity?: (city: WorldTimeCity) => void;
  /**
   * Fired when pointer/focus leaves the city-codes row (not each button),
   * so gaps between cities do not clear hover.
   */
  onLeaveCity?: () => void;
}

/**
 * Renders a two-row grid: city codes + local times, then weather.
 *
 * @param props - clock instant and optional scrub / hover props
 */
export function WorldTimeCityTimesGrid({
  now,
  lockedCode,
  onSelectCity,
  onHoverCity,
  onLeaveCity,
}: WorldTimeCityTimesGridProps) {
  const { byCode, isPending } = useWorldTimeWeather();

  return (
    <table
      className="relative z-[1] w-full table-fixed border-collapse text-center"
      aria-label="City local times and weather"
    >
      <tbody>
        <tr
          data-world-time-city-codes=""
          onMouseLeave={function handleCodesRowLeave() {
            onLeaveCity?.();
          }}
        >
          {WORLD_TIME_CITIES.map(function renderCityTimeCell(city) {
            const isLocked = lockedCode === city.code;

            return (
              <td
                key={city.timeZone}
                className="border-none border-[var(--color-border)] px-0.5 py-1.5"
              >
                <div className="flex min-w-0 flex-col items-center gap-0.5">
                  <button
                    type="button"
                    title={city.label}
                    aria-label={`Lock ${city.label} time`}
                    aria-pressed={isLocked}
                    className={
                      isLocked
                        ? "inline-flex size-6 items-center justify-center rounded text-caption font-semibold [background-color:var(--color-interactive-accent-surface)] [color:var(--color-accent)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                        : "inline-flex size-6 items-center justify-center rounded text-caption font-medium [color:var(--color-fg-muted)] transition-colors hover:[background-color:var(--color-interactive-accent-surface)] hover:[color:var(--color-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                    }
                    onClick={function handleSelectCity() {
                      onSelectCity?.(city);
                    }}
                    onMouseEnter={function handleMouseEnter() {
                      onHoverCity?.(city);
                    }}
                    onFocus={function handleFocus() {
                      onHoverCity?.(city);
                    }}
                    onBlur={function handleBlur(event) {
                      const codesRow = event.currentTarget.closest(
                        "[data-world-time-city-codes]",
                      );
                      if (
                        codesRow &&
                        event.relatedTarget instanceof Node &&
                        codesRow.contains(event.relatedTarget)
                      ) {
                        return;
                      }
                      onLeaveCity?.();
                    }}
                  >
                    {city.code}
                  </button>
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
