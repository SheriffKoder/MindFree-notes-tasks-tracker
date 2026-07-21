/**
 * @file features/profile/apply-theme/ui/theme-boot-script-tag.tsx
 * Renders the blocking theme boot script for the document head.
 */

import { THEME_BOOT_SCRIPT } from "@/features/profile/apply-theme/lib/theme-boot-script";

/**
 * Synchronous inline script — must stay in `<head>` before first paint.
 */
export function ThemeBootScriptTag() {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }}
      // BeforeInteractive equivalent for App Router root layout.
      id="mindfree-theme-boot"
    />
  );
}
