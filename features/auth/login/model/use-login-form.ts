/**
 * @file features/auth/login/model/use-login-form.ts
 * Client hook that wires the login form to React Hook Form, Zod, and the login server action.
 */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { createLoginSubmitHandler } from "@/features/auth/login/model/login-submit-handler";
import { loginSchema, type LoginSchema } from "@/features/auth/login/model/login-schema";

/**
 * Configuration for the login form hook.
 */
interface UseLoginFormOptions {
  /** Protected destination to return to after a successful sign-in. */
  nextPath?: string;
}

/**
 * Builds the login form state and submit handler for the auth UI.
 *
 * @param options - login form configuration
 * @returns RHF bindings, pending state, and inline server error state
 */
export function useLoginForm({ nextPath = "/" }: UseLoginFormOptions) {
  // Render server-side auth failures inline above the secondary actions.
  const [serverErrorMessage, setServerErrorMessage] = useState<string | null>(
    null,
  );

  // Wire client-side form validation to the login Zod schema.
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Build the submit handler in a dedicated model file to keep the hook focused.
  const submitLoginForm = createLoginSubmitHandler({
    nextPath,
    clearErrors,
    setError,
    setServerErrorMessage,
  });

  // Connect the extracted submit handler to RHF.
  const onSubmit = handleSubmit(submitLoginForm);

  // Return the form API consumed by the login UI shell.
  return {
    errors,
    isPending: isSubmitting,
    onSubmit,
    register,
    serverErrorMessage,
  };
}
