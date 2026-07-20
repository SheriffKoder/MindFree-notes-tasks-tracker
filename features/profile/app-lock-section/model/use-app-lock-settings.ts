/**
 * @file features/profile/app-lock-section/model/use-app-lock-settings.ts
 * Form state for enable / change / disable app lock on Profile.
 */

"use client";

import { useState } from "react";

import { useUpdateAppLockMutation } from "@/entities/profile/client";

const MIN_PASSWORD_LENGTH = 4;

/**
 * Owns password drafts and wires enable / change / disable mutations.
 *
 * @param appLockEnabled - current enabled flag from the profile cache
 */
export function useAppLockSettings(appLockEnabled: boolean) {
  const mutation = useUpdateAppLockMutation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changeCurrentPassword, setChangeCurrentPassword] = useState("");
  const [disableCurrentPassword, setDisableCurrentPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  function resetDrafts() {
    setPassword("");
    setConfirmPassword("");
    setChangeCurrentPassword("");
    setDisableCurrentPassword("");
    setValidationError(null);
  }

  function enable() {
    if (password.length < MIN_PASSWORD_LENGTH) {
      setValidationError(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      );
      return;
    }

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }

    setValidationError(null);
    mutation.mutate(
      { action: "enable", password },
      {
        onSuccess: () => resetDrafts(),
      },
    );
  }

  function change() {
    if (!changeCurrentPassword) {
      setValidationError("Current password is required.");
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setValidationError(
        `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      );
      return;
    }

    if (password !== confirmPassword) {
      setValidationError("New passwords do not match.");
      return;
    }

    setValidationError(null);
    mutation.mutate(
      {
        action: "change",
        currentPassword: changeCurrentPassword,
        password,
      },
      {
        onSuccess: () => resetDrafts(),
      },
    );
  }

  function disable() {
    if (!disableCurrentPassword) {
      setValidationError("Current password is required to remove app lock.");
      return;
    }

    setValidationError(null);
    mutation.mutate(
      { action: "disable", currentPassword: disableCurrentPassword },
      {
        onSuccess: () => resetDrafts(),
      },
    );
  }

  return {
    appLockEnabled,
    changeCurrentPassword,
    confirmPassword,
    disableCurrentPassword,
    errorMessage:
      validationError ??
      (mutation.error instanceof Error ? mutation.error.message : null),
    isPending: mutation.isPending,
    password,
    setChangeCurrentPassword,
    setConfirmPassword,
    setDisableCurrentPassword,
    setPassword,
    enable,
    change,
    disable,
  };
}
