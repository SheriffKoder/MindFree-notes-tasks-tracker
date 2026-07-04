/**
 * @file app/(app)/progress/page.tsx
 * Protected progress route that composes the progress page inside the shared shell.
 */

import { ProgressView } from "@/views/progress";

/**
 * Renders the protected progress route.
 *
 * @returns Progress route composition for `/progress`
 */
export default function ProgressRoute() {
  return <ProgressView />;
}
