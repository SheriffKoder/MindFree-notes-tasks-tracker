/**
 * @file shared/react-query/ui/query-state-panel.tsx
 * Centered loading and error message for async query islands.
 */

import { cn } from "@/lib/utils";

export type QueryStatePanelVariant = "loading" | "error";

export interface QueryStatePanelProps {
  /** User-facing status message. */
  message: string;
  /** Visual tone — loading uses muted text, error uses error token. */
  variant?: QueryStatePanelVariant;
  className?: string;
}

/**
 * Centers a short loading or error message inside a scrollable content region.
 */
export function QueryStatePanel({
  message,
  variant = "loading",
  className,
}: QueryStatePanelProps) {
  return (
    <div
      className={cn(
        "flex min-h-[12rem] flex-1 items-center justify-center p-6",
        className,
      )}
      role={variant === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      <p
        className={cn(
          "max-w-sm text-center text-body",
          variant === "loading" && "text-body-muted",
          variant === "error" && "[color:var(--color-error)]",
        )}
      >
        {message}
      </p>
    </div>
  );
}
