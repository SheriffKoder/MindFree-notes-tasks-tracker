/**
 * @file features/profile/account-section/model/use-update-display-name.ts
 * Local draft state for the display-name field + explicit save via mutation.
 */

"use client";

import { useEffect, useState } from "react";

import { useUpdateProfileMutation } from "@/entities/profile/client";

const DISPLAY_NAME_MAX = 120;

/**
 * Owns the display-name draft and wires Save to PATCH /api/profile/account.
 *
 * @param savedDisplayName - last server/cache value for the field
 */
export function useUpdateDisplayName(savedDisplayName: string) {
  const mutation = useUpdateProfileMutation();
  const [displayName, setDisplayName] = useState(savedDisplayName);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setDisplayName(savedDisplayName);
  }, [savedDisplayName]);

  const isDirty = displayName !== savedDisplayName;

  function onDisplayNameChange(value: string) {
    setDisplayName(value);
    if (value.length > DISPLAY_NAME_MAX) {
      setValidationError(
        `Display name must be ${DISPLAY_NAME_MAX} characters or fewer.`,
      );
      return;
    }
    setValidationError(null);
  }

  function save() {
    if (displayName.length > DISPLAY_NAME_MAX) {
      setValidationError(
        `Display name must be ${DISPLAY_NAME_MAX} characters or fewer.`,
      );
      return;
    }

    setValidationError(null);
    mutation.mutate({ displayName });
  }

  return {
    displayName,
    errorMessage:
      validationError ??
      (mutation.error instanceof Error ? mutation.error.message : null),
    isDirty,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess && !isDirty && !mutation.isPending,
    onDisplayNameChange,
    save,
  };
}
