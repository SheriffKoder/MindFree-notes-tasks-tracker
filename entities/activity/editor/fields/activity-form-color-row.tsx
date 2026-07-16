/**
 * @file entities/activity/editor/fields/activity-form-color-row.tsx
 * Color preset swatches for task definitions.
 */

"use client";

import { Label } from "@/components/ui/label";
import { ACTIVITY_COLOR_PRESETS } from "@/entities/activity/editor/lib/form-labels";
import { cn } from "@/lib/utils";

export interface ActivityFormColorRowProps {
  color: string | null | undefined;
  error?: string;
  onChange: (color: string | null) => void;
}

/**
 * Preset color chips plus a clear control. Stores hex strings (or null).
 */
export function ActivityFormColorRow({
  color,
  error,
  onChange,
}: ActivityFormColorRowProps) {
  const selected = color ?? null;

  return (
    <div className="flex flex-col gap-2">
      <Label>Color</Label>
      <div className="flex flex-wrap items-center gap-2">
        {ACTIVITY_COLOR_PRESETS.map((preset) => {
          const isActive = selected === preset;

          return (
            <button
              key={preset}
              aria-label={`Color ${preset}`}
              aria-pressed={isActive}
              className={cn(
                "h-7 w-7 rounded-full border-2 transition-transform duration-150",
                isActive
                  ? "scale-110 border-[var(--color-fg)]"
                  : "border-transparent hover:scale-105",
              )}
              style={{ backgroundColor: preset }}
              type="button"
              onClick={() => onChange(preset)}
            />
          );
        })}

        <button
          className="text-caption [color:var(--color-fg-muted)] underline-offset-2 hover:underline"
          type="button"
          onClick={() => onChange(null)}
        >
          Clear
        </button>
      </div>
      {error ? (
        <p className="text-caption [color:var(--color-error)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
