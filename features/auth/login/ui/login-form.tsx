/**
 * @file features/auth/login/ui/login-form.tsx
 * Login feature form shell that renders the auth UI and delegates form state to the feature hook.
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
import type { AuthNotice } from "@/features/auth/model/auth-notice";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleSignInButton } from "@/features/auth/google-sign-in";
import { submitLoginForm } from "@/features/auth/login/model/login-action";
import { useLoginForm } from "@/features/auth/login/model/use-login-form";
import { DemoLoginButton } from "@/features/auth/login/ui/demo-login-button";
import { AuthNoticeBanner } from "@/features/auth/ui/auth-notice-banner";

/**
 * Props for the login form shell.
 */
interface LoginFormProps {
  /** Protected destination to return to after a successful sign-in. */
  nextPath?: string;
  /** Optional auth redirect or fallback notice rendered above the form. */
  notice?: AuthNotice | null;
  /** When true, renders the env-gated Try Demo control. */
  demoLoginEnabled?: boolean;
}

/**
 * Renders the login page shell with the email and password sign-in flow.
 *
 * @param props - login form configuration
 * @returns Login form shell for the `/login` route
 */
export function LoginForm({
  nextPath = "/",
  notice = null,
  demoLoginEnabled = false,
}: LoginFormProps) {
  // Delegate RHF, Zod, and server action orchestration to the feature hook.
  const { errors, isPending, onSubmit, register, serverErrorMessage } =
    useLoginForm({
      nextPath,
    });

  // Preserve the original protected destination when switching to signup.
  const signupHref =
    nextPath === "/" ? "/signup" : { pathname: "/signup", query: { next: nextPath } };

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
        {notice ? <AuthNoticeBanner notice={notice} /> : null}

        <form
          action={submitLoginForm}
          className="flex flex-col gap-5"
          method="post"
          noValidate
          onSubmit={onSubmit}
        >
          <input name="next" type="hidden" value={nextPath} />

          <div className="flex flex-col gap-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              autoComplete="email"
              id="login-email"
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
            <Label htmlFor="login-password">Password</Label>
            <Input
              autoComplete="current-password"
              id="login-password"
              placeholder="Enter your password"
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
            {isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        {serverErrorMessage ? (
          <p className="text-caption [color:var(--color-error)]" role="alert">
            {serverErrorMessage}
          </p>
        ) : null}

        <div className="flex flex-col gap-4 pt-1 ">
          {demoLoginEnabled ? <DemoLoginButton nextPath={nextPath} /> : null}

          <GoogleSignInButton
            errorRedirectPath="/login"
            nextPath={nextPath}
          />

          <p className="text-caption">
            Google sign-in starts the OAuth flow and returns here after callback setup.
          </p>
        </div>
      </CardContent>

      <CardFooter className="justify-center border-t border-border pt-6">
        <p className="text-body-muted">
          Don&apos;t have an account?{" "}
          <Link className="font-medium [color:var(--color-fg)] underline" href={signupHref}>
            Create one
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
