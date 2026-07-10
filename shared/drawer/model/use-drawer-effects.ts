/**
 * @file shared/drawer/model/use-drawer-effects.ts
 * Side effects while a drawer is open — scroll lock and Escape to close.
 */

import { useEffect } from "react";

/**
 * Locks page scroll and listens for Escape while the drawer is open.
 *
 * @param open - whether the drawer is currently visible
 * @param onOpenChange - close handler shared with overlay and close button
 */
export function useDrawerEffects(
  open: boolean,
  onOpenChange: (open: boolean) => void,
): void {
  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange]);
}
