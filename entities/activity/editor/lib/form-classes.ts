/**
 * @file entities/activity/editor/lib/form-classes.ts
 * Shared class tokens for the activity config form.
 */

export const PLAIN_TITLE_CLASS =
  "min-w-0 flex-1 border-0 bg-transparent p-0 text-lg font-medium leading-tight [color:var(--color-fg)] placeholder:[color:var(--color-fg-hint)] focus:outline-none focus:ring-0";

export const PLAIN_DESCRIPTION_CLASS =
  "min-h-[4.5rem] w-full resize-y border-0 bg-transparent p-0 text-base leading-normal [color:var(--color-fg)] placeholder:[color:var(--color-fg-hint)] focus:outline-none focus:ring-0";

export const FIELD_SELECT_CLASS =
  "flex h-9 w-full rounded-md border border-[var(--color-border)] [background-color:color-mix(in_srgb,var(--color-surface)_94%,transparent)] px-3 text-sm [color:var(--color-fg)] shadow-sm transition-[color,border-color,box-shadow,background-color] hover:border-[color-mix(in_srgb,var(--color-fg-muted)_20%,var(--color-border))] focus-visible:outline-none focus-visible:[box-shadow:0_0_0_1px_color-mix(in_srgb,var(--color-accent)_60%,transparent)] disabled:cursor-not-allowed disabled:opacity-50";

export const CHIP_CLASS =
  "inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-caption font-medium transition-colors duration-150";

export const CHIP_INACTIVE_CLASS =
  "border-[var(--color-border)] [background-color:color-mix(in_srgb,var(--color-surface)_94%,transparent)] [color:var(--color-fg-muted)] hover:border-[color-mix(in_srgb,var(--color-accent)_35%,var(--color-border))] hover:[color:var(--color-accent)]";

export const CHIP_ACTIVE_CLASS =
  "border-[color-mix(in_srgb,var(--color-accent)_45%,var(--color-border))] [background-color:var(--color-interactive-accent-surface)] [color:var(--color-accent)]";
