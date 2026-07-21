/**
 * @file features/payments/payment-drawer/ui/payment-drawer-footer.tsx
 * Thin drawer footer — last-saved / save-status only.
 *
 * Purpose: Footer slot wrapper for PaymentFormLastSaved in the drawer.
 * Used in: features/payments/payment-drawer/ui/payment-drawer.tsx
 * Used for: Anchoring save feedback below scrollable editor content.
 */

import { PaymentFormLastSaved } from "@/entities/payment/editor";
import type { PaymentSaveStatus } from "@/entities/payment/editor";

export interface PaymentDrawerFooterProps {
  formattedLastEditedAt: string | null;
  saveStatus?: PaymentSaveStatus;
}

/**
 * Compact footer row anchored below the scrollable editor content.
 */
export function PaymentDrawerFooter({
  formattedLastEditedAt,
  saveStatus = "idle",
}: PaymentDrawerFooterProps) {
  /////////////////////////////////
  // Footer — last-saved / save-status label
  return (
    <footer className="flex shrink-0 items-center justify-end gap-2 py-1">
      <PaymentFormLastSaved
        formattedLastEditedAt={formattedLastEditedAt}
        saveStatus={saveStatus}
      />
    </footer>
  );
}
