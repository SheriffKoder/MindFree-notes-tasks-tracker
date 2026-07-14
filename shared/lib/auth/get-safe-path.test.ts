import { describe, expect, it } from "vitest";

import { getSafeAppPath, getSafePath } from "@/shared/lib/auth/get-safe-path";

describe("getSafePath", () => {
  it("allows normal in-app paths", () => {
    expect(getSafePath("/notes", "/")).toBe("/notes");
    expect(getSafePath("/notes?view=calendar", "/")).toBe("/notes?view=calendar");
  });

  it("blocks protocol-relative open redirects", () => {
    expect(getSafePath("//evil.com", "/")).toBe("/");
    expect(getSafePath("//evil.com/phish", "/login")).toBe("/login");
  });

  it("blocks absolute and non-path values", () => {
    expect(getSafePath("https://evil.com", "/")).toBe("/");
    expect(getSafePath("evil.com", "/")).toBe("/");
    expect(getSafePath("", "/")).toBe("/");
    expect(getSafePath(null, "/")).toBe("/");
    expect(getSafePath(undefined, "/tasks")).toBe("/tasks");
  });
});

describe("getSafeAppPath", () => {
  it("falls back when the target is an auth page", () => {
    expect(getSafeAppPath("/login", "/")).toBe("/");
    expect(getSafeAppPath("/signup", "/notes")).toBe("/notes");
  });

  it("still blocks open redirects", () => {
    expect(getSafeAppPath("//evil.com", "/")).toBe("/");
  });
});
