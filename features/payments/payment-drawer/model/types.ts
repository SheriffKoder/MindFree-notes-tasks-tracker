/**
 * @file features/payments/payment-drawer/model/types.ts
 * Contracts for controlling the payment drawer.
 */

/** Editor intent supplied by the page that owns the drawer state. */
export type PaymentEditorRequest =
  | {
      mode: "edit";
      paymentId: string;
    }
  | {
      mode: "create";
    };

/**
 * Minimal controller consumed by PaymentDrawer.
 *
 * Keeping this contract in the feature prevents the reusable drawer from
 * depending on the Payments view (Home will also mount it).
 */
export interface PaymentDrawerController {
  isOpen: boolean;
  request: PaymentEditorRequest | null;
  openCreate: () => void;
  openEdit: (paymentId: string) => void;
  close: () => void;
  setOpen: (open: boolean) => void;
}
