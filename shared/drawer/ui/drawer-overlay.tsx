/**
 * @file shared/drawer/ui/drawer-overlay.tsx
 * Click-to-dismiss backdrop behind the drawer panel.
 */

import { DRAWER_OVERLAY_CLASS } from "@/shared/drawer/lib/drawer-panel-classes";

export interface DrawerOverlayProps {
  onClose: () => void;
}

/**
 * Renders the semi-transparent overlay; clicking it closes the drawer.
 */
export function DrawerOverlay({ onClose }: DrawerOverlayProps) {
  return (
    <button
      type="button"
      aria-label="Close panel"
      className={DRAWER_OVERLAY_CLASS}
      onClick={onClose}
    />
  );
}
