/**
 * @file shared/react-query/index.ts
 * Public exports for TanStack Query integration.
 */

export {
  getQueryClient,
  APP_QUERY_STALE_TIME_MS,
} from "@/shared/react-query/lib/get-query-client";
export {
  AppQueryProvider,
  type AppQueryProviderProps,
} from "@/shared/react-query/ui/app-query-provider";
export {
  QueryHydration,
  type QueryHydrationProps,
} from "@/shared/react-query/ui/query-hydration";
export {
  QueryStatePanel,
  type QueryStatePanelProps,
  type QueryStatePanelVariant,
} from "@/shared/react-query/ui/query-state-panel";
