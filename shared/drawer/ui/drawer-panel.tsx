/**
 * @file shared/drawer/ui/drawer-panel.tsx
 * Sliding panel with header chrome and scrollable body.
 */

import type { CSSProperties, MouseEvent, ReactNode, Ref } from "react";

import { cn } from "@/lib/utils";
import {
  DRAWER_BODY_CLASS,
  DRAWER_PANEL_CLASS,
  DRAWER_PANEL_FIXED_WIDTH_CLASS,
  DRAWER_PANEL_RESIZABLE_WIDTH_CLASS,
  DRAWER_RESIZE_HANDLE_CLASS,
} from "@/shared/drawer/lib/drawer-panel-classes";
import { DrawerHeader } from "@/shared/drawer/ui/drawer-header";

export interface DrawerPanelProps {
  children: ReactNode;
  header?: ReactNode;
  titleId: string;
  ariaLabel: string;
  className?: string;
  onClose: () => void;
  /** Enables left-edge drag resize (notes). */
  resizable?: boolean;
  /** Pixel width from `useResizableWidth` — applied as `--drawer-width` on md+. */
  widthPx?: number;
  isResizing?: boolean;
  panelRef?: Ref<HTMLElement | null>;
  onResizeMouseDown?: (event: MouseEvent) => void;
}

/**
 * Right-side drawer panel — dialog semantics, fixed header, scrollable body.
 */
export function DrawerPanel({
  children,
  header,
  titleId,
  ariaLabel,
  className,
  onClose,
  resizable = false,
  widthPx,
  isResizing = false,
  panelRef,
  onResizeMouseDown,
}: DrawerPanelProps) {
  const style: CSSProperties | undefined =
    resizable && widthPx != null
      ? ({ "--drawer-width": `${widthPx}px` } as CSSProperties)
      : undefined;

  return (
    <aside
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={header ? titleId : undefined}
      aria-label={header ? undefined : ariaLabel}
      className={cn(
        DRAWER_PANEL_CLASS,
        resizable
          ? DRAWER_PANEL_RESIZABLE_WIDTH_CLASS
          : DRAWER_PANEL_FIXED_WIDTH_CLASS,
        className,
      )}
      style={style}
    >
      {resizable && onResizeMouseDown ? (
        <div
          aria-label="Resize panel"
          aria-orientation="vertical"
          className={DRAWER_RESIZE_HANDLE_CLASS}
          data-resizing={isResizing ? "true" : undefined}
          role="separator"
          onMouseDown={onResizeMouseDown}
        />
      ) : null}
      <DrawerHeader
        header={header}
        titleId={titleId}
        ariaLabel={ariaLabel}
        onClose={onClose}
      />
      <div className={DRAWER_BODY_CLASS}>{children}</div>
    </aside>
  );
}
