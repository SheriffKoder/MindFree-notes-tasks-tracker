/**
 * @file features/auth/signup/ui/signup-form.tsx
 * Signup feature form shell that renders the auth UI and delegates form state to the feature hook.
 */

"use client";

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
import { GoogleSignInButton } from "@/features/auth/google-sign-in";
import { useSignupForm } from "@/features/auth/signup/model/use-signup-form";

/**
 * Renders the signup page shell with the email and password signup flow.
 *
 * @returns Static signup form shell for the `/signup` route
 */
export function SignupForm() {
  // Delegate RHF, Zod, and server action orchestration to the feature hook.
  const {
    errors,
    isPending,
    onSubmit,
    register,
    serverErrorMessage,
    successMessage,
  } = useSignupForm();

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
        <form className="flex flex-col gap-5" noValidate onSubmit={onSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              autoComplete="email"
              id="signup-email"
              placeholder="you@example.com"
              type="email"
              {...register("email")}
            />
            {errors.email?.message ? (
              <p className="text-caption [color:var(--color-error)]" role="alert">
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="signup-password">Password</Label>
            <Input
              autoComplete="new-password"
              id="signup-password"
              placeholder="Create a password"
              type="password"
              {...register("password")}
            />
            {errors.password?.message ? (
              <p className="text-caption [color:var(--color-error)]" role="alert">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          <Button className="mt-1 w-full" disabled={isPending} type="submit">
            {isPending ? "Creating account..." : "Create account"}
          </Button>
        </form>

        {serverErrorMessage ? (
          <p className="text-caption [color:var(--color-error)]" role="alert">
            {serverErrorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p className="text-caption [color:var(--color-success)]" role="status">
            {successMessage}
          </p>
        ) : null}

        <div className="flex flex-col gap-4 pt-1">
          <GoogleSignInButton errorRedirectPath="/signup" />

          <p className="text-caption">
            Google sign-in starts the OAuth flow and returns here after callback setup.
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
