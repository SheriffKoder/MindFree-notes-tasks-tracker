/**
 * @file features/auth/login/ui/demo-login-button.tsx
 * Demo sign-in button that submits to the login server action via a native form.
 */

"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { submitLoginForm } from "@/features/auth/login/model/login-action";

/** Credentials for the public demo account. */
const DEMO_EMAIL = "demo@example.com";
const DEMO_PASSWORD = "password";

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
    <form action={submitLoginForm} method="post">
      <input name="email" type="hidden" value={DEMO_EMAIL} />
      <input name="password" type="hidden" value={DEMO_PASSWORD} />
      <input name="next" type="hidden" value={nextPath} />
      <DemoLoginSubmitButton />
    </form>
  );
}
