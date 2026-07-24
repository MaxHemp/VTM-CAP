import type { Rolle } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      rolle: Rolle;
    } & DefaultSession["user"];
  }

  interface User {
    rolle?: Rolle;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    rolle?: Rolle;
  }
}
