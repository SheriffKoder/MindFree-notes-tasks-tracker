/**
 * @file views/home/model/home-aside-drawer-context.tsx
 * Isolated open state for the Home right aside mobile drawer.
 *
 * Purpose: Share drawer control without re-rendering server page content.
 * Used in: views/home/ui/home-right-aside.tsx, home-aside-drawer-trigger.tsx
 */

"use client";

import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

const HomeAsideOpenContext = createContext(false);

const HomeAsideDispatchContext = createContext<
  Dispatch<SetStateAction<boolean>> | undefined
>(undefined);

export interface HomeAsideShellProps {
  children: ReactNode;
}

/**
 * Client boundary — keeps drawer toggle state out of the server page tree.
 * Server `children` are not re-fetched when `open` changes.
 */
export function HomeAsideShell({ children }: HomeAsideShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <HomeAsideDispatchContext.Provider value={setOpen}>
      <HomeAsideOpenContext.Provider value={open}>
        {children}
      </HomeAsideOpenContext.Provider>
    </HomeAsideDispatchContext.Provider>
  );
}

/** Subscribes to drawer visibility — only aside/drawer islands should use this. */
export function useHomeAsideOpen(): boolean {
  return useContext(HomeAsideOpenContext);
}

/** Stable setter — safe for trigger buttons; does not re-render when `open` toggles. */
export function useHomeAsideDispatch(): Dispatch<SetStateAction<boolean>> {
  const dispatch = useContext(HomeAsideDispatchContext);

  if (!dispatch) {
    throw new Error("useHomeAsideDispatch must be used within HomeAsideShell");
  }

  return dispatch;
}
