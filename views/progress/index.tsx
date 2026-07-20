/**
 * @file views/progress/index.tsx
 * Public Progress view entrypoint for the protected app route tree.
 *
 * Purpose: Thin re-export surface for `/progress` composition.
 * Used in: `app/(app)/progress/page.tsx`.
 * Used for: Importing `ProgressView` without deep UI paths.
 */

export {
  ProgressView,
  type ProgressViewProps,
} from "@/views/progress/ui/progress-view";
