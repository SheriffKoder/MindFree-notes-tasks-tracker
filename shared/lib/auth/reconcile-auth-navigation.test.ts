/**
 * @file shared/lib/auth/reconcile-auth-navigation.test.ts
 * Session ↔ URL reconcile helper.
 */

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildSessionExpiryLoginUrl,
  isAuthEntryPath,
  reconcileAuthNavigation,
  resetAuthNavigationLockForTests,
  resolvePostLoginAppPath,
} from "@/shared/lib/auth/reconcile-auth-navigation";

describe("isAuthEntryPath", () => {
  it("matches login and signup", () => {
    expect(isAuthEntryPath("/login")).toBe(true);
    expect(isAuthEntryPath("/signup")).toBe(true);
    expect(isAuthEntryPath("/notes")).toBe(false);
  });
});

describe("buildSessionExpiryLoginUrl", () => {
  it("builds login URL with session_missing and encoded next", () => {
    expect(buildSessionExpiryLoginUrl("/notes?month=2026-07")).toBe(
      "/login?error=session_missing&next=%2Fnotes%3Fmonth%3D2026-07",
    );
  });
});

describe("resolvePostLoginAppPath", () => {
  it("prefers an explicit next path", () => {
    expect(resolvePostLoginAppPath("/tasks")).toBe("/tasks");
  });
});

describe("reconcileAuthNavigation", () => {
  afterEach(() => {
    resetAuthNavigationLockForTests();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("redirects to login when session is gone on an app route", () => {
    const assign = vi.fn();
    vi.stubGlobal("window", { location: { assign } });

    expect(
      reconcileAuthNavigation({
        hasSession: false,
        pathname: "/notes",
        search: "?month=2026-07",
        reason: "SIGNED_OUT",
      }),
    ).toBe(true);

    expect(assign).toHaveBeenCalledWith(
      "/login?error=session_missing&next=%2Fnotes%3Fmonth%3D2026-07",
    );
  });

  it("redirects into the app when session exists on login", () => {
    const assign = vi.fn();
    vi.stubGlobal("window", { location: { assign } });

    expect(
      reconcileAuthNavigation({
        hasSession: true,
        pathname: "/login",
        search: "?next=%2Ftasks",
        reason: "SIGNED_IN",
      }),
    ).toBe(true);

    expect(assign).toHaveBeenCalledWith("/tasks");
  });

  it("no-ops when session and URL already agree", () => {
    const assign = vi.fn();
    vi.stubGlobal("window", { location: { assign } });

    expect(
      reconcileAuthNavigation({
        hasSession: false,
        pathname: "/login",
        search: "",
      }),
    ).toBe(false);

    expect(
      reconcileAuthNavigation({
        hasSession: true,
        pathname: "/",
        search: "",
      }),
    ).toBe(false);

    expect(assign).not.toHaveBeenCalled();
  });

  it("navigates at most once", () => {
    const assign = vi.fn();
    vi.stubGlobal("window", { location: { assign } });

    expect(
      reconcileAuthNavigation({
        hasSession: false,
        pathname: "/",
        search: "",
      }),
    ).toBe(true);
    expect(
      reconcileAuthNavigation({
        hasSession: false,
        pathname: "/",
        search: "",
      }),
    ).toBe(false);

    expect(assign).toHaveBeenCalledTimes(1);
  });
});
