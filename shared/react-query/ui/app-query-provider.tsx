/**
 * @file shared/react-query/ui/app-query-provider.tsx
 * App-wide QueryClient provider — survives route changes within the protected shell.
 */

"use client";

import { QueryClientProvider } from "@tanstack/react-query";

import { getQueryClient } from "@/shared/react-query/lib/get-query-client";

export interface AppQueryProviderProps {
  children: React.ReactNode;
}

/**
 * Provides a persistent browser QueryClient for all protected app routes.
 */
export function AppQueryProvider({ children }: AppQueryProviderProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
