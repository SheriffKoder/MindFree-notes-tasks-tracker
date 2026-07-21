/**
 * @file entities/payment/editor/fields/payment-form-date-row.tsx
 * Payment date picker — DropdownMenu with calendar content.
 *
 * Purpose: ISO date selection for payment.date in the editor form.
 * Used in: entities/payment/editor/ui/payment-form.tsx
 * Used for: Picking the payment day that drives month list placement.
 */

"use client";

import { Calendar, ChevronDown } from "lucide-react";
import { useCallback, useState } from "react";

import DateSelectorSimple from "@/components/calendar/calendar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PaymentFormFieldRow } from "@/entities/payment/editor/fields/payment-form-field-row";
import {
  FIELD_MENU_CONTENT_CLASS,
  FIELD_MENU_TRIGGER_CLASS,
} from "@/entities/payment/editor/lib/form-classes";
import { cn } from "@/lib/utils";
import { getTodayIsoDate } from "@/shared/calendar";

export interface PaymentFormDateRowProps {
  /** Selected day as `YYYY-MM-DD`. */
  value: string;
  onChange: (isoDate: string) => void;
  error?: string;
}

/**
 * Label + date menu for the payment date.
 */
export function PaymentFormDateRow({
  value,
  onChange,
  error,
}: PaymentFormDateRowProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = value || getTodayIsoDate();

  const handleDateChange = useCallback(
    function applySelectedPaymentDate(isoDate: string) {
      if (!isoDate) {
        return;
      }

      onChange(isoDate);
      setOpen(false);
    },
    [onChange],
  );

  /////////////////////////////////
  // Date menu — calendar dropdown with z-index above drawer chrome
  return (
    <PaymentFormFieldRow error={error} label="Date">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Pick payment date"
            className={FIELD_MENU_TRIGGER_CLASS}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Calendar
              aria-hidden
              className="h-3.5 w-3.5 shrink-0 opacity-60"
            />
            <span className="truncate tabular-nums">{selectedDate}</span>
            <ChevronDown aria-hidden className="h-3.5 w-3.5 shrink-0 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className={cn(
            FIELD_MENU_CONTENT_CLASS,
            "w-auto min-w-0 border-[var(--color-border)] p-0",
          )}
          side="bottom"
          sideOffset={6}
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <DateSelectorSimple
            selectedEndDate={selectedDate}
            selectedStartDate={selectedDate}
            onDateChange={handleDateChange}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </PaymentFormFieldRow>
  );
}
