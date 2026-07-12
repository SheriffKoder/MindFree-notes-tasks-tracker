/**
 * @file shared/offline-queue/lib/offline-store.ts
 * User-scoped offline write storage in localStorage.
 *
 * Purpose: Generic transport — entity-agnostic save/load/remove.
 * Used in: orchestrator offline guard, use-offline-sync merge/flush
 * Used for: Persist pending writes across tab close and laptop reboot.
 */

export interface OfflineWrite<TPayload = unknown> {
  userId: string;
  entity: string;
  key: string;
  payload: TPayload;
  savedAt: string;
}

type OfflineStore = Record<string, OfflineWrite>;

const STORAGE_PREFIX = "offline-writes:";

function storageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

function readStore(userId: string): OfflineStore {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = localStorage.getItem(storageKey(userId));

    if (!raw) {
      return {};
    }

    return JSON.parse(raw) as OfflineStore;
  } catch {
    return {};
  }
}

function writeStore(userId: string, store: OfflineStore): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(storageKey(userId), JSON.stringify(store));
}

/**
 * @returns whether the browser reports a network connection.
 */
export function isOnline(): boolean {
  return typeof navigator === "undefined" || navigator.onLine;
}

/**
 * Upserts one offline write — same `key` overwrites (last-win per resource).
 */
export function saveOfflineWrite<TPayload>(write: OfflineWrite<TPayload>): void {
  const store = readStore(write.userId);
  store[write.key] = write as OfflineWrite;
  writeStore(write.userId, store);
}

/**
 * @returns stored writes for a user, optionally filtered by entity.
 */
export function getOfflineWrites<TPayload>(
  userId: string,
  entity?: string,
): OfflineWrite<TPayload>[] {
  const store = readStore(userId);
  const writes = Object.values(store) as OfflineWrite<TPayload>[];

  if (!entity) {
    return writes;
  }

  return writes.filter((write) => write.entity === entity);
}

/**
 * Removes one stored write by key.
 */
export function removeOfflineWrite(userId: string, key: string): void {
  const store = readStore(userId);
  delete store[key];
  writeStore(userId, store);
}

/**
 * @returns whether the user has any stored writes (any entity).
 */
export function hasOfflineWrites(userId: string): boolean {
  return Object.keys(readStore(userId)).length > 0;
}
