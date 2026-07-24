// Beispieldaten für das Pipeline-Board (M1).
// Ausführen mit: npx prisma db seed
import { PrismaClient, ArtikelFormat, ArtikelStatus, Rolle } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const herausgeber = await prisma.user.upsert({
    where: { email: "herausgeber@vtm-studio.example" },
    update: {},
    create: {
      email: "herausgeber@vtm-studio.example",
      name: "Max Brenner",
      rolle: Rolle.HERAUSGEBER,
    },
  });

  const redakteurin = await prisma.user.upsert({
    where: { email: "redaktion@vtm-studio.example" },
    update: {},
    create: {
      email: "redaktion@vtm-studio.example",
      name: "Julia Steiner",
      rolle: Rolle.REDAKTEUR,
    },
  });

  const beispiele = [
    {
      titel: "BaFin-Rundschreiben zu KI-Governance: Was jetzt auf Versicherer zukommt",
      format: ArtikelFormat.EINORDNUNG,
      kategorie: "Regulatorik",
      status: ArtikelStatus.EINGEGANGEN,
      autorId: redakteurin.id,
    },
    {
      titel: "Dunkelverarbeitung in der Kfz-Schadenregulierung: Der Reifegrad-Report",
      format: ArtikelFormat.ANALYSE,
      kategorie: "Schaden",
      status: ArtikelStatus.IN_AUFBEREITUNG,
      autorId: redakteurin.id,
    },
    {
      titel: "Wie die Provinzial ihre Antragsstrecken mit Process Mining beschleunigt",
      format: ArtikelFormat.PRAXIS_CASE,
      kategorie: "Prozesse",
      status: ArtikelStatus.REVIEW,
      qualitaetsScore: 14,
      autorId: herausgeber.id,
    },
    {
      titel: "Digitale Aktenverwaltung im Maklerbetrieb: Fünf Stellhebel für den Umstieg",
      format: ArtikelFormat.SPONSORED,
      kategorie: "Vertrieb",
      status: ArtikelStatus.KUNDENFREIGABE,
      sponsored: true,
      kunde: "d.velop",
      qualitaetsScore: 15,
      autorId: herausgeber.id,
    },
    {
      titel: "Leitfaden: Ghost-CMS-Workflows für Fachredaktionen richtig aufsetzen",
      format: ArtikelFormat.LEITFADEN,
      kategorie: "Redaktion",
      status: ArtikelStatus.BEREIT,
      qualitaetsScore: 16,
      autorId: redakteurin.id,
    },
    {
      titel: "Interview: „Embedded Insurance wird 2027 zum Hygienefaktor“",
      format: ArtikelFormat.INTERVIEW,
      kategorie: "Markt",
      status: ArtikelStatus.IN_GHOST,
      qualitaetsScore: 13,
      ghostDraftUrl: "https://ghost.example/ghost/#/editor/post/demo",
      autorId: herausgeber.id,
    },
  ];

  for (const artikel of beispiele) {
    const vorhanden = await prisma.artikel.findFirst({ where: { titel: artikel.titel } });
    if (!vorhanden) {
      await prisma.artikel.create({ data: artikel });
    }
  }

  console.log("Seed abgeschlossen: 2 Benutzer, 6 Beispielartikel.");
}

main()
  .catch((fehler) => {
    console.error(fehler);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
