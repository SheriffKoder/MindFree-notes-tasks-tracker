/**
 * @file entities/payment/editor/fields/payment-form-group-row.tsx
 * Payment group as a DropdownMenu beside its label.
 *
 * Purpose: Group picker wired to shared payment-groups config.
 * Used in: entities/payment/editor/ui/payment-form.tsx
 * Used for: Optional category selection stored on payment.group.
 */

"use client";

import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PaymentFormFieldRow } from "@/entities/payment/editor/fields/payment-form-field-row";
import {
  FIELD_MENU_CONTENT_CLASS,
  FIELD_MENU_TRIGGER_CLASS,
} from "@/entities/payment/editor/lib/form-classes";
import { cn } from "@/lib/utils";
import { PAYMENT_GROUP_OPTIONS } from "@/shared/config/payment-groups";

/** Radio value for unset group — DropdownMenuRadioGroup needs a string. */
const NONE_VALUE = "none";

export interface PaymentFormGroupRowProps {
  group: string;
  error?: string;
  onChange: (group: string) => void;
}

/**
 * Optional group from the shared payment-groups config; empty stores "".
 */
export function PaymentFormGroupRow({
  group,
  error,
  onChange,
}: PaymentFormGroupRowProps) {
  const matched = PAYMENT_GROUP_OPTIONS.find((option) => option.id === group);
  const radioValue = group === "" ? NONE_VALUE : group;
  const label = matched?.label ?? (group === "" ? "None" : group);

  /////////////////////////////////
  // Group menu — radio list with explicit None option
  return (
    <PaymentFormFieldRow error={error} label="Group">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Payment group"
            className={FIELD_MENU_TRIGGER_CLASS}
            size="sm"
            type="button"
            variant="ghost"
          >
            <span className="truncate">{label}</span>
            <ChevronDown aria-hidden className="h-3.5 w-3.5 shrink-0 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className={cn(FIELD_MENU_CONTENT_CLASS, "min-w-[10rem]")}
        >
          <DropdownMenuRadioGroup
            value={radioValue}
            onValueChange={(value) => {
              onChange(value === NONE_VALUE ? "" : value);
            }}
          >
            <DropdownMenuRadioItem value={NONE_VALUE}>None</DropdownMenuRadioItem>
            {PAYMENT_GROUP_OPTIONS.map((option) => (
              <DropdownMenuRadioItem key={option.id} value={option.id}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </PaymentFormFieldRow>
  );
}
