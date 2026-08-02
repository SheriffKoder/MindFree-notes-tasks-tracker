# World Time (`widgets/world-time`)

Home-aside widget: globe map with city dots, local times (updates every minute), and a current-weather row (emoji + °C).

**Used in:** `views/home/ui/home-aside-content.tsx`

```tsx
import { WorldTime } from "@/widgets/world-time";

<WorldTime />
```

---

## Assets & env

| Concern | Value |
| ------- | ----- |
| Map image | `public/images/globe.webp` → served as `/images/globe.webp` |
| Weather API key | `WEATHER_API_KEY` (server-only; never `NEXT_PUBLIC_`) |
| Weather provider | [OpenWeatherMap Current Weather](https://openweathermap.org/api) |
| Example env | See `.env.example` |

Without `WEATHER_API_KEY`, the weather API route returns 500 and cells show `—`. Times and map still work.

---

## Cities

Edit `lib/cities.ts` (`WORLD_TIME_CITIES`):

| Field | Role |
| ----- | ---- |
| `label` / `code` | Accessibility name / 2-char grid label |
| `timeZone` | IANA id for `Intl` local time |
| `x` / `y` | Dot position as **%** of map width / height (calibrated on `globe.webp`) |
| `lat` / `lon` | Approx city center for OpenWeather |

Current cities: Los Angeles, New York, London, Cairo, Dubai, New Delhi, Sydney.

---

## Layout (UI)

1. **Map** — `/images/globe.webp` + absolute dots (`WorldTimeMap` / `WorldTimeMarker`)
2. **City times** — code + local time per column (`WorldTimeCityTimesGrid`)
3. **Weather** — emoji + whole °C under each city (`WorldTimeWeatherCell`)

GMT grid (`WorldTimeGmtGrid`) exists but is currently commented out in `ui/world-time.tsx`.

Clocks tick via `useMinuteClock` (once per minute). Weather refreshes every **30 minutes** (TanStack Query stale + refetch interval).

---

## Weather data flow

```text
WorldTimeCityTimesGrid
  → useWorldTimeWeather
  → GET /api/world-time/weather   (auth required)
  → getWorldTimeWeather
  → fetchOpenWeatherCurrent(lat, lon) per city  [WEATHER_API_KEY]
```

- Failed cities are skipped server-side; UI shows `—` for missing codes.
- Loading shows `…`.
- Key never leaves the server.

---

## Folder map

| Path | Responsibility |
| ---- | -------------- |
| `ui/world-time.tsx` | Widget shell |
| `ui/world-time-map.tsx` | Globe + marker list |
| `ui/world-time-marker.tsx` | Single map dot |
| `ui/world-time-gmt-grid.tsx` | GMT offset row (optional) |
| `ui/world-time-city-times-grid.tsx` | Times + weather rows |
| `ui/world-time-weather-cell.tsx` | One weather cell |
| `lib/cities.ts` | City list, map %, lat/lon |
| `lib/format-city-time.ts` | Local time string |
| `lib/format-gmt-offset.ts` | GMT offset string |
| `lib/format-weather-temp.ts` | `20°` display |
| `lib/weather-condition-emoji.ts` | Condition → emoji |
| `model/use-minute-clock.ts` | Minute-aligned `Date` |
| `model/use-world-time-weather.ts` | Weather query + `byCode` map |
| `model/city-weather.ts` | Shared weather types |
| `client/*` | Browser fetch + query options |
| `server/*` | OpenWeather fetch + batch |
| `index.ts` | Public barrel (`WorldTime`, cities) |

API route (outside this slice): `app/api/world-time/weather/route.ts`.
