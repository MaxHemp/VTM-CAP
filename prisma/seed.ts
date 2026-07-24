// Beispieldaten für das Pipeline-Board (M1) inkl. aufbereitetem
// Review-Artikel mit Demo-Card (M2).
// Ausführen mit: npx prisma db seed
import { PrismaClient, ArtikelFormat, ArtikelStatus, Prisma } from "@prisma/client";
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

const ROLLE_HERAUSGEBER = "rolle-herausgeber";
const ROLLE_REDAKTEUR = "rolle-redakteur";

async function stelleSystemRollenSicher() {
  await prisma.benutzerRolle.upsert({
    where: { id: ROLLE_HERAUSGEBER },
    update: {},
    create: {
      id: ROLLE_HERAUSGEBER,
      name: "Herausgeber",
      beschreibung: "Volle Verwaltung: Artikel, Publishing, Freigaben, Team und Einstellungen.",
      istSystem: true,
      artikelVerwalten: true,
      publizieren: true,
      freigabenVerwalten: true,
      teamVerwalten: true,
      einstellungenVerwalten: true,
    },
  });
  await prisma.benutzerRolle.upsert({
    where: { id: ROLLE_REDAKTEUR },
    update: {},
    create: {
      id: ROLLE_REDAKTEUR,
      name: "Redakteur",
      beschreibung: "Redaktionelle Arbeit: Manuskripte hochladen, Reviews bearbeiten, LinkedIn-Posts erstellen.",
      istSystem: true,
    },
  });
}

async function main() {
  await stelleSystemRollenSicher();
  // Optionaler echter Herausgeber-Zugang aus der Umgebung (SEED_ADMIN_EMAIL):
  // Legt den Betreiber-Account mit voller Rolle an, damit die erste Anmeldung
  // nicht als REDAKTEUR endet. Idempotent; hebt eine bestehende Rolle an.
  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  if (adminEmail) {
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { rolleId: ROLLE_HERAUSGEBER },
      create: {
        email: adminEmail,
        name: process.env.SEED_ADMIN_NAME?.trim() || adminEmail.split("@")[0],
        rolleId: ROLLE_HERAUSGEBER,
      },
    });
    console.log(`Herausgeber-Zugang sichergestellt: ${adminEmail}`);

    // Produktivmodus (SEED_ADMIN_EMAIL gesetzt): Demo-Daten werden entfernt
    // statt angelegt. Die Beispielinhalte bleiben Entwicklung/CI vorbehalten.
    const demoTitel = [
      "BaFin-Rundschreiben zu KI-Governance: Was jetzt auf Versicherer zukommt",
      "Dunkelverarbeitung in der Kfz-Schadenregulierung: Der Reifegrad-Report",
      "Wie die Provinzial ihre Antragsstrecken mit Process Mining beschleunigt",
      "Digitale Aktenverwaltung im Maklerbetrieb: Fünf Stellhebel für den Umstieg",
      "Leitfaden: Ghost-CMS-Workflows für Fachredaktionen richtig aufsetzen",
      "Interview: „Embedded Insurance wird 2027 zum Hygienefaktor“",
    ];
    const geloeschteArtikel = await prisma.artikel.deleteMany({ where: { titel: { in: demoTitel } } });
    const geloeschteBenutzer = await prisma.user.deleteMany({
      where: { email: { in: ["herausgeber@vtm-studio.example", "redaktion@vtm-studio.example"] } },
    });
    console.log(
      `Produktivmodus: ${geloeschteArtikel.count} Demo-Artikel und ${geloeschteBenutzer.count} Demo-Benutzer entfernt; keine Beispieldaten angelegt.`
    );
    return;
  }

  const herausgeber = await prisma.user.upsert({
    where: { email: "herausgeber@vtm-studio.example" },
    update: {},
    create: {
      email: "herausgeber@vtm-studio.example",
      name: "Max Brenner",
      rolleId: ROLLE_HERAUSGEBER,
    },
  });

  const redakteurin = await prisma.user.upsert({
    where: { email: "redaktion@vtm-studio.example" },
    update: {},
    create: {
      email: "redaktion@vtm-studio.example",
      name: "Julia Steiner",
      rolleId: ROLLE_REDAKTEUR,
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

  // Beispielartikel nur in eine leere Datenbank einspielen: Sobald Artikel
  // existieren (echte oder Demo), legt ein erneuter Seed-Lauf nichts nach –
  // gelöschte Demo-Artikel tauchen so beim nächsten Deploy nicht wieder auf.
  const artikelVorhanden = await prisma.artikel.count();
  if (artikelVorhanden === 0) {
    for (const artikel of beispiele) {
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

  // Sponsored-Demo (M5): aufbereitete Kunden-Card samt offenem Freigabelink,
  // damit die Kundenansicht /freigabe/demo-freigabe-token demonstrierbar ist.
  const sponsoredArtikel = await prisma.artikel.findFirst({
    where: { sponsored: true, cardHtml: null },
  });
  if (sponsoredArtikel) {
    const kundentext =
      "Die digitale Aktenverwaltung entlastet Maklerbetriebe im Tagesgeschäft spürbar. " +
      "Gemeinsam mit dem Kunden wurde die Umstellung in neun Monaten abgeschlossen. " +
      "Die Bearbeitungszeit pro Vorgang sank nach Unternehmensangaben um ein Drittel. " +
      "Komplexe Sonderfälle bleiben bewusst in der persönlichen Betreuung. " +
      "Die Datenhaltung erfüllt die aufsichtsrechtlichen Anforderungen an Revisionssicherheit. " +
      "Der Umstieg gelang ohne Unterbrechung des laufenden Betriebs.";
    const sponsoredCard = baueMockCard({
      kategorie: sponsoredArtikel.kategorie ?? "Vertrieb",
      format: "Praxis-Case",
      sponsored: true,
      kunde: sponsoredArtikel.kunde ?? "d.velop",
      ctaLabel: "Mehr zum Projekt erfahren",
      ctaUrl: "https://example.com/#LINK-ZU-DVELOP-EINSETZEN",
      rohtext: kundentext,
    });
    await prisma.artikel.update({
      where: { id: sponsoredArtikel.id },
      data: {
        quelltextOriginal: kundentext,
        quelltextHash: quelltextHash(kundentext),
        cardHtml: sponsoredCard,
        stilcheckFindings: pruefeCard(sponsoredCard, { sponsored: true }) as unknown as Prisma.InputJsonValue,
      },
    });
    const vorhandenerToken = await prisma.freigabeToken.findUnique({ where: { token: "demo-freigabe-token" } });
    if (!vorhandenerToken) {
      await prisma.freigabeToken.create({
        data: {
          artikelId: sponsoredArtikel.id,
          token: "demo-freigabe-token",
          kundeEmail: "freigabe@kunde.example",
          status: "OFFEN",
          gueltigBis: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  console.log("Seed abgeschlossen: 2 Benutzer, 6 Beispielartikel, Demo-Cards für Review und Kundenfreigabe.");
}

main()
  .catch((fehler) => {
    console.error(fehler);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
