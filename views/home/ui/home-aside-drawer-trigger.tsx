/**
 * @file views/home/ui/home-aside-drawer-trigger.tsx
 * Mobile-only control that opens the Home right aside in AppDrawer.
 */

"use client";

import { PanelRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useHomeAsideDispatch } from "@/views/home/model/home-aside-drawer-context";

/**
 * Ghost icon button shown below `xl` — opens the aside drawer without
 * subscribing to `open`, so it does not re-render on toggle.
 */
export function HomeAsideDrawerTrigger() {
  const setOpen = useHomeAsideDispatch();

  return (
    <Button
      aria-label="Open side panel"
      className="xl:hidden"
      size="sm"
      type="button"
      variant="ghost"
      onClick={() => setOpen(true)}
    >
      <PanelRight className="[color:var(--color-fg-muted)]" size={16} />
    </Button>
  );
}
