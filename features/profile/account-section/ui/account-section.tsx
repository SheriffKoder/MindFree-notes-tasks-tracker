/**
 * @file features/profile/account-section/ui/account-section.tsx
 * Profile account fields — editable display name, read-only auth email.
 */

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfilePageQuery } from "@/entities/profile/client";
import { useUpdateDisplayName } from "@/features/profile/account-section/model/use-update-display-name";
import { QueryStatePanel } from "@/shared/react-query";

/**
 * Renders the Account section form for the Profile page.
 */
export function AccountSection() {
  const query = useProfilePageQuery();

  if (query.isPending && !query.data) {
    return (
      <QueryStatePanel
        message="Loading account…"
        variant="loading"
      />
    );
  }

  if (query.isError || !query.data) {
    return (
      <QueryStatePanel
        message={
          query.error instanceof Error
            ? query.error.message
            : "Couldn’t load account. Try refreshing the page."
        }
        variant="error"
      />
    );
  }

  return (
    <AccountSectionForm
      displayName={query.data.account.displayName}
      email={query.data.account.email}
    />
  );
}

function AccountSectionForm({
  displayName: savedDisplayName,
  email,
}: {
  displayName: string;
  email: string;
}) {
  const {
    displayName,
    errorMessage,
    isDirty,
    isPending,
    isSuccess,
    onDisplayNameChange,
    save,
  } = useUpdateDisplayName(savedDisplayName);

  return (
    <section
      aria-labelledby="profile-section-account"
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-2">
        <h3
          className="text-lg font-semibold [color:var(--color-fg)]"
          id="profile-section-account"
        >
          Account
        </h3>
        <p className="text-sm [color:var(--color-fg-muted)]">
          Display name and signed-in email.
        </p>
      </div>

      <form
        className="flex max-w-md flex-col gap-4"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="profile-display-name">Display name</Label>
          <Input
            autoComplete="nickname"
            id="profile-display-name"
            placeholder="Optional"
            value={displayName}
            onChange={(event) => onDisplayNameChange(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="profile-email">Email</Label>
          <Input
            disabled
            id="profile-email"
            readOnly
            type="email"
            value={email}
          />
          <p className="text-caption [color:var(--color-fg-muted)]">
            Signed-in email from your account. Change it in auth settings if
            your provider allows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button disabled={!isDirty || isPending} type="submit">
            {isPending ? "Saving…" : "Save"}
          </Button>
          {isSuccess ? (
            <p
              className="text-caption [color:var(--color-success)]"
              role="status"
            >
              Saved
            </p>
          ) : null}
        </div>

        {errorMessage ? (
          <p className="text-caption [color:var(--color-error)]" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </form>
    </section>
  );
}
