import type { NextAuthConfig } from "next-auth";

/**
 * This config must stay edge-runtime-safe: no Prisma, no bcrypt, no Node
 * built-ins. Middleware runs on the edge and imports this directly.
 * The Credentials provider (which needs Prisma + bcrypt) is added on top
 * of this config only in lib/auth/config.ts, which is used by the actual
 * NextAuth route handler running in the Node runtime.
 */
export const authConfigEdge: NextAuthConfig = {
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8, // 8 hours
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role;
        token.id = user.id as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "SUPER_ADMIN" | "ADMIN" | "EDITOR";
      }
      return session;
    },
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = request.nextUrl.pathname.startsWith("/admin");
      const isOnLogin = request.nextUrl.pathname === "/admin/login";

      if (isOnLogin) {
        if (isLoggedIn) return Response.redirect(new URL("/admin", request.nextUrl));
        return true;
      }

      if (isOnAdmin) {
        return isLoggedIn;
      }

      return true;
    },
  },
};
