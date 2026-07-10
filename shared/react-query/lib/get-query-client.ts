/**
 * @file shared/react-query/lib/get-query-client.ts
 * QueryClient factory — new instance per server request, singleton in the browser.
 */

import {
  QueryClient,
  defaultShouldDehydrateQuery,
  isServer,
} from "@tanstack/react-query";

/** Default stale window for app queries (avoids refetch flash after SSR hydration). */
export const APP_QUERY_STALE_TIME_MS = 60_000;

/**
 * Creates a QueryClient with app-wide defaults.
 */
function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: APP_QUERY_STALE_TIME_MS,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * Returns a QueryClient appropriate for the current runtime.
 *
 * Server components get a fresh client per request; the browser reuses one instance.
 */
export function getQueryClient(): QueryClient {
  if (isServer) {
    return makeQueryClient();
  }

  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }

  return browserQueryClient;
}
