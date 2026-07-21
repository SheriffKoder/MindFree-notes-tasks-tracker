/**
 * @file features/profile/theme-section/ui/custom-theme-fields.tsx
 * Custom theme panel — bg, image URL, drawer color/opacity, text contrast.
 */

"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  ProfilePreferences,
  TextContrastMode,
} from "@/entities/profile/client";
import { isSafeImageUrl } from "@/features/profile/apply-theme";
import { ColorPicker } from "@/shared/color-picker";
import { cn } from "@/lib/utils";

export interface CustomThemeFieldsProps {
  preferences: ProfilePreferences;
  disabled?: boolean;
  onBackgroundColorChange: (color: string | null) => void;
  onBackgroundImageUrlChange: (url: string | null) => void;
  onDrawerBackgroundColorChange: (color: string | null) => void;
  onDrawerBackgroundOpacityChange: (opacity: number | null) => void;
  onTextContrastModeChange: (mode: TextContrastMode) => void;
}

/**
 * Fields shown only when `theme_mode === 'custom'`.
 */
export function CustomThemeFields({
  preferences,
  disabled = false,
  onBackgroundColorChange,
  onBackgroundImageUrlChange,
  onDrawerBackgroundColorChange,
  onDrawerBackgroundOpacityChange,
  onTextContrastModeChange,
}: CustomThemeFieldsProps) {
  const [imageDraft, setImageDraft] = useState(
    preferences.backgroundImageUrl ?? "",
  );
  const [imageError, setImageError] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);

  useEffect(() => {
    setImageDraft(preferences.backgroundImageUrl ?? "");
    setImageError(null);
    setPreviewFailed(false);
  }, [preferences.backgroundImageUrl]);

  const opacityPercent =
    preferences.drawerBackgroundOpacity == null
      ? 70
      : Math.round(preferences.drawerBackgroundOpacity * 100);

  const previewUrl =
    imageError == null && isSafeImageUrl(imageDraft) && imageDraft.trim()
      ? imageDraft.trim()
      : null;

  function commitImageUrl() {
    const trimmed = imageDraft.trim();
    if (!trimmed) {
      setImageError(null);
      onBackgroundImageUrlChange(null);
      return;
    }

    if (!isSafeImageUrl(trimmed)) {
      setImageError("Use an http(s) image URL.");
      return;
    }

    setImageError(null);
    onBackgroundImageUrlChange(trimmed);
  }

  return (
    <div className="flex max-w-md flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <Label>Background color</Label>
          <ColorPicker
            aria-label="Background color"
            disabled={disabled}
            value={preferences.backgroundColor}
            onChange={onBackgroundColorChange}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-background-image-url">Background image URL</Label>
        <Input
          disabled={disabled}
          id="profile-background-image-url"
          placeholder="https://…"
          value={imageDraft}
          onBlur={commitImageUrl}
          onChange={(event) => {
            setImageDraft(event.target.value);
            setImageError(null);
            setPreviewFailed(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitImageUrl();
            }
          }}
        />
        {imageError ? (
          <p className="text-caption [color:var(--color-error)]" role="alert">
            {imageError}
          </p>
        ) : (
          <p className="text-caption [color:var(--color-fg-muted)]">
            Optional. Invalid or failed URLs fall back to the solid background.
          </p>
        )}
        {previewUrl && !previewFailed ? (
          // eslint-disable-next-line @next/next/no-img-element -- user-supplied remote URL preview
          <img
            alt=""
            className="mt-1 h-24 w-full rounded-md border border-[var(--color-border)] object-cover"
            src={previewUrl}
            onError={() => setPreviewFailed(true)}
          />
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <Label>Drawer background</Label>
          <ColorPicker
            aria-label="Drawer background color"
            disabled={disabled}
            value={preferences.drawerBackgroundColor}
            onChange={onDrawerBackgroundColorChange}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="profile-drawer-opacity">Drawer opacity</Label>
          <div className="flex items-center gap-2">
            <span className="text-caption tabular-nums [color:var(--color-fg-muted)]">
              {preferences.drawerBackgroundOpacity == null
                ? "Default"
                : `${opacityPercent}%`}
            </span>
            <Button
              disabled={disabled || preferences.drawerBackgroundOpacity == null}
              size="sm"
              type="button"
              variant="ghost"
              onClick={() => onDrawerBackgroundOpacityChange(null)}
            >
              Reset
            </Button>
          </div>
        </div>
        <input
          aria-label="Drawer background opacity"
          className="w-full accent-[var(--color-accent)]"
          disabled={disabled}
          id="profile-drawer-opacity"
          max={100}
          min={0}
          step={5}
          type="range"
          value={opacityPercent}
          onChange={(event) => {
            const next = Number(event.target.value) / 100;
            onDrawerBackgroundOpacityChange(next);
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Text contrast</Label>
        <div className="flex flex-wrap gap-2" role="radiogroup">
          {(["dark", "light"] as const).map(function renderContrast(mode) {
            const selected = preferences.textContrastMode === mode;

            return (
              <Button
                key={mode}
                aria-checked={selected}
                className={cn(
                  "capitalize",
                  selected &&
                    "[background-color:color-mix(in_srgb,var(--color-accent)_18%,transparent)]",
                )}
                disabled={disabled}
                role="radio"
                size="sm"
                type="button"
                variant="ghost"
                onClick={() => onTextContrastModeChange(mode)}
              >
                {mode}
              </Button>
            );
          })}
        </div>
        <p className="text-caption [color:var(--color-fg-muted)]">
          Base light/dark tokens used under custom theme.
        </p>
      </div>
    </div>
  );
}
