/**
 * @file shared/config/payment-groups.ts
 * UI dropdown options for payment `group`. DB column is unconstrained text.
 */

/**
 * One selectable payment group for the editor dropdown.
 */
export interface PaymentGroupOption {
  /** Stable value stored on the payment row. */
  id: string;
  /** User-facing label shown in the dropdown. */
  label: string;
}

/**
 * Allowed payment groups for the UI. The database accepts any string;
 * keep this list as the product vocabulary for create/edit forms.
 */
export const PAYMENT_GROUP_OPTIONS: readonly PaymentGroupOption[] = [
  { id: "groceries", label: "Groceries" },
  { id: "home", label: "Home" },
  { id: "personal", label: "Personal" },
  { id: "investments", label: "Investments" },
  { id: "giving", label: "Giving" },
  { id: "extras", label: "Extras" },
] as const;

/** Union of configured group ids (UI vocabulary only). */
export type PaymentGroupId = (typeof PAYMENT_GROUP_OPTIONS)[number]["id"];
