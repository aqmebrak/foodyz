import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

// ---------------------------------------------------------------------------
// Lightweight config — safe for Edge runtime (no DB / Node-only modules).
// Used by middleware to validate JWT tokens without hitting the database.
// ---------------------------------------------------------------------------
export const authConfig = {
  pages: {
    signIn: "/login",
  },

  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      if (nextUrl.pathname === "/login") return true;
      if (!isLoggedIn) return false;
      return true;
    },

    jwt({ token, user }) {
      if (user) token.role = (user as { role: Role }).role;
      return token;
    },

    session({ session, token }) {
      session.user.id = token.sub!;
      session.user.role = token.role as Role;
      return session;
    },
  },

  providers: [], // filled in auth.ts with Credentials provider
} satisfies NextAuthConfig;
