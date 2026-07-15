/**
 * @file shared/view-switcher/index.ts
 * Public exports for the config-driven view switcher shared module.
 *
 * Page-specific view configs live with each page (e.g.
 * `views/notes/lib/notes-views.ts`, `views/tasks/lib/tasks-views.ts`); this
 * module only provides the generic switcher, navigation hook, and helpers.
 */

export {
  getNextView,
  getViewDefinition,
  parseViewParam,
  type ViewConfig,
  type ViewDefinition,
} from "@/shared/view-switcher/lib/view-config";
export {
  useViewNavigation,
  type UseViewNavigationOptions,
  type UseViewNavigationResult,
} from "@/shared/view-switcher/model/use-view-navigation";
export {
  ViewSwitcher,
  type ViewSwitcherProps,
} from "@/shared/view-switcher/ui/view-switcher";
export {
  ViewSwitcherMobile,
  type ViewSwitcherMobileProps,
} from "@/shared/view-switcher/ui/view-switcher-mobile";
