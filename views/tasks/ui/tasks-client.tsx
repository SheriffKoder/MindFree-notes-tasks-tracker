/**
 * @file views/tasks/ui/tasks-client.tsx
 * Client boundary for the Tasks page.
 *
 * Step 7 scope: a shell placeholder that renders beside the SSR seed so the two
 * caches hydrate on first paint. Month/view/filter controls (Step 8), the
 * calendar + list views section (Step 9), and the config drawer (Step 11)
 * expand this component.
 */

"use client";

/**
 * Renders the Tasks page shell. Query reads land with the views section.
 */
export function TasksClient() {
  return (
    <div className="mx-auto flex h-full w-full flex-col gap-4">
      <section className="flex shrink-0 flex-col gap-2">
        <h2 className="text-h2">Tasks</h2>
        <p className="page-header__subtitle">
          Browse scheduled tasks by month. Configuration, calendar, and
          completion arrive in the next steps.
        </p>
      </section>
    </div>
  );
}
