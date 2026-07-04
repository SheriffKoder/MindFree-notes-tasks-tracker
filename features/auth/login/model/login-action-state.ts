/**
 * @file features/auth/login/model/login-action-state.ts
 * Shared login action result used by the client form and server action.
 */

/**
 * Form state returned by the login server action.
 */
export interface LoginActionState {
  /** Inline error shown on the login screen when sign-in fails. */
  errorMessage: string | null;
}
