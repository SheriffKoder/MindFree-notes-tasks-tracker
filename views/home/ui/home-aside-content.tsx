/**
 * @file views/home/ui/home-aside-content.tsx
 * Placeholder body for the Home right aside column.
 *
 * Purpose: Slot for future dashboard widgets beside the main feed.
 * Used in: views/home/index.tsx via HomeRightAside
 */

/**
 * Renders the Home side-panel body — summaries, filters, or quick actions later.
 */
export function HomeAsideContent() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <h3 className="text-h3">Side panel</h3>
      <p className="text-body-muted">
        Placeholder for home dashboard widgets — summaries, filters, or quick
        actions.
      </p>
    </div>
  );
}
