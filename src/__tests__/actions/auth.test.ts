import { beforeEach, describe, expect, it, vi } from "vitest";

import { loginAction, logoutAction } from "@/actions/auth";

// next-auth can't be resolved under vitest's node ESM loader; the action only needs AuthError + its `type`.
vi.mock("next-auth", () => {
  class AuthError extends Error {
    type = "AuthError";
  }
  class CredentialsSignin extends AuthError {
    type = "CredentialsSignin";
  }
  return { AuthError, CredentialsSignin };
});
vi.mock("next/headers", () => ({ headers: vi.fn() }));
vi.mock("@/lib/auth", () => ({ signIn: vi.fn(), signOut: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: vi.fn() }));

const { AuthError, CredentialsSignin } = await import("next-auth");
const { headers } = await import("next/headers");
const { signIn, signOut } = await import("@/lib/auth");
const { checkRateLimit } = await import("@/lib/rate-limit");

function form(email = "a@b.c", password = "pw") {
  const fd = new FormData();
  fd.set("email", email);
  fd.set("password", password);
  return fd;
}

function setIp(value: string | null) {
  vi.mocked(headers).mockResolvedValue(
    new Headers(value ? { "x-forwarded-for": value } : {}) as never,
  );
}

beforeEach(() => {
  vi.resetAllMocks();
  setIp("1.2.3.4, 10.0.0.1");
  vi.mocked(checkRateLimit).mockReturnValue({ allowed: true, retryAfterMs: 0 });
});

describe("loginAction", () => {
  it("signs in with credentials and redirects to /recipes", async () => {
    expect(await loginAction(null, form("me@x.io", "secret"))).toBeNull();
    expect(signIn).toHaveBeenCalledWith("credentials", {
      email: "me@x.io",
      password: "secret",
      redirectTo: "/recipes",
    });
  });

  it("rate-limits on the first IP of x-forwarded-for", async () => {
    await loginAction(null, form());
    expect(checkRateLimit).toHaveBeenCalledWith("login:1.2.3.4");
  });

  it("falls back to an 'unknown' key without x-forwarded-for", async () => {
    setIp(null);
    await loginAction(null, form());
    expect(checkRateLimit).toHaveBeenCalledWith("login:unknown");
  });

  it("blocks without calling signIn when rate limited (rounds minutes up)", async () => {
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: false, retryAfterMs: 61_000 });
    expect(await loginAction(null, form())).toBe(
      "Too many login attempts. Please try again in 2 minutes.",
    );
    expect(signIn).not.toHaveBeenCalled();
  });

  it("uses singular 'minute' when exactly one minute remains", async () => {
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: false, retryAfterMs: 60_000 });
    expect(await loginAction(null, form())).toBe(
      "Too many login attempts. Please try again in 1 minute.",
    );
  });

  it("maps CredentialsSignin to an invalid-credentials message", async () => {
    vi.mocked(signIn).mockRejectedValue(new CredentialsSignin());
    expect(await loginAction(null, form())).toBe("Invalid email or password.");
  });

  it("maps other AuthErrors to a generic message", async () => {
    vi.mocked(signIn).mockRejectedValue(new AuthError("boom"));
    expect(await loginAction(null, form())).toBe("Something went wrong. Please try again.");
  });

  it("re-throws non-auth errors (Next.js redirects)", async () => {
    const redirect = new Error("NEXT_REDIRECT");
    vi.mocked(signIn).mockRejectedValue(redirect);
    await expect(loginAction(null, form())).rejects.toBe(redirect);
  });
});

describe("logoutAction", () => {
  it("signs out and redirects to /login", async () => {
    await logoutAction();
    expect(signOut).toHaveBeenCalledWith({ redirectTo: "/login" });
  });
});
