/**
 * @file features/profile/theme-section/ui/theme-mode-picker.tsx
 * Three-way theme mode control: Light | Dark | Custom.
 */

"use client";

import { Moon, Palette, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ThemeMode } from "@/entities/profile/client";
import { cn } from "@/lib/utils";

const THEME_MODE_OPTIONS = [
  { value: "light" as const, label: "Light", Icon: Sun },
  { value: "dark" as const, label: "Dark", Icon: Moon },
  { value: "custom" as const, label: "Custom", Icon: Palette },
];

export interface ThemeModePickerProps {
  value: ThemeMode;
  disabled?: boolean;
  onChange: (mode: ThemeMode) => void;
}

/**
 * Segmented control for persisted theme mode.
 */
export function ThemeModePicker({
  value,
  disabled = false,
  onChange,
}: ThemeModePickerProps) {
  return (
    <div
      aria-label="Theme mode"
      className="flex flex-wrap gap-2"
      role="radiogroup"
    >
      {THEME_MODE_OPTIONS.map(function renderOption(option) {
        const selected = value === option.value;
        const Icon = option.Icon;

        return (
          <Button
            key={option.value}
            aria-checked={selected}
            className={cn(
              "gap-2",
              selected &&
                "[background-color:color-mix(in_srgb,var(--color-accent)_18%,transparent)] [color:var(--color-fg)]",
            )}
            disabled={disabled}
            role="radio"
            size="sm"
            type="button"
            variant="ghost"
            onClick={() => onChange(option.value)}
          >
            <Icon aria-hidden className="h-4 w-4 shrink-0" />
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
