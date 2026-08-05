/**
 * @file widgets/world-time/ui/world-time-marker.tsx
 * Absolute city pin — map dot only.
 *
 * Purpose: Mark a city location on the World Time globe.
 * Used in: widgets/world-time/ui/world-time-map.tsx
 */

import type { WorldTimeCity } from "@/widgets/world-time/lib/cities";

import "./world-time-marker.css";

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
      className="world-time-marker pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${city.x}%`, top: `${city.y}%` }}
    >
      <span aria-hidden className="relative block h-1.5 w-1.5">
        {/* Soft halo — pulse scale + opacity; translate lives on the wrapper. */}
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="world-time-marker-halo block size-3.5 rounded-full bg-[radial-gradient(circle,var(--color-accent)_0%,transparent_70%)]" />
        </span>
        <span className="relative block size-full rounded-full bg-[var(--color-accent)]" />
      </span>
    </li>
  );
}
