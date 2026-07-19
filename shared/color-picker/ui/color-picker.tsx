/**
 * @file shared/color-picker/ui/color-picker.tsx
 * Preset swatches + free-text color input. Commits only valid CSS colors.
 *
 * Purpose: Pick a color via presets or typed value without persisting invalid
 * drafts. Invalid typing stays local until blur (then reverts) or a valid parse.
 * Used in: entities/activity/editor color row (and later home / elsewhere).
 */

"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DEFAULT_COLOR_PRESETS } from "@/shared/color-picker/lib/default-presets";
import { isCssColor } from "@/shared/color-picker/lib/is-css-color";
import { cn } from "@/lib/utils";

export interface ColorPickerProps {
  /** Committed color (CSS color string), or `null` when cleared. */
  value: string | null;
  onChange: (color: string | null) => void;
  /** Swatch list. Defaults to `DEFAULT_COLOR_PRESETS`. */
  presets?: readonly string[];
  /** When true (default), show a "None" clear option. */
  allowNull?: boolean;
  disabled?: boolean;
  /** Extra classes on the trigger button. */
  triggerClassName?: string;
  /** Extra classes on the menu content (e.g. drawer z-index). */
  contentClassName?: string;
  /** Accessible name for the trigger. */
  "aria-label"?: string;
}

/**
 * Dropdown color control: live swatch + `#`-prefixed draft input + presets.
 * Only calls `onChange` with values that pass `isCssColor` (or `null`).
 */
export function ColorPicker({
  value,
  onChange,
  presets = DEFAULT_COLOR_PRESETS,
  allowNull = true,
  disabled = false,
  triggerClassName,
  contentClassName,
  "aria-label": ariaLabel = "Pick color",
}: ColorPickerProps) {
  const inputId = useId();
  const [draft, setDraft] = useState(value ?? "");

  useEffect(() => {
    setDraft(value ?? "");
  }, [value]);

  const selected = value;
  const preview = isCssColor(draft) ? draft.trim() : selected;
  const draftLooksLikeHex = draft === "" || /^#?[0-9a-fA-F]*$/.test(draft);
  const inputDisplay = draft.startsWith("#") ? draft.slice(1) : draft;

  function handleDraftChange(next: string): void {
    setDraft(next);
    const trimmed = next.trim();
    if (trimmed && isCssColor(trimmed)) {
      onChange(trimmed);
    }
  }

  function handleDraftBlur(): void {
    const trimmed = draft.trim();
    if (!trimmed) {
      if (allowNull) {
        onChange(null);
        setDraft("");
      } else {
        setDraft(value ?? "");
      }
      return;
    }
    if (isCssColor(trimmed)) {
      onChange(trimmed);
      setDraft(trimmed);
      return;
    }
    setDraft(value ?? "");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={ariaLabel}
          className={cn(
            "h-8 max-w-[min(100%,14rem)] gap-1.5 px-2 text-sm font-normal [color:var(--color-fg-muted)] hover:[color:var(--color-fg)]",
            triggerClassName,
          )}
          disabled={disabled}
          size="sm"
          type="button"
          variant="ghost"
        >
          {selected ? (
            <span
              aria-hidden
              className="h-3.5 w-3.5 shrink-0 rounded-full border border-[var(--color-border)]"
              style={{ backgroundColor: selected }}
            />
          ) : (
            <span className="text-caption">None</span>
          )}
          <ChevronDown aria-hidden className="h-3.5 w-3.5 shrink-0 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn("min-w-[12rem] p-1", contentClassName)}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <div
          className="flex items-center gap-2 px-2 py-1.5"
          onKeyDown={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <span
            aria-hidden
            className="h-4 w-4 shrink-0 rounded-full border border-[var(--color-border)]"
            style={{
              backgroundColor: preview ?? "transparent",
            }}
          />
          {draftLooksLikeHex ? (
            <span
              aria-hidden
              className="font-mono text-caption [color:var(--color-fg-muted)]"
            >
              #
            </span>
          ) : null}
          <input
            aria-label="Color value"
            autoComplete="off"
            className="min-w-0 flex-1 border-0 bg-transparent font-mono text-caption outline-none placeholder:[color:var(--color-fg-hint)]"
            id={inputId}
            placeholder="ef4444"
            spellCheck={false}
            value={inputDisplay}
            onBlur={handleDraftBlur}
            onChange={(event) => {
              const raw = event.target.value;
              if (raw.length === 0) {
                handleDraftChange("");
                return;
              }
              // Hex digits get a leading `#`; named / functional colors pass through.
              const looksLikeHex = /^#?[0-9a-fA-F]*$/.test(raw);
              const next = looksLikeHex
                ? raw.startsWith("#")
                  ? raw
                  : `#${raw}`
                : raw;
              handleDraftChange(next);
            }}
          />
        </div>
        <DropdownMenuSeparator />
        {allowNull ? (
          <DropdownMenuItem
            className="gap-2"
            onSelect={() => {
              onChange(null);
              setDraft("");
            }}
          >
            <span className="flex h-3.5 w-3.5 items-center justify-center">
              {selected === null ? <Check className="h-3.5 w-3.5" /> : null}
            </span>
            None
          </DropdownMenuItem>
        ) : null}
        {presets.map((preset) => {
          const isActive = selected === preset;

          return (
            <DropdownMenuItem
              key={preset}
              className="gap-2"
              onSelect={() => {
                onChange(preset);
                setDraft(preset);
              }}
            >
              <span
                aria-hidden
                className="h-3.5 w-3.5 shrink-0 rounded-full border border-[var(--color-border)]"
                style={{ backgroundColor: preset }}
              />
              <span className="flex-1 font-mono text-caption">{preset}</span>
              {isActive ? <Check className="h-3.5 w-3.5 shrink-0" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
