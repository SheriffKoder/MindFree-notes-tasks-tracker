import { cn } from "@/lib/utils";

export type SaveStatusType = "idle" | "saving" | "saved" | "error";

export interface SaveStatusLabelProps {
  label: string;
  saveStatus?: SaveStatusType;
  variant?: "overlay" | "inline";
  className?: string;
}

export function getSaveStatusLabel(status: SaveStatusType): string | null {
  switch (status) {
    case "saving":
      return "Saving…";
    case "saved":
      return "Saved";
    case "error":
      return "Could not save";
    default:
      return null;
  }
}

export function SaveStatusLabel({
  label,
  saveStatus = "idle",
  variant = "overlay",
  className,
}: SaveStatusLabelProps) {
  return (
    <p
      className={cn(
        "text-[11px] leading-none",
        variant === "overlay"
          ? "pointer-events-none absolute bottom-0 right-0"
          : "shrink-0 text-right",
        saveStatus === "error"
          ? "[color:var(--color-error)] opacity-100"
          : "text-body-muted opacity-60",
        className,
      )}
      role={saveStatus !== "idle" ? "status" : undefined}
    >
      {label}
    </p>
  );
}
