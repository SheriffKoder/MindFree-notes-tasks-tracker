/**
 * @file entities/payment/editor/ui/payment-form-last-saved.tsx
 * Thin last-saved / save-status label for the payment drawer footer.
 *
 * Purpose: Render autosave feedback or last-edited timestamp in the footer slot.
 * Used in: features/payments/payment-drawer/ui/payment-drawer-footer.tsx
 * Used for: Transient saving/saved/error labels and idle last-edited text.
 */

import {
  SaveStatusLabel,
  getSaveStatusLabel,
} from "@/entities/editor/ui/save-status-label";
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

  return (
    <SaveStatusLabel
      label={label}
      saveStatus={saveStatus}
    />
  );
}
