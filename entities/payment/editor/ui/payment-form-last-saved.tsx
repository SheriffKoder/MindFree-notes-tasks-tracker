/**
 * @file entities/payment/editor/ui/payment-form-last-saved.tsx
 * Thin last-saved / save-status label for the payment drawer footer.
 *
 * Purpose: Render autosave feedback or last-edited timestamp in the footer slot.
 * Used in: features/payments/payment-drawer/ui/payment-drawer-footer.tsx
 * Used for: Transient saving/saved/error labels and idle last-edited text.
 */

import { cn } from "@/lib/utils";
import { getSaveStatusLabel } from "@/entities/payment/editor/lib/form-classes";
import type { PaymentSaveStatus } from "@/entities/payment/editor/model/types";

export interface PaymentFormLastSavedProps {
  formattedLastEditedAt: string | null;
  saveStatus?: PaymentSaveStatus;
}

/**
 * Shows transient save feedback or the last-edited timestamp.
 */
export function PaymentFormLastSaved({
  formattedLastEditedAt,
  saveStatus = "idle",
}: PaymentFormLastSavedProps) {
  const saveStatusLabel = getSaveStatusLabel(saveStatus);
  const label = saveStatusLabel ?? formattedLastEditedAt ?? "New payment";

  /////////////////////////////////
  // Status label — transient save feedback overrides last-edited text
  return (
    <p
      className={cn(
        "shrink-0 text-right text-[11px] leading-none opacity-60",
        saveStatus === "error"
          ? "[color:var(--color-error)] opacity-100"
          : saveStatus === "saved"
            ? "[color:var(--color-success)] opacity-100"
            : "text-body-muted",
      )}
      role={saveStatusLabel ? "status" : undefined}
    >
      {label}
    </p>
  );
}
