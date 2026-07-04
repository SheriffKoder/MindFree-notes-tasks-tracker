/**
 * @file views/tasks/index.tsx
 * Tasks page composition placeholder for the protected app route tree.
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Renders the protected tasks page scaffold.
 *
 * @returns Tasks page placeholder aligned with the product model
 */
export function TasksView() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <section className="flex flex-col gap-2">
        <h2 className="text-h2">Tasks</h2>
        <p className="text-body-muted">
          This page will host the monthly task calendar, task drawer, and completion
          workflows.
        </p>
      </section>

      <Card className="app-card">
        <CardHeader className="flex flex-col gap-2">
          <CardTitle className="text-h3">Planned Tasks Experience</CardTitle>
          <CardDescription className="text-body-muted">
            Calendar scheduling, task filtering, and progress mini-grids.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-body-muted">
            This route now lives under the shared protected shell, so its next work can
            focus on calendar interactions and task state instead of layout plumbing.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
