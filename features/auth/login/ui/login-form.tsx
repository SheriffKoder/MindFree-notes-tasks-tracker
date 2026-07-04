/**
 * @file features/auth/login/ui/login-form.tsx
 * Login feature shell that renders the basic sign-in card for the auth route group.
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
 * Renders the basic login page shell before auth actions are wired.
 *
 * @returns Static login form shell for the `/login` route
 */
export function LoginForm() {
  return (
    <Card className="app-card w-full max-w-md">
      <CardHeader className="flex flex-col gap-2">
        <CardTitle className="text-h2">Welcome back</CardTitle>
        <CardDescription className="text-body-muted">
          Sign in to MindFree to access your notes, tasks, reminders, and
          progress.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <form className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              autoComplete="email"
              id="login-email"
              name="email"
              placeholder="you@example.com"
              type="email"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              autoComplete="current-password"
              id="login-password"
              name="password"
              placeholder="Enter your password"
              type="password"
            />
          </div>

          <Button className="mt-1 w-full" disabled type="button">
            Sign in
          </Button>
        </form>

        <div className="flex flex-col gap-4 pt-1 ">
          <Button className="w-full" disabled type="button" variant="outline">
            Continue with Google
          </Button>

          <p className="text-caption">
            Login actions will be wired in the next auth steps.
          </p>
        </div>
      </CardContent>

      <CardFooter className="justify-center border-t border-border pt-6">
        <p className="text-body-muted">
          Don&apos;t have an account?{" "}
          <Link
            className="font-medium [color:var(--color-fg)] underline"
            href="/signup"
          >
            Create one
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
