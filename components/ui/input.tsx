import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-[var(--color-border)] [background-color:color-mix(in_srgb,var(--color-surface)_94%,transparent)] px-3 py-1 text-base [color:var(--color-fg)] shadow-sm transition-[color,border-color,box-shadow,background-color] caret-[var(--color-accent)] file:border-0 file:bg-transparent file:text-sm file:font-medium file:[color:var(--color-fg)] placeholder:[color:var(--color-fg-hint)] selection:[background-color:var(--color-interactive-accent-surface)] hover:border-[color-mix(in_srgb,var(--color-fg-muted)_20%,var(--color-border))] focus-visible:outline-none focus-visible:[box-shadow:0_0_0_1px_color-mix(in_srgb,var(--color-accent)_60%,transparent)] disabled:cursor-not-allowed disabled:[background-color:color-mix(in_srgb,var(--color-surface-secondary)_85%,transparent)] disabled:[color:var(--color-fg-disabled)] disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
