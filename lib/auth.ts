import NextAuth from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { createTransport } from "nodemailer";
import type { Rolle } from "@prisma/client";
import { prisma } from "@/lib/db";

// Magic-Link-Versand: mit konfiguriertem SMTP_HOST per E-Mail, sonst wird der
// Link in der Server-Konsole ausgegeben (Entwicklung/CI).
async function sendeMagicLink(params: { identifier: string; url: string }) {
  const { identifier, url } = params;
  if (!process.env.SMTP_HOST) {
    console.log(`[VTM Studio] Magic-Link für ${identifier}: ${url}`);
    return;
  }
  const transport = createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASSWORD
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
  });
  await transport.sendMail({
    to: identifier,
    from: process.env.SMTP_FROM ?? "VTM Studio <studio@example.com>",
    subject: "Ihre Anmeldung bei VTM Studio",
    text: `Guten Tag,\n\nüber den folgenden Link melden Sie sich bei VTM Studio an:\n\n${url}\n\nDer Link ist 24 Stunden gültig. Falls Sie die Anmeldung nicht angefordert haben, ignorieren Sie diese E-Mail.\n\nVersicherungsTech Magazin`,
  });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  // Self-Hosting (Vercel/eigener Server): Host aus APP_URL bzw. Request
  // akzeptieren; ohne dies lehnt Auth.js Produktions-Requests ab.
  trustHost: true,
  pages: {
    signIn: "/login",
    verifyRequest: "/login?status=link-versendet",
    error: "/login?status=fehler",
  },
  providers: [
    Nodemailer({
      server: {
        host: process.env.SMTP_HOST ?? "localhost",
        port: Number(process.env.SMTP_PORT ?? 587),
      },
      from: process.env.SMTP_FROM ?? "VTM Studio <studio@example.com>",
      sendVerificationRequest: ({ identifier, url }) => sendeMagicLink({ identifier, url }),
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.rolle = (user as { rolle?: Rolle }).rolle ?? "REDAKTEUR";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.rolle = token.rolle as Rolle;
      }
      return session;
    },
  },
});

// Serverseitiges Rollen-Gate für Server-Actions und geschützte Seiten.
export async function requireRolle(rolle: Rolle) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Nicht angemeldet.");
  }
  if (rolle === "HERAUSGEBER" && session.user.rolle !== "HERAUSGEBER") {
    throw new Error("Diese Aktion ist der Rolle Herausgeber vorbehalten.");
  }
  return session;
}
