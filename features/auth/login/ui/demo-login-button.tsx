/**
 * @file features/auth/login/ui/demo-login-button.tsx
 * Demo sign-in button that submits to the env-gated demo server action.
 */

"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { submitDemoLoginForm } from "@/features/auth/login/model/demo-login-action";

/**
 * Props for the demo login button component.
 */
export interface DemoLoginButtonProps {
  /** Protected destination to return to after a successful sign-in. */
  nextPath?: string;
}

/**
 * Renders the submit button label while the demo login action is running.
 *
 * @returns Pending-aware demo login button
 */
function DemoLoginSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" disabled={pending} type="submit" variant="outline">
      {pending ? "Signing in..." : "Try Demo"}
    </Button>
  );
}

/**
 * Renders a demo login form that signs in with the shared demo account.
 *
 * @param props - demo login configuration
 * @returns Demo login trigger wrapped in a small action form
 */
export function DemoLoginButton({ nextPath = "/" }: DemoLoginButtonProps) {
  return (
    <form action={submitDemoLoginForm} method="post">
      <input name="next" type="hidden" value={nextPath} />
      <DemoLoginSubmitButton />
    </form>
  );
}
