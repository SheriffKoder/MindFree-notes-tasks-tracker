/**
 * @file views/notes/index.tsx
 * Notes page composition placeholder for the protected app route tree.
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Renders the protected notes page scaffold.
 *
 * @returns Notes page placeholder aligned with the product model
 */
export function NotesView() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <section className="flex flex-col gap-2">
        <h2 className="text-h2">Notes</h2>
        <p className="text-body-muted">
          This page is reserved for the calendar or grid note view and the full-screen
          note drawer flow.
        </p>
      </section>

      <Card className="app-card">
        <CardHeader className="flex flex-col gap-2">
          <CardTitle className="text-h3">Planned Notes Experience</CardTitle>
          <CardDescription className="text-body-muted">
            Monthly navigation, important note indicators, and one note per day.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-body-muted">
            The protected layout is ready, so the next step here can focus on note data,
            calendar UI, and the right-side drawer without rebuilding auth controls.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
