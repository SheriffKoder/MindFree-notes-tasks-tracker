/**
 * @file features/auth/signup/ui/signup-form.tsx
 * Signup feature shell that renders the basic account creation card for the auth route group.
 */

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Renders the basic signup page shell before auth actions are wired.
 *
 * @returns Static signup form shell for the `/signup` route
 */
export function SignupForm() {
  return (
    <Card className="app-card w-full max-w-md">
      <CardHeader className="flex flex-col gap-2">
        <CardTitle className="text-h2">Create your account</CardTitle>
        <CardDescription className="text-body-muted">
          Start using MindFree to organize notes, tasks, reminders, and weekly
          progress.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <form className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              autoComplete="email"
              id="signup-email"
              name="email"
              placeholder="you@example.com"
              type="email"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="signup-password">Password</Label>
            <Input
              autoComplete="new-password"
              id="signup-password"
              name="password"
              placeholder="Create a password"
              type="password"
            />
          </div>

          <Button className="mt-1 w-full" disabled type="button">
            Create account
          </Button>
        </form>

        <div className="flex flex-col gap-4 pt-1">
          <Button className="w-full" disabled type="button" variant="outline">
            Continue with Google
          </Button>

          <p className="text-caption">
            Signup and confirmation flows will be wired in the next auth steps.
          </p>
        </div>
      </CardContent>

      <CardFooter className="justify-center border-t border-border pt-6">
        <p className="text-body-muted">
          Already have an account?{" "}
          <Link
            className="font-medium [color:var(--color-fg)] underline"
            href="/login"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
