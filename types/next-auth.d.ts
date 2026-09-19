import type { DefaultSession } from "next-auth";

// Augments NextAuth's built-in types with the custom fields this app adds
// in lib/auth/config.edge.ts's jwt/session callbacks (id, role). Without
// this, TypeScript has no way to know session.user.role or user.role
// exist — see https://authjs.dev/getting-started/typescript
declare module "next-auth" {
  interface User {
    role: "SUPER_ADMIN" | "ADMIN" | "EDITOR";
  }

  interface Session {
    user: {
      id: string;
      role: "SUPER_ADMIN" | "ADMIN" | "EDITOR";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "SUPER_ADMIN" | "ADMIN" | "EDITOR";
  }
}
