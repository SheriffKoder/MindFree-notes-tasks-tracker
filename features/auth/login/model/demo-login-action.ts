/**
 * @file features/auth/login/model/demo-login-action.ts
 * Server action for env-gated demo sign-in (credentials never sent from the client).
 */

"use server";

import { login } from "@/features/auth/login/model/login-action";
import { getDemoLoginCredentials } from "@/shared/lib/auth/demo-login-config";
import { redirect } from "next/navigation";

/**
 * Signs in with server-configured demo credentials when demo login is enabled.
 *
 * @param formData - submitted demo form (`next` only; credentials come from env)
 */
export async function submitDemoLoginForm(formData: FormData): Promise<void> {
  const credentials = getDemoLoginCredentials();

  if (!credentials) {
    redirect("/login?error=demo_unavailable");
  }

  const demoFormData = new FormData();
  demoFormData.set("email", credentials.email);
  demoFormData.set("password", credentials.password);
  demoFormData.set("next", formData.get("next") ?? "/");

  await login(demoFormData);
}
