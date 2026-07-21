/**
 * @file entities/payment/editor/fields/payment-form-title-actions.tsx
 * Delete control for the payment title row.
 */

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface PaymentFormTitleActionsProps {
  /** Hard-delete the persisted payment. */
  onDelete?: () => void;
}

/**
 * Renders a delete icon button beside the title field.
 */
export function PaymentFormTitleActions({
  onDelete,
}: PaymentFormTitleActionsProps) {
  if (!onDelete) {
    return null;
  }

  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <Button
        aria-label="Delete payment"
        className="shrink-0 [color:var(--color-fg-muted)] hover:[color:var(--color-error)]"
        size="icon"
        title="Delete"
        type="button"
        variant="ghost"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
