/**
 * @file features/auth/signup/model/signup-action-state.ts
 * Shared signup action result used by the client form and server action.
 */

/**
 * Result returned by the signup server action.
 */
export interface SignupActionState {
  /** Inline error shown on the signup screen when account creation fails. */
  errorMessage: string | null;
  /** Success message shown after the confirmation email is sent. */
  successMessage: string | null;
}
