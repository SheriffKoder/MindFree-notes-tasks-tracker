/**
 * @file app/(auth)/login/page.tsx
 * Login route that renders the basic auth shell for guests.
 */

import { Suspense } from "react";

import {
  getAuthPageNotice,
  getSafeNextPath,
  type SearchParamsRecord,
} from "@/features/auth/model/auth-notice";
import { LoginForm } from "@/features/auth/login";
import { isDemoLoginConfigured } from "@/shared/lib/auth/demo-login-config";

/**
 * Resolves request-time login form state from the current search params.
 *
 * @param props - page search params from the current request
 * @returns Login form with request-aware notice and redirect state
 */
async function LoginPageContent({
  searchParams,
}: {
  searchParams: Promise<SearchParamsRecord>;
}) {
  const resolvedSearchParams = await searchParams;
  const nextPath = getSafeNextPath(resolvedSearchParams.next);
  const notice = getAuthPageNotice(resolvedSearchParams, "login");
  const demoLoginEnabled = isDemoLoginConfigured();

  return (
    <LoginForm
      demoLoginEnabled={demoLoginEnabled}
      nextPath={nextPath}
      notice={notice}
    />
  );
}

/**
 * Renders the login page shell for the public auth route group.
 *
 * @param props - page search params from the current request
 * @returns Centered login experience for guests
 */
export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsRecord>;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-h1">MindFree</h1>
          <p className="page-header__subtitle">
            Clear your mind and return to what matters.
          </p>
        </div>

        <Suspense fallback={<LoginForm />}>
          <LoginPageContent searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
