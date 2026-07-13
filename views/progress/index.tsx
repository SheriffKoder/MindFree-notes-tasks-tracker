/**
 * @file views/progress/index.tsx
 * Progress page composition placeholder for the protected app route tree.
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Renders the protected progress page scaffold.
 *
 * @returns Progress page placeholder aligned with the product model
 */
export function ProgressView() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <section className="flex flex-col gap-2">
        <h2 className="text-h2">Progress</h2>
        <p className="page-header__subtitle">
          This page will hold the monthly progress cards, pie charts, and task tracking
          summaries.
        </p>
      </section>

      <Card className="app-card">
        <CardHeader className="flex flex-col gap-2">
          <CardTitle className="text-h3">Planned Progress Experience</CardTitle>
          <CardDescription className="text-body-muted">
            Two-column cards, monthly totals, all-time totals, and target comparisons.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-body-muted">
            The app shell now provides the shared frame, so progress work can concentrate
            on metrics, charts, and month navigation next.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
