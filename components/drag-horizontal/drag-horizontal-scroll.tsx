/**
 * @file components/drag-horizontal/drag-horizontal-scroll.tsx
 * Reusable horizontal drag-scroll container with hidden scrollbar.
 *
 * Purpose: Momentum drag scrolling for card rows and carousels.
 * Used in: views/home/ui/home-notes-strip.tsx
 */

"use client";

import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { useDragScroll } from "./use-drag-scroll";

export interface DragHorizontalScrollProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  children: ReactNode;
}

/**
 * Overflow-x row that scrolls via drag with GSAP momentum.
 * Child clicks are preserved unless the pointer moves past the drag threshold.
 */
export function DragHorizontalScroll({
  children,
  className,
  ...props
}: DragHorizontalScrollProps) {
  const { ref, isDragging, handlers } = useDragScroll();

  return (
    <div
      ref={ref}
      className={cn(
        "overflow-x-auto touch-pan-y",
        "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        isDragging ? "cursor-grabbing select-none" : "cursor-grab",
        className,
      )}
      {...handlers}
      {...props}
    >
      {children}
    </div>
  );
}
