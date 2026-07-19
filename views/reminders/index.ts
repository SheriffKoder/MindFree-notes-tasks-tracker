/**
 * @file views/reminders/index.ts
 * Reminders page composition for the protected app route tree.
 *
 * Server: RemindersHydrationSeed (SSR cache seed). Client: RemindersClient
 * (thin wrapper over ActivityPageClient).
 */

export { RemindersClient } from "@/views/reminders/ui/reminders-client";
export { RemindersHydrationSeed } from "@/views/reminders/ui/reminders-hydration-seed";
