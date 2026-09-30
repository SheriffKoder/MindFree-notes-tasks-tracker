/**
 * @file widgets/world-time/model/use-world-time-scrub.ts
 * Client hook: lock a city and scrub a shared hour offset from live now.
 *
 * Purpose: Own scrub/lock state so all city clocks share one viewInstant.
 * Used in: widgets/world-time/ui/world-time.tsx
 */

"use client";

import { useState } from "react";

import type { WorldTimeCity } from "@/widgets/world-time/lib/cities";
import { floorToCityLocalHour } from "@/widgets/world-time/lib/floor-to-city-local-hour";
import { getCityLocalHour } from "@/widgets/world-time/lib/get-city-local-hour";
import { resolveViewInstant } from "@/widgets/world-time/lib/resolve-view-instant";

/** Clamp a slider hour into the inclusive 0–23 range. */
function clampHour(hour: number): number {
  return Math.min(23, Math.max(0, Math.trunc(hour)));
}

/**
 * Result of {@link useWorldTimeScrub}.
 */
export interface WorldTimeScrub {
  /** City whose zone labels the slider; `null` when live. */
  lockedCity: WorldTimeCity | null;
  /** Instant all city clocks should format. */
  viewInstant: Date;
  /** Local hour (0–23) of `viewInstant` in the locked zone; `0` when closed. */
  sliderHour: number;
  /** Lock `city` and reset offset to live time. */
  selectCity: (city: WorldTimeCity) => void;
  /** Scrub so the locked city’s local hour becomes `hour`. */
  setSliderHour: (hour: number) => void;
  /** Clear lock and return clocks to live `realNow`. */
  close: () => void;
}

/**
 * Derive a scrubbed view clock from live `realNow` plus an optional city lock.
 *
 * While locked, the view snaps to whole hours in the locked zone
 * (e.g. 10:33 → 10:00), then offsets by the slider.
 *
 * @param realNow - Live wall clock from {@link useMinuteClock}
 * @returns Lock state, shared view instant, and scrub actions
 */
export function useWorldTimeScrub(realNow: Date): WorldTimeScrub {
  const [lockedCity, setLockedCity] = useState<WorldTimeCity | null>(null);
  const [hourOffset, setHourOffset] = useState(0);

  const viewInstant =
    lockedCity === null
      ? realNow
      : resolveViewInstant(
          floorToCityLocalHour(realNow, lockedCity.timeZone),
          hourOffset,
        );

  const sliderHour =
    lockedCity === null
      ? 0
      : getCityLocalHour(viewInstant, lockedCity.timeZone);

  function selectCity(city: WorldTimeCity) {
    setLockedCity(city);
    setHourOffset(0);
  }

  function setSliderHour(hour: number) {
    if (lockedCity === null) {
      return;
    }

    const targetHour = clampHour(hour);
    const currentHour = getCityLocalHour(realNow, lockedCity.timeZone);
    setHourOffset(targetHour - currentHour);
  }

  function close() {
    setLockedCity(null);
    setHourOffset(0);
  }

  return {
    lockedCity,
    viewInstant,
    sliderHour,
    selectCity,
    setSliderHour,
    close,
  };
}
