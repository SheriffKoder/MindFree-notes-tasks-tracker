/**
 * @file views/payments/ui/payments-add-button.tsx
 * Icon-only control that opens the payment editor drawer for a new payment.
 *
 * Purpose: Compact "+" affordance beside the month navigator.
 * Used in: views/payments/ui/payments-client.tsx
 * Used for: Opening the drawer in create mode for a new payment draft.
 */

"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PaymentsAddButtonProps {
  /** Opens the drawer in create mode. */
  onClick: () => void;
  className?: string;
}

/**
 * Renders a compact "+" button beside the month navigator.
 * Chrome matches Notes add button — bordered surface pill, ghost icon.
 */
export function PaymentsAddButton({
  onClick,
  className,
}: PaymentsAddButtonProps) {
  /////////////////////////////////
  // Add control — bordered pill matching Notes add button chrome
  return (
    <div
      className={cn(
        "flex shrink-0 items-center rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_88%,transparent)] p-2 shadow-sm",
        className,
      )}
    >
      <Button
        aria-label="Add payment"
        className="shrink-0"
        size="icon"
        title="Add payment"
        type="button"
        variant="ghost"
        onClick={onClick}
      >
        <Plus aria-hidden className="h-4 w-4 [color:var(--color-fg-muted)]" />
      </Button>
    </div>
  );
}
