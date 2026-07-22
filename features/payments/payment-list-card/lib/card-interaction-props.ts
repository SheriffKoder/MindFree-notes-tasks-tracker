/**
 * @file features/payments/payment-list-card/lib/card-interaction-props.ts
 * Shared keyboard + click props when a payment list card is interactive.
 *
 * Purpose: Accessibility props for clickable payment list cards.
 * Used in: features/payments/payment-list-card/ui/payment-list-card.tsx
 * Used for: role=button, tab focus, and Enter/Space activation when onClick is set.
 *
 * Steps:
 * 1. Return empty props when the card is not interactive.
 * 2. Attach click + keyboard handlers for button-like behavior.
 */

import type { KeyboardEvent } from "react";

/**
 * Returns aria/keyboard props for clickable payment cards.
 */
export function getPaymentCardInteractionProps(onClick?: () => void) {
  // 1. Static card — no interaction props
  if (!onClick) {
    return {};
  }

  // 2. Interactive — button role with keyboard activation
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
