import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Use the lightweight config — no Prisma, safe for Edge runtime.
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/admin/:path*"],
};
