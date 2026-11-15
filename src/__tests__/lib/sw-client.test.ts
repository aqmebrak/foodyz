import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { clearOfflineCaches, registerServiceWorker } from "@/lib/sw-client";

describe("registerServiceWorker", () => {
  const register = vi.fn().mockResolvedValue({});

  beforeEach(() => {
    register.mockClear();
    vi.stubGlobal("navigator", { serviceWorker: { register } });
  });
  afterEach(() => vi.unstubAllEnvs());

  it("does nothing outside production", async () => {
    vi.stubEnv("NODE_ENV", "development");
    await registerServiceWorker();
    expect(register).not.toHaveBeenCalled();
  });

  it("registers /sw.js in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await registerServiceWorker();
    expect(register).toHaveBeenCalledWith("/sw.js");
  });

  it("does not throw when registration fails", async () => {
    vi.stubEnv("NODE_ENV", "production");
    register.mockRejectedValueOnce(new Error("nope"));
    await expect(registerServiceWorker()).resolves.toBeUndefined();
  });
});

describe("clearOfflineCaches", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("deletes only foodyz- caches", async () => {
    const del = vi.fn().mockResolvedValue(true);
    vi.stubGlobal("caches", {
      keys: vi.fn().mockResolvedValue(["foodyz-pages-v1", "other", "foodyz-shell-v1"]),
      delete: del,
    });
    await clearOfflineCaches();
    expect(del).toHaveBeenCalledTimes(2);
    expect(del).toHaveBeenCalledWith("foodyz-pages-v1");
    expect(del).toHaveBeenCalledWith("foodyz-shell-v1");
    expect(del).not.toHaveBeenCalledWith("other");
  });

  it("never throws when caches is undefined", async () => {
    vi.stubGlobal("caches", undefined);
    await expect(clearOfflineCaches()).resolves.toBeUndefined();
  });
});
