import NextAuth from "next-auth";
import { authConfigEdge } from "@/lib/auth/config.edge";

// Edge-safe proxy auth check — uses the provider-less config so
// nothing here ever touches Prisma or bcrypt.
const { auth } = NextAuth(authConfigEdge);

export default auth;

export const config = {
  // Run on everything except static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets).*)"],
};
