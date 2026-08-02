/**
 * @file widgets/world-time/ui/world-time-weather-cell.tsx
 * Dumb weather cell — emoji + whole-degree temp (or placeholder).
 *
 * Purpose: Isolate weather column rendering from the city times grid.
 * Used in: widgets/world-time/ui/world-time-city-times-grid.tsx
 */

import { formatWeatherTemp } from "@/widgets/world-time/lib/format-weather-temp";
import { weatherConditionEmoji } from "@/widgets/world-time/lib/weather-condition-emoji";
import type { CityWeather } from "@/widgets/world-time/model/city-weather";

/**
 * Props for {@link WorldTimeWeatherCell}.
 */
export interface WorldTimeWeatherCellProps {
  /** Snapshot for this column, if loaded. */
  weather: CityWeather | undefined;
  /** Accessible city name. */
  cityLabel: string;
  /** True while the batch request is in flight. */
  isPending: boolean;
}

/**
 * Renders emoji + temp for one city column, or a loading/empty placeholder.
 *
 * @param props - weather snapshot and pending state for this column
 */
export function WorldTimeWeatherCell({
  weather,
  cityLabel,
  isPending,
}: WorldTimeWeatherCellProps) {
  if (!weather) {
    return (
      <span
        aria-hidden={!isPending}
        className="text-[10px] leading-tight tabular-nums [color:var(--color-fg-muted)]"
      >
        {isPending ? "…" : "—"}
      </span>
    );
  }

  const emoji = weatherConditionEmoji(weather.conditionMain);
  const temp = formatWeatherTemp(weather.tempC);

  return (
    <span
      aria-label={`${cityLabel} ${weather.conditionMain}, ${temp}`}
      className="flex items-center justify-center gap-0.5 text-[10px] leading-tight tabular-nums [color:var(--color-fg-muted)]"
      title={`${weather.conditionMain} ${temp}`}
    >
      <span
        aria-hidden
        className="brightness-125 grayscale opacity-60 invert dark:invert-0"
      >
        {emoji}
      </span>
      <span>{temp}</span>
    </span>
  );
}
