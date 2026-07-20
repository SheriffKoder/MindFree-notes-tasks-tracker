/**
 * @file features/profile/app-lock-section/ui/app-lock-section.tsx
 * Profile controls to set, change, and remove the app lock password.
 */

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfilePageQuery } from "@/entities/profile/client";
import { useAppLockSettings } from "@/features/profile/app-lock-section/model/use-app-lock-settings";
import { QueryStatePanel } from "@/shared/react-query";

/**
 * Renders the App lock section for the Profile page.
 */
export function AppLockSection() {
  const query = useProfilePageQuery();

  if (query.isPending && !query.data) {
    return <QueryStatePanel message="Loading app lock…" variant="loading" />;
  }

  if (query.isError || !query.data) {
    return (
      <QueryStatePanel
        message={
          query.error instanceof Error
            ? query.error.message
            : "Couldn’t load app lock settings. Try refreshing the page."
        }
        variant="error"
      />
    );
  }

  return (
    <AppLockSectionForm appLockEnabled={query.data.security.appLockEnabled} />
  );
}

function AppLockSectionForm({
  appLockEnabled,
}: {
  appLockEnabled: boolean;
}) {
  const settings = useAppLockSettings(appLockEnabled);

  return (
    <section
      aria-labelledby="profile-section-app-lock"
      className="flex flex-col gap-5"
    >
      <div className="flex flex-col gap-2">
        <h3
          className="text-lg font-semibold [color:var(--color-fg)]"
          id="profile-section-app-lock"
        >
          App lock
        </h3>
        <p className="text-sm [color:var(--color-fg-muted)]">
          Optional password gate for opening the app. Separate from your sign-in
          password.
        </p>
        <p className="text-caption [color:var(--color-fg-muted)]">
          Status: {appLockEnabled ? "Enabled" : "Off"}
        </p>
      </div>

      {!appLockEnabled ? (
        <form
          className="flex max-w-md flex-col gap-4"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            settings.enable();
          }}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="app-lock-password">Password</Label>
            <Input
              autoComplete="new-password"
              id="app-lock-password"
              type="password"
              value={settings.password}
              onChange={(event) => settings.setPassword(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="app-lock-confirm">Confirm password</Label>
            <Input
              autoComplete="new-password"
              id="app-lock-confirm"
              type="password"
              value={settings.confirmPassword}
              onChange={(event) =>
                settings.setConfirmPassword(event.target.value)
              }
            />
          </div>
          <Button disabled={settings.isPending} type="submit">
            {settings.isPending ? "Enabling…" : "Enable app lock"}
          </Button>
        </form>
      ) : (
        <div className="flex max-w-md flex-col gap-8">
          <form
            className="flex flex-col gap-4"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              settings.change();
            }}
          >
            <p className="text-sm font-medium [color:var(--color-fg)]">
              Change password
            </p>
            <div className="flex flex-col gap-2">
              <Label htmlFor="app-lock-current-change">Current password</Label>
              <Input
                autoComplete="current-password"
                id="app-lock-current-change"
                type="password"
                value={settings.changeCurrentPassword}
                onChange={(event) =>
                  settings.setChangeCurrentPassword(event.target.value)
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="app-lock-new">New password</Label>
              <Input
                autoComplete="new-password"
                id="app-lock-new"
                type="password"
                value={settings.password}
                onChange={(event) => settings.setPassword(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="app-lock-new-confirm">Confirm new password</Label>
              <Input
                autoComplete="new-password"
                id="app-lock-new-confirm"
                type="password"
                value={settings.confirmPassword}
                onChange={(event) =>
                  settings.setConfirmPassword(event.target.value)
                }
              />
            </div>
            <Button disabled={settings.isPending} type="submit">
              {settings.isPending ? "Updating…" : "Update password"}
            </Button>
          </form>

          <form
            className="flex flex-col gap-4"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              settings.disable();
            }}
          >
            <p className="text-sm font-medium [color:var(--color-fg)]">
              Remove app lock
            </p>
            <div className="flex flex-col gap-2">
              <Label htmlFor="app-lock-current-disable">Current password</Label>
              <Input
                autoComplete="current-password"
                id="app-lock-current-disable"
                type="password"
                value={settings.disableCurrentPassword}
                onChange={(event) =>
                  settings.setDisableCurrentPassword(event.target.value)
                }
              />
            </div>
            <Button
              disabled={settings.isPending}
              type="submit"
              variant="destructive"
            >
              {settings.isPending ? "Removing…" : "Remove app lock"}
            </Button>
          </form>
        </div>
      )}

      {settings.errorMessage ? (
        <p className="text-caption [color:var(--color-error)]" role="alert">
          {settings.errorMessage}
        </p>
      ) : null}
    </section>
  );
}
