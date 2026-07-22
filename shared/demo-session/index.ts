/**
 * @file shared/demo-session/index.ts
 * Public exports for the demo session client context.
 */

export {
  DemoSessionContext,
  type DemoSessionContextValue,
} from "@/shared/demo-session/model/demo-session-context";
export { useDemoSession, useDemoMonthParseOptions } from "@/shared/demo-session/model/use-demo-session";
export type { DemoMonthParseOptions } from "@/shared/demo-session/model/use-demo-session";
export {
  DemoSessionProvider,
  type DemoSessionProviderProps,
} from "@/shared/demo-session/ui/demo-session-provider";
