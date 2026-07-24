import NextAuth from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { createTransport } from "nodemailer";
import { istAnmeldungErlaubt } from "@/lib/benutzer";
import { prisma } from "@/lib/db";
import { RECHTE, extrahiereRechte, type RechteSchluessel } from "@/lib/rollen";

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
    // Einladungs-Prinzip: Anmelden kann sich nur, wessen E-Mail-Adresse
    // bereits als Benutzer hinterlegt ist (Einstellungen → Team und Zugänge).
    // Der Guard greift sowohl beim Anfordern des Links (es wird keine Mail
    // an fremde Adressen verschickt) als auch beim Einlösen.
    async signIn({ user }) {
      return istAnmeldungErlaubt(user.email);
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      // Zugang, Rolle und Rechte bei jedem Request gegen die Datenbank
      // prüfen: Entfernte Benutzer werden sofort abgemeldet; Rollen- und
      // Rechteänderungen greifen ohne Neuanmeldung.
      if (token.id) {
        const benutzer = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { name: true, email: true, rolle: true },
        });
        if (!benutzer) {
          return null;
        }
        token.name = benutzer.name;
        token.email = benutzer.email;
        token.rolle = benutzer.rolle.name;
        token.rechte = extrahiereRechte(benutzer.rolle);
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.rolle = token.rolle ?? "Redakteur";
        session.user.rechte = extrahiereRechte(token.rechte);
        if (token.name !== undefined) {
          session.user.name = token.name;
        }
        if (token.email) {
          session.user.email = token.email;
        }
      }
      return session;
    },
  },
});

// Serverseitiges Rechte-Gate für Server-Actions und geschützte Seiten.
export async function requireRecht(recht: RechteSchluessel) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Nicht angemeldet.");
  }
  if (!session.user.rechte[recht]) {
    const definition = RECHTE.find((eintrag) => eintrag.schluessel === recht);
    throw new Error(
      `Diese Aktion erfordert das Recht „${definition?.label ?? recht}“. Ihre Rolle „${session.user.rolle}“ hat es nicht.`
    );
  }
  return session;
}
