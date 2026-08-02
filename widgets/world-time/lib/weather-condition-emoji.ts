/**
 * @file widgets/world-time/lib/weather-condition-emoji.ts
 * Maps OpenWeather condition names to display emojis.
 *
 * Purpose: Keep condition → glyph mapping pure and UI-agnostic.
 * Used in: weather cells under the World Time city grid.
 */

/**
 * OpenWeather `weather[0].main` values we care about (plus Atmosphere group).
 * See https://openweathermap.org/weather-conditions
 */
const CONDITION_EMOJI: Record<string, string> = {
  Clear: "☀️",
  Clouds: "☁️",
  Rain: "🌧️",
  Drizzle: "🌦️",
  Thunderstorm: "⛈️",
  Snow: "🌨️",
  Mist: "🌫️",
  Smoke: "🌫️",
  Haze: "🌫️",
  Dust: "🌫️",
  Fog: "🌫️",
  Sand: "🌫️",
  Ash: "🌫️",
  Squall: "💨",
  Tornado: "🌪️",
};

/** Fallback when the API returns an unknown `main` string. */
const FALLBACK_EMOJI = "🌡️";

/**
 * Resolve a weather-condition emoji for an OpenWeather `main` label.
 *
 * @param conditionMain - e.g. `"Clear"`, `"Clouds"`, `"Rain"`
 * @returns Single emoji glyph
 */
export function weatherConditionEmoji(conditionMain: string): string {
  return CONDITION_EMOJI[conditionMain] ?? FALLBACK_EMOJI;
}
