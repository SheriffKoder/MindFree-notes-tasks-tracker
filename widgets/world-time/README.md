# World Time (`widgets/world-time`)

Home-aside widget: globe map with city dots, local times (updates every minute), hour scrub when a city is locked, hover/lock vertical guide, and a current-weather row (emoji + °C).

**Used in:** `views/home/ui/home-aside-content.tsx`

```tsx
import { WorldTime } from "@/widgets/world-time";

<WorldTime />
```

**Implementation plan:** `app/development/changelogs/time-clock/0-world-time-scrub-plan.md`

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
| `x` / `y` | Dot (and guide) position as **%** of map width / height (calibrated on `globe.webp`) |
| `lat` / `lon` | Approx city center for OpenWeather |

Current cities: Los Angeles, New York, London, Cairo, Dubai, New Delhi, Sydney.

---

## Layout (UI)

1. **City guide** — full-height vertical band at `city.x` while hovering or locked (`WorldTimeCityGuide`)
2. **Scrub slider** — appears when a city is locked (`WorldTimeScrubSlider`)
3. **Map** — `/images/globe.webp` + absolute dots (`WorldTimeMap` / `WorldTimeMarker`)
4. **City times** — code + local time per column (`WorldTimeCityTimesGrid`)
5. **Weather** — emoji + whole °C under each city (`WorldTimeWeatherCell`)

GMT grid (`WorldTimeGmtGrid`) exists but is currently commented out in `ui/world-time.tsx`.

Live clocks tick via `useMinuteClock` (once per minute). Weather refreshes every **30 minutes** (TanStack Query stale + refetch interval).

---

## Scrub / lock interaction

All city clocks share **one** `Date` (`viewInstant`). Zones only change how that instant is formatted.

| Action | Result |
| ------ | ------ |
| Click city code (e.g. `LA`) | Lock that city; open scrub slider; snap locked zone to whole hour (`10:33` → `10:00`) |
| Drag slider (0–23) | Shared `viewInstant` moves in whole hours; every city reformats that instant |
| Hover / focus city code | Vertical guide follows that city’s map `x` |
| Move between city codes | Guide follows without flashing back to locked (leave is row-scoped) |
| Leave the city-codes row | `hoveredCode` clears → guide returns to locked city (or hides) |
| Close (`×`) | Clear lock; slider hides; times return to live `useMinuteClock` |

Lock and hover are **in-memory only** (`useWorldTimeScrub` + shell `hoveredCode`). Nothing is persisted.

While locked, non-selected map markers use `saturate-0` / lower opacity; the locked marker stays full accent.

```text
useMinuteClock()
      │ realNow
      ▼
useWorldTimeScrub(realNow)
      │ lockedCity, hourOffset, viewInstant
      │ selectCity / setSliderHour / close
      ▼
WorldTime
  │ guideCity = hoveredCode ?? lockedCode
  ├── WorldTimeCityGuide
  ├── WorldTimeScrubSlider
  ├── WorldTimeMap(lockedCode) → muted markers
  └── WorldTimeCityTimesGrid(now={viewInstant}, …)
```

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
- Weather is **not** tied to scrubbed time (live conditions only).

---

## Folder map

| Path | Responsibility |
| ---- | -------------- |
| `ui/world-time.tsx` | Widget shell (clock + scrub + hover guide) |
| `ui/world-time-scrub-slider.tsx` | Hour scrub bar + sparse ticks |
| `ui/world-time-scrub-slider.css` | Thumb size + label inset alignment |
| `ui/world-time-city-guide.tsx` | Full-height vertical guide at `city.x` |
| `ui/world-time-map.tsx` | Globe + marker list (`lockedCode` mute) |
| `ui/world-time-marker.tsx` | Single map dot (`muted` state) |
| `ui/world-time-marker.css` | Halo pulse animation |
| `ui/world-time-gmt-grid.tsx` | GMT offset row (optional) |
| `ui/world-time-city-times-grid.tsx` | Times + weather + select/hover |
| `ui/world-time-weather-cell.tsx` | One weather cell |
| `lib/cities.ts` | City list, map %, lat/lon |
| `lib/format-city-time.ts` | Local time string |
| `lib/format-gmt-offset.ts` | GMT offset string |
| `lib/get-city-local-hour.ts` | Local hour 0–23 in a zone |
| `lib/floor-to-city-local-hour.ts` | Floor instant to local `:00` |
| `lib/resolve-view-instant.ts` | `realNow + hourOffset` |
| `lib/format-scrub-hour-label.ts` | Scrub tick / a11y hour labels |
| `lib/format-weather-temp.ts` | `20°` display |
| `lib/weather-condition-emoji.ts` | Condition → emoji |
| `model/use-minute-clock.ts` | Minute-aligned live `Date` |
| `model/use-world-time-scrub.ts` | Lock + hour offset + `viewInstant` |
| `model/use-world-time-weather.ts` | Weather query + `byCode` map |
| `model/city-weather.ts` | Shared weather types |
| `client/*` | Browser fetch + query options |
| `server/*` | OpenWeather fetch + batch |
| `index.ts` | Public barrel (`WorldTime`, cities) |

API route (outside this slice): `app/api/world-time/weather/route.ts`.
