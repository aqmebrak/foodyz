export type InstallMode = "none" | "prompt" | "ios-hint";

interface InstallModeInput {
  standalone: boolean;
  hasPrompt: boolean;
  userAgent: string;
  dismissed: boolean;
}

/** iOS has no install prompt API: only Safari can add to home screen, via the Share sheet. */
function isIosSafari(ua: string): boolean {
  return /iPhone|iPad|iPod/.test(ua) && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
}

export function getInstallMode({ standalone, hasPrompt, userAgent, dismissed }: InstallModeInput): InstallMode {
  if (standalone || dismissed) return "none";
  if (hasPrompt) return "prompt";
  if (isIosSafari(userAgent)) return "ios-hint";
  return "none";
}
