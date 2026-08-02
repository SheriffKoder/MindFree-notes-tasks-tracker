/**
 * @file widgets/world-time/ui/world-time-marker.tsx
 * Absolute city pin — map dot only.
 *
 * Purpose: Mark a city location on the World Time globe.
 * Used in: widgets/world-time/ui/world-time-map.tsx
 */

import type { WorldTimeCity } from "@/widgets/world-time/lib/cities";

/**
 * Props for {@link WorldTimeMarker}.
 */
export interface WorldTimeMarkerProps {
  city: WorldTimeCity;
}

/**
 * Renders a colored map dot fixed at the city’s calibrated `{x,y}`.
 *
 * @param props - city metadata with map coordinates
 */
export function WorldTimeMarker({ city }: WorldTimeMarkerProps) {
  return (
    <li
      aria-label={city.label}
      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${city.x}%`, top: `${city.y}%` }}
    >
      <span
        aria-hidden
        className="block h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]"
      />
    </li>
  );
}
