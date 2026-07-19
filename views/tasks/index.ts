/**
 * @file views/tasks/index.ts
 * Tasks page composition for the protected app route tree.
 *
 * Server: TasksHydrationSeed (SSR cache seed). Client: TasksClient (thin
 * wrapper over ActivityPageClient).
 */

export { TasksClient } from "@/views/tasks/ui/tasks-client";
export { TasksHydrationSeed } from "@/views/tasks/ui/tasks-hydration-seed";
