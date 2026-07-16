/**
 * @file features/activity/activity-list-card/lib/card-interaction-props.ts
 * Shared keyboard + click props when a list card is interactive.
 */

import type { KeyboardEvent } from "react";

/**
 * Returns aria/keyboard props for clickable activity cards.
 */
export function getActivityCardInteractionProps(onClick?: () => void) {
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
