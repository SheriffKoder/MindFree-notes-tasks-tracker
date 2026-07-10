/**
 * @file shared/drawer/ui/app-drawer.tsx
 * Reusable right-side drawer shell — portals to `document.body`, presentation only.
 */

"use client";

import { useId } from "react";
import { createPortal } from "react-dom";

import type { AppDrawerProps } from "@/shared/drawer/model/types";
import { useDrawerEffects } from "@/shared/drawer/model/use-drawer-effects";
import { DrawerOverlay } from "@/shared/drawer/ui/drawer-overlay";
import { DrawerPanel } from "@/shared/drawer/ui/drawer-panel";

/**
 * Renders a right-side slide-in drawer with overlay dismiss and scrollable content.
 *
 * @example
 * ```tsx
 * <AppDrawer open={open} onOpenChange={setOpen} header={<DateNav />}>
 *   <NoteForm />
 * </AppDrawer>
 * ```
 */
export function AppDrawer({
  open,
  onOpenChange,
  children,
  header,
  className,
  ariaLabel = "Panel",
}: AppDrawerProps) {
  const titleId = useId();

  useDrawerEffects(open, onOpenChange);

  if (!open || typeof document === "undefined") {
    return null;
  }

  const close = () => onOpenChange(false);

  return createPortal(
    <div className="fixed inset-0 z-[60] flex justify-end">
      <DrawerOverlay onClose={close} />
      <DrawerPanel
        ariaLabel={ariaLabel}
        className={className}
        header={header}
        titleId={titleId}
        onClose={close}
      >
        {children}
      </DrawerPanel>
    </div>,
    document.body,
  );
}
