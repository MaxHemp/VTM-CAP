// DB-Integrationstest – läuft ausschließlich in GitHub Actions gegen den
// postgres:16-Service-Container (RUN_INTEGRATION=1). Lokal/Sandbox: übersprungen.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";

const aktiv = process.env.RUN_INTEGRATION === "1";

describe.skipIf(!aktiv)("Prisma-Schema gegen PostgreSQL", () => {
  const prisma = new PrismaClient();

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.artikel.deleteMany({ where: { titel: { startsWith: "[IT] " } } });
    await prisma.user.deleteMany({ where: { email: { endsWith: "@integration.test" } } });
    await prisma.$disconnect();
  });

  it("legt Benutzer mit Standardrolle REDAKTEUR an", async () => {
    const user = await prisma.user.create({
      data: { email: "redakteur@integration.test", name: "Integration Redakteur" },
    });
    expect(user.rolle).toBe("REDAKTEUR");
  });

  it("legt Artikel mit Default-Status EINGEGANGEN an und liest ihn zurück (Roundtrip)", async () => {
    const artikel = await prisma.artikel.create({
      data: {
        titel: "[IT] Roundtrip-Artikel",
        format: "ANALYSE",
        headlineVorschlaege: ["Variante A", "Variante B"],
        scoreDetails: { struktur: 2, tonalitaet: 1 },
      },
    });
    expect(artikel.status).toBe("EINGEGANGEN");

    const gelesen = await prisma.artikel.findUniqueOrThrow({ where: { id: artikel.id } });
    expect(gelesen.headlineVorschlaege).toEqual(["Variante A", "Variante B"]);
    expect(gelesen.scoreDetails).toEqual({ struktur: 2, tonalitaet: 1 });
  });

  it("verwaltet die Einstellungs-Singleton-Zeile per Upsert", async () => {
    const einstellung = await prisma.einstellung.upsert({
      where: { id: "singleton" },
      update: { ghostUrl: "https://integration.test" },
      create: { id: "singleton", ghostUrl: "https://integration.test" },
    });
    expect(einstellung.ghostUrl).toBe("https://integration.test");
  });

  it("erzwingt eindeutige E-Mail-Adressen", async () => {
    await prisma.user.create({ data: { email: "doppelt@integration.test" } });
    await expect(prisma.user.create({ data: { email: "doppelt@integration.test" } })).rejects.toThrow();
  });
});
