/**
 * @file app/(auth)/login/page.tsx
 * Login route that renders the basic auth shell for guests.
 */

import { LoginForm } from "@/features/auth/login";

/**
 * Renders the login page shell for the public auth route group.
 *
 * @returns Centered login experience for guests
 */
export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-h1">MindFree</h1>
          <p className="text-body-muted">
            Clear your mind and return to what matters.
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
