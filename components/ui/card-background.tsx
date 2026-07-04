/**
 * @file components/ui/card-background.tsx
 * Absolute card surface layer that reacts to a parent `group` hover state and
 * can be reused anywhere a card-shaped background needs controlled visuals.
 */

import * as React from "react";

import { cn } from "@/lib/utils";

type CardBackgroundStyle = React.CSSProperties & {
  "--card-background-default-color"?: string;
  "--card-background-default-hover-color"?: string;
  "--card-background-active-color"?: string;
  "--card-background-active-hover-color"?: string;
  "--card-background-default-border-color"?: string;
  "--card-background-active-border-color"?: string;
  "--card-background-blur"?: string;
  "--card-background-radius"?: string;
};

function withOpacity(color: string, opacity: number) {
  const clampedOpacity = Math.min(Math.max(opacity, 0), 1);
  const percentage = `${clampedOpacity * 100}%`;

  return `color-mix(in srgb, ${color} ${percentage}, transparent)`;
}

/**
 * Props for the reusable absolute card surface background.
 */
export interface CardBackgroundProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Whether the surface should render in its active visual state. */
  active?: boolean;
  /** Background color shown while active. */
  activeColor: string;
  /** Background color shown while inactive before hover reveals the layer. */
  defaultColor: string;
  /** Background color shown while inactive and hovered. */
  defaultHoverColor?: string;
  /** Background color shown while active and hovered. */
  activeHoverColor?: string;
  /** Opacity applied to the background fill color. */
  backgroundOpacity?: number;
  /** Border color applied while inactive and hovered. */
  defaultBorderColor?: string;
  /** Border color applied while active. */
  activeBorderColor?: string;
  /** Opacity applied to the visible border color. */
  borderOpacity?: number;
  /** Backdrop blur intensity in pixels. */
  blur?: number;
  /** Border radius applied to the full-size surface. */
  radius?: number | string;
}

/**
 * Render an absolute full-size background surface for any grouped card element.
 *
 * @param props - visual configuration and standard span attributes
 * @returns Reusable absolute background layer for card-shaped surfaces
 */
export function CardBackground({
  active = false,
  activeColor,
  defaultColor,
  defaultHoverColor = defaultColor,
  activeHoverColor = activeColor,
  backgroundOpacity = 1,
  defaultBorderColor = "transparent",
  activeBorderColor = defaultBorderColor,
  borderOpacity = 1,
  blur = 0,
  radius = "1rem",
  className,
  style,
  ...props
}: CardBackgroundProps) {
  const surfaceStyle: CardBackgroundStyle = {
    "--card-background-default-color": withOpacity(defaultColor, backgroundOpacity),
    "--card-background-default-hover-color": withOpacity(
      defaultHoverColor,
      backgroundOpacity,
    ),
    "--card-background-active-color": withOpacity(activeColor, backgroundOpacity),
    "--card-background-active-hover-color": withOpacity(activeHoverColor, backgroundOpacity),
    "--card-background-default-border-color": withOpacity(
      defaultBorderColor,
      borderOpacity,
    ),
    "--card-background-active-border-color": withOpacity(activeBorderColor, borderOpacity),
    "--card-background-blur": `${blur}px`,
    "--card-background-radius": typeof radius === "number" ? `${radius}px` : radius,
    ...style,
  };

  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 border transition-all duration-200",
        "[backdrop-filter:blur(var(--card-background-blur))]",
        "rounded-[var(--card-background-radius)]",
        active
          ? "opacity-100 [background-color:var(--card-background-active-color)] [border-color:var(--card-background-active-border-color)] group-hover:[background-color:var(--card-background-active-hover-color)]"
          : "opacity-0 [background-color:var(--card-background-default-color)] [border-color:var(--card-background-default-border-color)] group-hover:opacity-100 group-hover:[background-color:var(--card-background-default-hover-color)]",
        className,
      )}
      style={surfaceStyle}
      {...props}
    />
  );
}
