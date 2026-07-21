/**
 * @file entities/payment/editor/fields/payment-form-title-row.tsx
 * Title (h2) + dimmer description for the payment editor form.
 */

import { PaymentFormTitleActions } from "@/entities/payment/editor/fields/payment-form-title-actions";
import {
  PLAIN_DESCRIPTION_CLASS,
  PLAIN_TITLE_CLASS,
} from "@/entities/payment/editor/lib/form-classes";
import type {
  PaymentFormFieldErrors,
  PaymentFormValues,
} from "@/entities/payment/editor/model/types";

export interface PaymentFormTitleRowProps {
  values: Pick<PaymentFormValues, "title" | "description">;
  errors: Pick<PaymentFormFieldErrors, "title" | "description">;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onDelete?: () => void;
}

/**
 * Hero title input with a quieter description field beneath.
 */
export function PaymentFormTitleRow({
  values,
  errors,
  onTitleChange,
  onDescriptionChange,
  onDelete,
}: PaymentFormTitleRowProps) {
  return (
    <div className="flex shrink-0 flex-col gap-2">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <input
            aria-invalid={Boolean(errors.title)}
            className={PLAIN_TITLE_CLASS}
            name="title"
            placeholder="Title"
            type="text"
            value={values.title}
            onChange={(event) => onTitleChange(event.target.value)}
          />

          <PaymentFormTitleActions onDelete={onDelete} />
        </div>
        {errors.title ? (
          <p className="text-caption [color:var(--color-error)]" role="alert">
            {errors.title}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <textarea
          aria-invalid={Boolean(errors.description)}
          className={PLAIN_DESCRIPTION_CLASS}
          name="description"
          placeholder="Description (optional)"
          rows={2}
          value={values.description}
          onChange={(event) => onDescriptionChange(event.target.value)}
        />
        {errors.description ? (
          <p className="text-caption [color:var(--color-error)]" role="alert">
            {errors.description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
