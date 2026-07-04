/**
 * @file features/auth/signup/model/use-signup-form.ts
 * Client hook that wires the signup form to React Hook Form, Zod, and the signup server action.
 */

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { createSignupSubmitHandler } from "@/features/auth/signup/model/signup-submit-handler";
import { signupSchema, type SignupSchema } from "@/features/auth/signup/model/signup-schema";

/**
 * Builds the signup form state and submit handler for the auth UI.
 *
 * @returns RHF bindings, pending state, and inline server feedback
 */
export function useSignupForm() {
  // Track the in-flight server action state for the submit button.
  const [isPending, startTransition] = useTransition();

  // Show inline server feedback for success and error outcomes.
  const [serverErrorMessage, setServerErrorMessage] = useState<string | null>(
    null,
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Wire client-side form validation to the signup Zod schema.
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    reset,
  } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Build the submit handler in a dedicated model file to keep the hook focused.
  const submitSignupForm = createSignupSubmitHandler({
    clearErrors,
    setError,
    reset,
    setServerErrorMessage,
    setSuccessMessage,
    startTransition,
  });

  // Connect the extracted submit handler to RHF.
  const onSubmit = handleSubmit(submitSignupForm);

  // Return the form API consumed by the signup UI shell.
  return {
    errors,
    isPending,
    onSubmit,
    register,
    serverErrorMessage,
    successMessage,
  };
}
