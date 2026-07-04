/**
 * @file app/(auth)/signup/page.tsx
 * Signup route that renders the basic auth shell for new users.
 */

import { Suspense } from "react";

import {
  getAuthPageNotice,
  getSafeNextPath,
  type SearchParamsRecord,
} from "@/features/auth/model/auth-notice";
import { SignupForm } from "@/features/auth/signup";

/**
 * Resolves request-time signup form state from the current search params.
 *
 * @param props - page search params from the current request
 * @returns Signup form with request-aware notice and redirect state
 */
async function SignupPageContent({
  searchParams,
}: {
  searchParams: Promise<SearchParamsRecord>;
}) {
  const resolvedSearchParams = await searchParams;
  const nextPath = getSafeNextPath(resolvedSearchParams.next);
  const notice = getAuthPageNotice(resolvedSearchParams, "signup");

  return <SignupForm nextPath={nextPath} notice={notice} />;
}

/**
 * Renders the signup page shell for the public auth route group.
 *
 * @param props - page search params from the current request
 * @returns Centered signup experience for new users
 */
export default function SignupPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsRecord>;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-h1">MindFree</h1>
          <p className="text-body-muted">
            Create your account to start capturing notes and tracking progress.
          </p>
        </div>

        <Suspense fallback={<SignupForm />}>
          <SignupPageContent searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
