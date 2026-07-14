/**
 * @file components/drag-horizontal/use-drag-scroll.ts
 * Horizontal drag-to-scroll with GSAP momentum for overflow containers.
 *
 * Purpose: Pointer-driven scroll on desktop and touch; suppresses child clicks after drag.
 * Used in: components/drag-horizontal/drag-horizontal-scroll.tsx
 */

"use client";

import { gsap } from "gsap";
import { useCallback, useRef, useState } from "react";

const DRAG_THRESHOLD_PX = 8;
const SCROLL_SPEED = 1;
const MOMENTUM_MULTIPLIER = 180;
const MIN_VELOCITY = 0.1;

interface DragScrollState {
  pointerDown: boolean;
  active: boolean;
  /** Set after the drag threshold so child clicks still receive the click event. */
  pointerId: number | null;
  startX: number;
  scrollLeft: number;
  lastX: number;
  lastTime: number;
  velocity: number;
  suppressClick: boolean;
}

function createInitialDragState(): DragScrollState {
  return {
    pointerDown: false,
    active: false,
    pointerId: null,
    startX: 0,
    scrollLeft: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
    suppressClick: false,
  };
}

/**
 * Enables horizontal drag scrolling with momentum on a scrollable container.
 */
export function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const dragState = useRef<DragScrollState>(createInitialDragState());
  const [isDragging, setIsDragging] = useState(false);

  const applyMomentum = useCallback(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const { velocity } = dragState.current;
    if (Math.abs(velocity) <= MIN_VELOCITY) {
      return;
    }

    gsap.to(element, {
      scrollLeft: element.scrollLeft - velocity * MOMENTUM_MULTIPLIER,
      duration: 0.8,
      ease: "power2.out",
    });
  }, []);

  const endDrag = useCallback(() => {
    const state = dragState.current;

    if (state.active) {
      applyMomentum();
      state.active = false;
      setIsDragging(false);
    }

    state.pointerDown = false;
    state.velocity = 0;
  }, [applyMomentum]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const element = ref.current;
      if (!element) {
        return;
      }

      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      // Do not capture yet — early capture retargets click to this container on
      // desktop mice, so child card onClick never fires. Capture starts after
      // the movement threshold (real drag).
      dragState.current = {
        ...createInitialDragState(),
        pointerDown: true,
        pointerId: event.pointerId,
        startX: event.clientX,
        scrollLeft: element.scrollLeft,
        lastX: event.clientX,
        lastTime: Date.now(),
      };
    },
    [],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const element = ref.current;
      const state = dragState.current;

      if (!element || !state.pointerDown) {
        return;
      }

      const deltaX = event.clientX - state.startX;

      if (!state.active) {
        if (Math.abs(deltaX) < DRAG_THRESHOLD_PX) {
          return;
        }

        state.active = true;
        state.suppressClick = true;
        setIsDragging(true);

        if (
          state.pointerId != null &&
          !element.hasPointerCapture(state.pointerId)
        ) {
          element.setPointerCapture(state.pointerId);
        }
      }

      event.preventDefault();

      const currentTime = Date.now();
      const frameDeltaTime = currentTime - state.lastTime;
      const frameDeltaX = event.clientX - state.lastX;

      if (frameDeltaTime > 0) {
        state.velocity = frameDeltaX / frameDeltaTime;
      }

      gsap.to(element, {
        scrollLeft: state.scrollLeft - (event.clientX - state.startX) * SCROLL_SPEED,
        duration: 0.1,
        ease: "power2.out",
      });

      state.lastX = event.clientX;
      state.lastTime = currentTime;
    },
    [],
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const element = ref.current;

      if (element?.hasPointerCapture(event.pointerId)) {
        element.releasePointerCapture(event.pointerId);
      }

      endDrag();
    },
    [endDrag],
  );

  const handleClickCapture = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!dragState.current.suppressClick) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      dragState.current.suppressClick = false;
    },
    [],
  );

  return {
    ref,
    isDragging,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
      onClickCapture: handleClickCapture,
    },
  };
}
