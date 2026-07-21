/**
 * @file features/profile/theme-section/ui/accent-color-field.tsx
 * Accent color control — visible in every theme mode.
 */

"use client";

import { Label } from "@/components/ui/label";
import { ColorPicker } from "@/shared/color-picker";

export interface AccentColorFieldProps {
  value: string | null;
  disabled?: boolean;
  onChange: (color: string | null) => void;
}

/**
 * Accent ColorPicker with hint that null restores the mode default.
 */
export function AccentColorField({
  value,
  disabled = false,
  onChange,
}: AccentColorFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="profile-accent-color">Accent color</Label>
        <ColorPicker
          aria-label="Accent color"
          disabled={disabled}
          value={value}
          onChange={onChange}
        />
      </div>
      <p className="text-caption [color:var(--color-fg-muted)]">
        Applies in light, dark, and custom. Choose None to use the default
        accent for the active mode.
      </p>
    </div>
  );
}
