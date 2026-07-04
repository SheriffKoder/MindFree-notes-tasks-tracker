import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)] disabled:pointer-events-none disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-transparent [background-color:var(--color-accent)] [color:var(--color-accent-fg)] shadow-sm hover:brightness-95 disabled:[background-color:color-mix(in_srgb,var(--color-accent)_70%,var(--color-surface))] disabled:[color:var(--color-accent-fg)]",
        destructive:
          "border-transparent [background-color:var(--color-error)] text-white shadow-sm hover:brightness-95 disabled:[background-color:color-mix(in_srgb,var(--color-error)_70%,var(--color-surface))] disabled:text-white",
        outline:
          "border-[var(--color-border)] [background-color:color-mix(in_srgb,var(--color-surface)_88%,transparent)] [color:var(--color-fg)] shadow-sm hover:border-transparent hover:[background-color:var(--color-accent)] hover:[color:var(--color-accent-fg)] disabled:[background-color:color-mix(in_srgb,var(--color-surface-secondary)_82%,transparent)] disabled:[color:var(--color-fg-disabled)]",
        secondary:
          "border-[var(--color-border)] [background-color:var(--color-surface-secondary)] [color:var(--color-fg)] shadow-sm hover:[background-color:var(--color-card-hover)] disabled:[background-color:var(--color-surface-secondary)] disabled:[color:var(--color-fg-disabled)]",
        ghost:
          "border-transparent [color:var(--color-fg)] hover:[background-color:var(--color-accent-light)] hover:[color:var(--color-accent)] disabled:[color:var(--color-fg-disabled)]",
        link:
          "border-transparent p-0 [color:var(--color-accent)] shadow-none underline-offset-4 hover:underline disabled:[color:var(--color-fg-disabled)]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
