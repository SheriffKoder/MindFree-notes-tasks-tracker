/**
 * @file features/auth/logout/ui/logout-button.tsx
 * Sign-out button that submits to the logout server action.
 */

"use client";

import { LogOut } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { logout } from "@/features/auth/logout/model/logout-action";

/**
 * Renders the pending-aware submit button used by the logout form.
 *
 * @returns Submit button for the logout action
 */
function LogoutSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit" variant="outline">
      <LogOut />
      {pending ? "Signing out..." : "Sign out"}
    </Button>
  );
}

/**
 * Renders the logout form for authenticated areas of the app.
 *
 * @returns Form-wrapped logout trigger button
 */
export function LogoutButton() {
  return (
    <form action={logout}>
      <LogoutSubmitButton />
    </form>
  );
}
