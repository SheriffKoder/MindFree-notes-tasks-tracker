/**
 * @file features/auth/signup/model/signup-submit-handler.ts
 * Submit handler factory for the signup form hook.
 */

import type { Dispatch, SetStateAction } from "react";
import type {
  UseFormClearErrors,
  UseFormReset,
  UseFormSetError,
} from "react-hook-form";

import { signup } from "@/features/auth/signup/model/signup-action";
import type { SignupSchema } from "@/features/auth/signup/model/signup-schema";

/**
 * Dependencies required to build the signup submit handler.
 */
interface CreateSignupSubmitHandlerOptions {
  /** RHF helper used to clear previous root-level server errors. */
  clearErrors: UseFormClearErrors<SignupSchema>;
  /** RHF helper used to push server errors back into the form state. */
  setError: UseFormSetError<SignupSchema>;
  /** RHF helper used to reset the form after a successful signup. */
  reset: UseFormReset<SignupSchema>;
  /** Setter for the inline server error message rendered by the form. */
  setServerErrorMessage: Dispatch<SetStateAction<string | null>>;
  /** Setter for the inline success message rendered by the form. */
  setSuccessMessage: Dispatch<SetStateAction<string | null>>;
  /** React transition starter used to keep the submit responsive. */
  startTransition: (callback: () => void) => void;
}

/**
 * Builds the signup submit handler used by `handleSubmit`.
 *
 * @param options - dependencies needed to submit and reflect signup state
 * @returns Submit handler for validated signup form values
 */
export function createSignupSubmitHandler({
  clearErrors,
  setError,
  reset,
  setServerErrorMessage,
  setSuccessMessage,
  startTransition,
}: CreateSignupSubmitHandlerOptions) {
  return function submitSignupForm(values: SignupSchema) {
    // Convert the validated values into FormData for the server action.
    const formData = new FormData();
    formData.set("email", values.email);
    formData.set("password", values.password);

    // Reset any previous server-side feedback before a new attempt.
    clearErrors("root");
    setServerErrorMessage(null);
    setSuccessMessage(null);

    // Run the server action inside a transition to keep the UI responsive.
    startTransition(function startSignupTransition() {
      void (async function runSignupAction() {
        const result = await signup(formData);

        // Push the server failure back into both local and RHF state.
        if (result.errorMessage) {
          setServerErrorMessage(result.errorMessage);
          setError("root", {
            type: "server",
            message: result.errorMessage,
          });
          return;
        }

        // Clear the form and show the confirmation success message.
        reset();
        setSuccessMessage(result.successMessage);
      })();
    });
  };
}
