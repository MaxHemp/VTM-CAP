// Legt den E2E-Testbenutzer (Rolle HERAUSGEBER) in der Datenbank an.
// Die Anmeldung im Test erfolgt über ein selbst signiertes Session-JWT
// (AUTH_SECRET), damit der Magic-Link-Versand nicht simuliert werden muss.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

export const E2E_BENUTZER = {
  email: "herausgeber@e2e.vtm-studio.example",
  name: "E2E Herausgeber",
};

export default async function globalSetup() {
  const prisma = new PrismaClient();
  try {
    const benutzer = await prisma.user.upsert({
      where: { email: E2E_BENUTZER.email },
      update: { rolle: "HERAUSGEBER" },
      create: { email: E2E_BENUTZER.email, name: E2E_BENUTZER.name, rolle: "HERAUSGEBER" },
    });
    const zielVerzeichnis = path.join(__dirname, ".auth");
    mkdirSync(zielVerzeichnis, { recursive: true });
    writeFileSync(
      path.join(zielVerzeichnis, "benutzer.json"),
      JSON.stringify({ id: benutzer.id, email: benutzer.email, name: benutzer.name })
    );
  } finally {
    await prisma.$disconnect();
  }
}
