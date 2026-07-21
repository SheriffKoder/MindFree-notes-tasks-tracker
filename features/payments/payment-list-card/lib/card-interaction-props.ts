/**
 * @file features/payments/payment-list-card/lib/card-interaction-props.ts
 * Shared keyboard + click props when a payment list card is interactive.
 */

import type { KeyboardEvent } from "react";

/**
 * Returns aria/keyboard props for clickable payment cards.
 */
export function getPaymentCardInteractionProps(onClick?: () => void) {
  if (!onClick) {
    return {};
  }

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return {
    role: "button" as const,
    tabIndex: 0,
    onClick,
    onKeyDown,
  };
}
