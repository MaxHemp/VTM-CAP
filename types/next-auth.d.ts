import type { DefaultSession } from "next-auth";
import type { RechteSatz } from "@/lib/rollen";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      rolle: string;
      rechte: RechteSatz;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    rolle?: string;
    rechte?: RechteSatz;
  }
}
