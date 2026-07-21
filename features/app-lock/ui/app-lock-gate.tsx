/**
 * @file features/app-lock/ui/app-lock-gate.tsx
 * Full-screen intercept when app lock is enabled and the session is locked.
 */

"use client";

import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfilePageQuery } from "@/entities/profile/client";
import { fetchUnlockAppLock } from "@/features/app-lock/client/unlock-app-lock";

export interface AppLockGateProps {
  /** Whether app lock was enabled when the layout rendered on the server. */
  initialAppLockEnabled: boolean;
  /** Whether the unlock cookie matched the user on the server. */
  initialUnlocked: boolean;
  children: ReactNode;
}

/**
 * Blocks protected app content behind a password form when needed.
 */
export function AppLockGate({
  initialAppLockEnabled,
  initialUnlocked,
  children,
}: AppLockGateProps) {
  const query = useProfilePageQuery();
  const [unlocked, setUnlocked] = useState(initialUnlocked);
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setUnlocked(initialUnlocked);
  }, [initialUnlocked]);

  const appLockEnabled =
    query.data?.security.appLockEnabled ?? initialAppLockEnabled;

  if (!appLockEnabled || unlocked) {
    return children;
  }

  async function unlock() {
    setErrorMessage(null);
    setIsPending(true);

    try {
      await fetchUnlockAppLock(password);
      setPassword("");
      setUnlocked(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to unlock app.",
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-h2">App locked</h1>
          <p className="text-sm [color:var(--color-fg-muted)]">
            Enter your app lock password to continue.
          </p>
        </div>

        <form
          className="flex flex-col gap-4"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void unlock();
          }}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="app-lock-gate-password">Password</Label>
            <Input
              autoComplete="current-password"
              autoFocus
              id="app-lock-gate-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <Button disabled={isPending || password.length === 0} type="submit">
            {isPending ? "Unlocking…" : "Unlock"}
          </Button>

          {errorMessage ? (
            <p className="text-caption [color:var(--color-error)]" role="alert">
              {errorMessage}
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
