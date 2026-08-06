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
    <footer className="absolute bottom-0 right-0 md:right-3 w-full md:w-[50%] z-10 flex items-center justify-end gap-2 px-3 min-h-[2rem] pointer-events-none">
      <div className="flex min-w-0 justify-end items-center pointer-events-auto">
        <PaymentFormLastSaved
          formattedLastEditedAt={formattedLastEditedAt}
          saveStatus={saveStatus}
        />
      </div>
    </footer>
  );
}
