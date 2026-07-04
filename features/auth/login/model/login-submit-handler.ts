/**
 * @file features/auth/login/model/login-submit-handler.ts
 * Submit handler factory for the login form hook.
 */

import type { Dispatch, SetStateAction } from "react";
import type { UseFormClearErrors, UseFormSetError } from "react-hook-form";

import { login } from "@/features/auth/login/model/login-action";
import type { LoginSchema } from "@/features/auth/login/model/login-schema";

/**
 * Dependencies required to build the login submit handler.
 */
interface CreateLoginSubmitHandlerOptions {
  /** Protected destination to return to after a successful sign-in. */
  nextPath: string;
  /** RHF helper used to clear previous root-level server errors. */
  clearErrors: UseFormClearErrors<LoginSchema>;
  /** RHF helper used to push server errors back into the form state. */
  setError: UseFormSetError<LoginSchema>;
  /** Setter for the inline server error message rendered by the form. */
  setServerErrorMessage: Dispatch<SetStateAction<string | null>>;
  /** React transition starter used to keep the submit responsive. */
  startTransition: (callback: () => void) => void;
}

/**
 * Builds the login submit handler used by `handleSubmit`.
 *
 * @param options - dependencies needed to submit and reflect login state
 * @returns Submit handler for validated login form values
 */
export function createLoginSubmitHandler({
  nextPath,
  clearErrors,
  setError,
  setServerErrorMessage,
  startTransition,
}: CreateLoginSubmitHandlerOptions) {
  return function submitLoginForm(values: LoginSchema) {
    // Convert the validated values into FormData for the server action.
    const formData = new FormData();
    formData.set("email", values.email);
    formData.set("password", values.password);
    formData.set("next", nextPath);

    // Reset any previous server-side error state before a new attempt.
    clearErrors("root");
    setServerErrorMessage(null);

    // Run the server action inside a transition to keep the UI responsive.
    startTransition(function startLoginTransition() {
      void (async function runLoginAction() {
        const result = await login(formData);

        // Push the server failure back into both local and RHF state.
        if (result.errorMessage) {
          setServerErrorMessage(result.errorMessage);
          setError("root", {
            type: "server",
            message: result.errorMessage,
          });
        }
      })();
    });
  };
}
