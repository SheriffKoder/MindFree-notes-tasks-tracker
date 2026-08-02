/**
 * @file shared/calendar/lib/tooltip-position.ts
 * Pure clamp/flip math for the calendar cursor tooltip panel.
 */

export interface TooltipPoint {
  x: number;
  y: number;
}

export interface TooltipSize {
  width: number;
  height: number;
}

export interface TooltipViewport {
  width: number;
  height: number;
}

export interface TooltipPositionOptions {
  /** Offset from the cursor toward the preferred corner (default 12). */
  offset?: number;
  /** Minimum gap from viewport edges (default 8). */
  padding?: number;
}

export interface TooltipPosition {
  left: number;
  top: number;
}

/**
 * Places a panel near the cursor, flipping above/left when near viewport edges
 * and clamping so the panel stays fully on-screen when possible.
 */
export function computeTooltipPosition(
  point: TooltipPoint,
  size: TooltipSize,
  viewport: TooltipViewport,
  options: TooltipPositionOptions = {},
): TooltipPosition {
  const offset = options.offset ?? 12;
  const padding = options.padding ?? 8;

  let left = point.x + offset;
  let top = point.y + offset;

  if (left + size.width + padding > viewport.width) {
    left = point.x - size.width - offset;
  }

  if (top + size.height + padding > viewport.height) {
    top = point.y - size.height - offset;
  }

  const maxLeft = Math.max(padding, viewport.width - size.width - padding);
  const maxTop = Math.max(padding, viewport.height - size.height - padding);

  left = Math.min(Math.max(left, padding), maxLeft);
  top = Math.min(Math.max(top, padding), maxTop);

  return { left, top };
}
