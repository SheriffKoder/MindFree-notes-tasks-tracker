/**
 * @file features/profile/apply-theme/lib/resolve-accent-foreground.ts
 * Picks a readable foreground for a custom accent background.
 */

/**
 * Parses a CSS color to sRGB via the browser, then returns black or white text.
 *
 * @param accent - CSS color string (hex, named, rgb, …)
 * @returns `#ffffff` or `#1a1a1a`; white when the color cannot be parsed
 */
export function resolveAccentForeground(accent: string): string {
  if (typeof document === "undefined") {
    return "#ffffff";
  }

  const probe = document.createElement("span");
  probe.style.color = accent;
  probe.style.display = "none";
  document.body.appendChild(probe);

  const computed = getComputedStyle(probe).color;
  document.body.removeChild(probe);

  const match = computed.match(
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i,
  );

  if (!match) {
    return "#ffffff";
  }

  const r = Number(match[1]) / 255;
  const g = Number(match[2]) / 255;
  const b = Number(match[3]) / 255;

  const toLinear = (channel: number) =>
    channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;

  const luminance =
    0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

  return luminance > 0.4 ? "#1a1a1a" : "#ffffff";
}
