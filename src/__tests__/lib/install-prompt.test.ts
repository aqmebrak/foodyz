import { describe, expect, it } from "vitest";

import { getInstallMode } from "@/lib/install-prompt";

const IPHONE_SAFARI =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
const IPHONE_CHROME =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0 Mobile/15E148 Safari/604.1";
const DESKTOP_FIREFOX = "Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0";

const base = { standalone: false, hasPrompt: false, userAgent: DESKTOP_FIREFOX, dismissed: false };

describe("getInstallMode", () => {
  it("none when already standalone", () => {
    expect(getInstallMode({ ...base, standalone: true, hasPrompt: true })).toBe("none");
  });
  it("none when dismissed", () => {
    expect(getInstallMode({ ...base, dismissed: true, hasPrompt: true })).toBe("none");
  });
  it("prompt when the browser offered an install prompt", () => {
    expect(getInstallMode({ ...base, hasPrompt: true })).toBe("prompt");
  });
  it("ios-hint on iPhone Safari without a prompt", () => {
    expect(getInstallMode({ ...base, userAgent: IPHONE_SAFARI })).toBe("ios-hint");
  });
  it("none on iOS Chrome", () => {
    expect(getInstallMode({ ...base, userAgent: IPHONE_CHROME })).toBe("none");
  });
  it("none on desktop Firefox", () => {
    expect(getInstallMode(base)).toBe("none");
  });
});
