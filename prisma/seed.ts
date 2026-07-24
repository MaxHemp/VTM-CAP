// Beispieldaten für das Pipeline-Board (M1) inkl. aufbereitetem
// Review-Artikel mit Demo-Card (M2).
// Ausführen mit: npx prisma db seed
import { PrismaClient, ArtikelFormat, ArtikelStatus, Prisma, Rolle } from "@prisma/client";
import { baueMockCard } from "../lib/mock-card";
import { pruefeCard } from "../lib/stilcheck";
import { quelltextHash } from "../lib/extraktion";

const prisma = new PrismaClient();

const DEMO_ROHTEXT =
  "Die Provinzial hat ihre Antragsstrecken mit Process Mining beschleunigt. Die Durchlaufzeit sank nach Unternehmensangaben um 38 %. " +
  "Grundlage war eine systematische Analyse der Prozessdaten aus dem Bestandssystem. Die Beleglage stammt aus dem Projektbericht des Versicherers. " +
  "Für IT-Entscheider zeigt der Fall, dass Prozessdaten oft schon vorliegen und nur ausgewertet werden müssen. " +
  "Verantwortlichkeiten zwischen Fachbereich und IT müssen dafür klar geregelt sein. " +
  "Eine Grenze bleibt: Ohne saubere Datenqualität liefert Process Mining verzerrte Ergebnisse. " +
  "Wer klein startet und schnell lernt, verschafft sich einen messbaren Vorsprung.";

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

  // Demo-Card für den Review-Artikel (M2): aufbereitete Card samt Prüfdaten,
  // damit der Review-Screen ohne KI-Lauf demonstrierbar ist.
  const reviewArtikel = await prisma.artikel.findFirst({
    where: { status: ArtikelStatus.REVIEW, cardHtml: null },
  });
  if (reviewArtikel) {
    const cardHtml = baueMockCard({
      kategorie: reviewArtikel.kategorie ?? "Prozesse",
      format: "Praxis-Case",
      sponsored: false,
      ctaLabel: "AI Insurance Briefing abonnieren",
      ctaUrl: "https://www.linkedin.com/newsletters/ai-insurance-briefing-7376977231333453824/",
      rohtext: DEMO_ROHTEXT,
    });
    const stilcheck = pruefeCard(cardHtml);
    await prisma.artikel.update({
      where: { id: reviewArtikel.id },
      data: {
        quelltextOriginal: DEMO_ROHTEXT,
        quelltextHash: quelltextHash(DEMO_ROHTEXT),
        cardHtml,
        stilcheckFindings: stilcheck as unknown as Prisma.InputJsonValue,
        scoreDetails: {
          summe: 14,
          kategorien: [
            { kuerzel: "A", name: "Relevanz", punkte: 2, begruendung: "Konkrete Prozesse und Rollen benannt." },
            { kuerzel: "B", name: "Kernaussage", punkte: 2, begruendung: "Überprüfbare These." },
            { kuerzel: "C", name: "Belege", punkte: 1, begruendung: "Nur Unternehmensangaben, gekennzeichnet." },
            { kuerzel: "D", name: "Leserführung", punkte: 2, begruendung: "Tragende Zwischenüberschriften." },
            { kuerzel: "E", name: "Praxisnutzen", punkte: 2, begruendung: "Konkrete Maßnahmen." },
            { kuerzel: "F", name: "Differenzierung", punkte: 1, begruendung: "Eine Einschränkung benannt." },
            { kuerzel: "G", name: "Sprache", punkte: 2, begruendung: "Präzise, aktiv, floskelfrei." },
            { kuerzel: "H", name: "Abschluss", punkte: 2, begruendung: "Antwort und nächster Schritt." },
          ],
        },
        faktencheckClaims: [
          {
            aussage: "Die Durchlaufzeit der Antragsstrecken sank um 38 %.",
            klassifikation: "BELEGT",
            quelle: "Nach Unternehmensangaben (Projektbericht)",
          },
          {
            aussage: "Prozessdaten liegen bei Versicherern häufig bereits vor.",
            klassifikation: "ABLEITUNG",
            quelle: null,
          },
          {
            aussage: "Ohne Datenqualität liefert Process Mining verzerrte Ergebnisse.",
            klassifikation: "ABLEITUNG",
            quelle: null,
          },
        ],
      },
    });
  }

  console.log("Seed abgeschlossen: 2 Benutzer, 6 Beispielartikel, 1 Demo-Card im Review.");
}

main()
  .catch((fehler) => {
    console.error(fehler);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
