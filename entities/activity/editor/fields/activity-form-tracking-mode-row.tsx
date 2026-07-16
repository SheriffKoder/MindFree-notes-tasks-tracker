/**
 * @file entities/activity/editor/fields/activity-form-tracking-mode-row.tsx
 * Native select for how completion is recorded.
 */

"use client";

import { Label } from "@/components/ui/label";
import type { TrackingMode } from "@/entities/activity/model/types";
import { FIELD_SELECT_CLASS } from "@/entities/activity/editor/lib/form-classes";
import { TRACKING_MODE_LABELS } from "@/entities/activity/editor/lib/form-labels";

const TRACKING_MODES = Object.keys(TRACKING_MODE_LABELS) as TrackingMode[];

export interface ActivityFormTrackingModeRowProps {
  trackingMode: TrackingMode;
  error?: string;
  onChange: (trackingMode: TrackingMode) => void;
}

/**
 * Styled native `<select>` for the four tracking modes.
 */
export function ActivityFormTrackingModeRow({
  trackingMode,
  error,
  onChange,
}: ActivityFormTrackingModeRowProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="activity-tracking-mode">Tracking</Label>
      <select
        aria-invalid={Boolean(error)}
        className={FIELD_SELECT_CLASS}
        id="activity-tracking-mode"
        name="trackingMode"
        value={trackingMode}
        onChange={(event) => onChange(event.target.value as TrackingMode)}
      >
        {TRACKING_MODES.map((mode) => (
          <option key={mode} value={mode}>
            {TRACKING_MODE_LABELS[mode]}
          </option>
        ))}
      </select>
      {error ? (
        <p className="text-caption [color:var(--color-error)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
