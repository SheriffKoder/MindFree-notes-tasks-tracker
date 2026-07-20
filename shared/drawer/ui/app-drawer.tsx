/**
 * @file shared/drawer/ui/app-drawer.tsx
 * Reusable right-side drawer shell — portals to `document.body`, presentation only.
 */

"use client";

import { useId } from "react";
import type { MouseEvent, RefObject } from "react";
import { createPortal } from "react-dom";

import type { AppDrawerProps } from "@/shared/drawer/model/types";
import { useDrawerEffects } from "@/shared/drawer/model/use-drawer-effects";
import { useResizableWidth } from "@/shared/drawer/model/use-resizable-width";
import { DrawerOverlay } from "@/shared/drawer/ui/drawer-overlay";
import { DrawerPanel } from "@/shared/drawer/ui/drawer-panel";

type AppDrawerShellProps = Omit<AppDrawerProps, "resizable"> & {
  resizable: boolean;
};

/**
 * Portal shell shared by fixed and resizable drawers.
 */
function AppDrawerPortal({
  open,
  onOpenChange,
  children,
  header,
  className,
  ariaLabel = "Panel",
  resizable,
  widthPx,
  isResizing,
  panelRef,
  onResizeMouseDown,
}: AppDrawerShellProps & {
  widthPx?: number;
  isResizing?: boolean;
  panelRef?: RefObject<HTMLElement | null>;
  onResizeMouseDown?: (event: MouseEvent) => void;
}) {
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
        isResizing={isResizing}
        panelRef={panelRef}
        resizable={resizable}
        titleId={titleId}
        widthPx={widthPx}
        onClose={close}
        onResizeMouseDown={onResizeMouseDown}
      >
        {children}
      </DrawerPanel>
    </div>,
    document.body,
  );
}

/**
 * Notes path — desktop width is drag-resizable and persisted.
 */
function ResizableAppDrawer(props: Omit<AppDrawerProps, "resizable">) {
  const { width, isResizing, panelRef, handleMouseDown } = useResizableWidth({
    defaultWidth: "35vw",
    minWidth: 320,
  });

  return (
    <AppDrawerPortal
      {...props}
      isResizing={isResizing}
      panelRef={panelRef}
      resizable
      widthPx={width}
      onResizeMouseDown={handleMouseDown}
    />
  );
}

/**
 * Renders a right-side slide-in drawer with overlay dismiss and scrollable content.
 *
 * Desktop width is `25vw` by default. Pass `resizable` (notes) to enable
 * drag-to-resize with localStorage persistence via `useResizableWidth`.
 *
 * @example
 * ```tsx
 * <AppDrawer open={open} onOpenChange={setOpen} resizable>
 *   <NoteForm />
 * </AppDrawer>
 * ```
 */
export function AppDrawer({
  resizable = false,
  ...props
}: AppDrawerProps) {
  if (resizable) {
    return <ResizableAppDrawer {...props} />;
  }

  return <AppDrawerPortal {...props} resizable={false} />;
}
