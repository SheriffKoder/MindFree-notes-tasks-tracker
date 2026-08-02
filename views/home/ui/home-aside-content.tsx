/**
 * @file views/home/ui/home-aside-content.tsx
 * Body for the Home right aside column — dashboard widgets.
 *
 * Purpose: Compose side-panel widgets beside the main feed.
 * Used in: views/home/index.tsx via HomeRightAside
 */

import { UptimeClock } from "@/widgets/uptime";
import { WorldTime } from "@/widgets/world-time";
import { HomeAsideCalendar } from "@/views/home/ui/home-aside-calendar";

/**
 * Renders the Home side-panel body — clock + calendar, world times, and more.
 */
export function HomeAsideContent() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-start gap-2 border border-[var(--color-border)] rounded-xl p-2 bg-[color-mix(in_srgb,var(--color-surface)_88%,transparent)]">
        <div className="w-[38%] shrink-0 self-center">
          <UptimeClock showSeconds={false} />
        </div>
        <div className="min-w-0 flex-1 overflow-hidden">
          <HomeAsideCalendar />
        </div>
      </div>

      <WorldTime />
    </div>
  );
}
