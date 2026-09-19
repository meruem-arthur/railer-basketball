import NextAuth from "next-auth";
import { authConfigEdge } from "@/lib/auth/config.edge";

// Auth check for the admin area — uses the provider-less config so nothing
// here ever touches Prisma or bcrypt.
//
// In Next 16 the proxy runs on the Node.js runtime, so every request it
// matches costs a function invocation before the page is even served. The
// public site needs no auth check, so the matcher is limited to /admin
// instead of running on every page and prefetch.
const { auth } = NextAuth(authConfigEdge);

export default auth;

export const config = {
  matcher: ["/admin/:path*"],
};
