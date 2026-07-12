/**
 * @file shared/offline-queue/index.ts
 * Public exports for user-scoped offline writes.
 */

export {
  getOfflineWrites,
  hasOfflineWrites,
  isOnline,
  removeOfflineWrite,
  saveOfflineWrite,
} from "@/shared/offline-queue/lib/offline-store";
export type { OfflineWrite } from "@/shared/offline-queue/lib/offline-store";
export { useOnlineStatus } from "@/shared/offline-queue/hooks/use-online-status";
export {
  useAuthUserId,
  useOfflineSync,
} from "@/shared/offline-queue/hooks/use-offline-sync";
export type { OfflineEntityAdapter } from "@/shared/offline-queue/hooks/use-offline-sync";
export {
  DEFAULT_OFFLINE_BANNER_LABEL,
  OfflineBanner,
} from "@/shared/offline-queue/ui/offline-banner";
export type { OfflineBannerProps } from "@/shared/offline-queue/ui/offline-banner";
