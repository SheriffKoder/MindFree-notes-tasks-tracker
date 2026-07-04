import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]",
  {
    variants: {
      variant: {
        default:
          "border-transparent [background-color:var(--color-accent)] [color:var(--color-accent-fg)] shadow-sm hover:brightness-95",
        secondary:
          "border-[var(--color-border)] [background-color:var(--color-surface-secondary)] [color:var(--color-fg)] hover:[background-color:var(--color-card-hover)]",
        destructive:
          "border-transparent [background-color:var(--color-error)] text-white shadow-sm hover:brightness-95",
        outline:
          "border-[var(--color-border)] [background-color:color-mix(in_srgb,var(--color-surface)_92%,transparent)] [color:var(--color-fg)] hover:border-[color-mix(in_srgb,var(--color-accent)_25%,var(--color-border))] hover:[background-color:var(--color-interactive-accent-surface)] hover:[color:var(--color-accent)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
