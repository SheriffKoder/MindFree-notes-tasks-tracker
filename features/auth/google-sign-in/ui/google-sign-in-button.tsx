/**
 * @file features/auth/google-sign-in/ui/google-sign-in-button.tsx
 * Google sign-in button that submits to the OAuth server action.
 */

"use client";

import { Chrome } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/features/auth/google-sign-in/model/google-sign-in-action";

/**
 * Props for the Google sign-in button component.
 */
export interface GoogleSignInButtonProps {
  /** Protected destination to return to after a successful sign-in. */
  nextPath?: string;
  /** Auth page to redirect back to if the OAuth action fails. */
  errorRedirectPath?: string;
}

/**
 * Renders the submit button label while the OAuth action is starting.
 *
 * @returns Pending-aware Google sign-in button
 */
function GoogleSignInSubmitButton() {
  // Read the current form submission state from the surrounding form.
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" disabled={pending} type="submit" variant="outline">
      <Chrome />
      {pending ? "Redirecting to Google..." : "Continue with Google"}
    </Button>
  );
}

/**
 * Renders a Google sign-in form that starts the OAuth server action.
 *
 * @param props - Google sign-in configuration
 * @returns OAuth trigger button wrapped in a small action form
 */
export function GoogleSignInButton({
  nextPath = "/",
  errorRedirectPath = "/login",
}: GoogleSignInButtonProps) {
  return (
    <form action={signInWithGoogle}>
      <input name="next" type="hidden" value={nextPath} />
      <input name="errorRedirect" type="hidden" value={errorRedirectPath} />
      <GoogleSignInSubmitButton />
    </form>
  );
}
