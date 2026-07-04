/**
 * @file app/(auth)/signup/page.tsx
 * Signup route that renders the basic auth shell for new users.
 */

import { SignupForm } from "@/features/auth/signup";

/**
 * Renders the signup page shell for the public auth route group.
 *
 * @returns Centered signup experience for new users
 */
export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-h1">MindFree</h1>
          <p className="text-body-muted">
            Create your account to start capturing notes and tracking progress.
          </p>
        </div>

        <SignupForm />
      </div>
    </main>
  );
}
