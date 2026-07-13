/**
 * @file views/home/ui/home-right-aside.tsx
 * Home right column — desktop aside and mobile AppDrawer sharing one body slot.
 *
 * Purpose: Encapsulate xl+ aside layout and sub-xl drawer access.
 * Used in: views/home/index.tsx
 */

"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { AppDrawer } from "@/shared/drawer";
import {
  HOME_ASIDE_LAYOUT_CLASS,
  HOME_ASIDE_SURFACE_CLASS,
} from "@/views/home/lib/home-aside-layout";
import {
  useHomeAsideDispatch,
  useHomeAsideOpen,
} from "@/views/home/model/home-aside-drawer-context";

export interface HomeRightAsideProps {
  children: ReactNode;
}

/**
 * Renders the bordered aside on `xl+` and mirrors content in AppDrawer on smaller screens.
 * Only this island re-renders when the mobile drawer opens or closes.
 */
export function HomeRightAside({ children }: HomeRightAsideProps) {
  const open = useHomeAsideOpen();
  const setOpen = useHomeAsideDispatch();

  return (
    <>
      <aside
        className={cn(
          "hidden flex-col overflow-hidden xl:flex",
          HOME_ASIDE_LAYOUT_CLASS,
        )}
      >
        <div
          className={cn(
            HOME_ASIDE_SURFACE_CLASS,
            "min-h-0 flex-1 overflow-y-auto",
          )}
        >
          {children}
        </div>
      </aside>

      <AppDrawer
        ariaLabel="Home side panel"
        open={open}
        onOpenChange={setOpen}
      >
        {children}
      </AppDrawer>
    </>
  );
}
