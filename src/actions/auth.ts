"use server";

import { headers } from "next/headers";
import { AuthError } from "next-auth";

import { signIn, signOut } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function loginAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const { allowed, retryAfterMs } = checkRateLimit(`login:${ip}`);

  if (!allowed) {
    const minutes = Math.ceil(retryAfterMs / 60_000);
    return `Too many login attempts. Please try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.`;
  }

  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/recipes",
    });
    return null;
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid email or password.";
        default:
          return "Something went wrong. Please try again.";
      }
    }
    throw error; // re-throw redirect — Next.js handles it
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
