/**
 * @file entities/payment/editor/lib/form-classes.ts
 * Shared class tokens for the payment editor form.
 *
 * Purpose: Central Tailwind class tokens and save-status label helper.
 * Used in: entities/payment/editor/fields/*, payment-form-last-saved.tsx
 * Used for: Consistent editor typography, menu z-index, and footer save labels.
 */

import type { PaymentSaveStatus } from "@/entities/payment/editor/model/types";

export const PLAIN_TITLE_CLASS =
  "min-w-0 flex-1 border-0 bg-transparent p-0 text-h2 placeholder:[color:var(--color-fg-hint)] focus:outline-none focus:ring-0";

export const PLAIN_DESCRIPTION_CLASS =
  "min-h-[3rem] w-full resize-y rounded border-[var(--color-border)] [background-color:color-mix(in_srgb,var(--color-surface)_60%,transparent)] px-3 py-2 text-caption leading-normal [color:var(--color-fg-muted)] placeholder:[color:var(--color-fg-hint)] focus:outline-none focus-visible:[box-shadow:0_0_0_1px_color-mix(in_srgb,var(--color-accent)_40%,transparent)]";

/** Label beside a right-aligned control. */
export const FIELD_LABEL_CLASS = "shrink-0 text-sm [color:var(--color-fg)]";

/** Ghost trigger for DropdownMenu selects (value + chevron). */
export const FIELD_MENU_TRIGGER_CLASS =
  "h-8 max-w-[min(100%,14rem)] gap-1.5 px-2 text-sm font-normal [color:var(--color-fg-muted)] hover:[color:var(--color-fg)]";

/**
 * DropdownMenuContent must sit above AppDrawer (`z-[60]`). Default menu chrome
 * is `z-50`, which portals behind the drawer and looks like a no-op open.
 */
export const FIELD_MENU_CONTENT_CLASS = "z-[70]";

/** Right-aligned numeric amount input. */
export const AMOUNT_INPUT_CLASS =
  "h-8 w-[7.5rem] rounded border-0 bg-transparent px-2 text-right text-sm tabular-nums [color:var(--color-fg)] placeholder:[color:var(--color-fg-hint)] focus:outline-none focus-visible:[box-shadow:0_0_0_1px_color-mix(in_srgb,var(--color-accent)_40%,transparent)]";

/**
 * Transient save feedback label for the footer last-saved slot.
 */
export function getSaveStatusLabel(status: PaymentSaveStatus): string | null {
  switch (status) {
    case "saving":
      return "Saving…";
    case "saved":
      return "Saved";
    case "error":
      return "Could not save";
    default:
      return null;
  }
}
