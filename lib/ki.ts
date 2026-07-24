// KI-Schicht für Card-Generierung, Qualitätsscore und Faktencheck.
// Produktiv: Anthropic API (Modell claude-sonnet-4-6, im Auftrag fixiert).
// MOCK_KI=1 (Entwicklung, CI, E2E): deterministische Mock-Implementierung
// ohne API-Key.
import Anthropic from "@anthropic-ai/sdk";
import { baueCardSystemPrompt, baueCardUserPrompt, type CardBriefing } from "@/lib/brand-prompt";
import { baueMockCard } from "@/lib/mock-card";
import { ladeEinstellungen } from "@/lib/einstellungen";
import { entschluesseln } from "@/lib/crypto";

export const KI_MODELL = "claude-sonnet-4-6";

export interface ScoreKategorie {
  kuerzel: string;
  name: string;
  punkte: number;
  begruendung: string;
}

export interface QualitaetsScore {
  summe: number;
  kategorien: ScoreKategorie[];
}

export type FaktenKlassifikation = "BELEGT" | "ABLEITUNG" | "PROGNOSE";

export interface FaktencheckClaim {
  aussage: string;
  klassifikation: FaktenKlassifikation;
  quelle: string | null;
}

export interface PublishVorschlaege {
  headlines: string[];
  excerpts: string[];
}

export const EXCERPT_MAX_ZEICHEN = 300;

// Kürzt einen Excerpt hart auf das Ghost-Limit (satzweise, dann Wortgrenze).
export function kuerzeExcerpt(text: string, maxZeichen = EXCERPT_MAX_ZEICHEN): string {
  const bereinigt = text.replace(/\s+/g, " ").trim();
  if (bereinigt.length <= maxZeichen) {
    return bereinigt;
  }
  const gekuerzt = bereinigt.slice(0, maxZeichen + 1);
  const letzterSatz = Math.max(gekuerzt.lastIndexOf(". "), gekuerzt.lastIndexOf("! "), gekuerzt.lastIndexOf("? "));
  if (letzterSatz > maxZeichen * 0.5) {
    return gekuerzt.slice(0, letzterSatz + 1).trim();
  }
  const letztesWort = gekuerzt.lastIndexOf(" ");
  return gekuerzt.slice(0, letztesWort > 0 ? letztesWort : maxZeichen).trim();
}

// Interface bewusst so geschnitten, dass eine spätere Recherche-Stufe
// (Websuche) als weitere Implementierung andocken kann (Nicht-Ziel v1).
export interface LinkedInGenerierung {
  kanal: "VTM" | "PERSONAL";
  titel: string;
  cardText: string;
  sponsored: boolean;
  kunde: string | null;
}

export interface KiSchicht {
  generiereCard(briefing: CardBriefing, rohtext: string): Promise<string>;
  bewerteQualitaet(cardText: string, briefing: CardBriefing): Promise<QualitaetsScore>;
  extrahiereFakten(rohtext: string, cardText: string): Promise<FaktencheckClaim[]>;
  generierePublishVorschlaege(cardText: string, titel: string): Promise<PublishVorschlaege>;
  generiereLinkedInPosts(eingabe: LinkedInGenerierung): Promise<string[]>;
}

export const SCORE_KATEGORIEN: Array<{ kuerzel: string; name: string }> = [
  { kuerzel: "A", name: "Relevanz" },
  { kuerzel: "B", name: "Kernaussage" },
  { kuerzel: "C", name: "Belege" },
  { kuerzel: "D", name: "Leserführung" },
  { kuerzel: "E", name: "Praxisnutzen" },
  { kuerzel: "F", name: "Differenzierung" },
  { kuerzel: "G", name: "Sprache" },
  { kuerzel: "H", name: "Abschluss" },
];

function extrahiereJson<T>(rohantwort: string): T {
  const bereinigt = rohantwort
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  const start = bereinigt.indexOf("{");
  const ende = bereinigt.lastIndexOf("}");
  if (start === -1 || ende === -1) {
    throw new Error("Die KI-Antwort enthielt kein auswertbares JSON.");
  }
  return JSON.parse(bereinigt.slice(start, ende + 1)) as T;
}

function bereinigeCardAntwort(rohantwort: string): string {
  let card = rohantwort.trim();
  card = card.replace(/^```(?:html)?\s*/i, "").replace(/\s*```$/, "");
  const start = card.indexOf("<table");
  if (start > 0) {
    card = card.slice(start);
  }
  const ende = card.lastIndexOf("</table>");
  if (ende !== -1) {
    card = card.slice(0, ende + "</table>".length);
  }
  return card;
}

class AnthropicKiSchicht implements KiSchicht {
  constructor(private readonly client: Anthropic) {}

  async generiereCard(briefing: CardBriefing, rohtext: string): Promise<string> {
    const stream = this.client.messages.stream({
      model: KI_MODELL,
      max_tokens: 64000,
      thinking: { type: "adaptive" },
      system: baueCardSystemPrompt({ sponsored: briefing.sponsored }),
      messages: [{ role: "user", content: baueCardUserPrompt(briefing, rohtext) }],
    });
    const antwort = await stream.finalMessage();
    const textBloecke = antwort.content.filter((block) => block.type === "text");
    return bereinigeCardAntwort(textBloecke.map((block) => block.text).join(""));
  }

  async bewerteQualitaet(cardText: string, briefing: CardBriefing): Promise<QualitaetsScore> {
    const kategorienListe = SCORE_KATEGORIEN.map((k) => `${k.kuerzel} ${k.name}`).join(", ");
    const antwort = await this.client.messages.create({
      model: KI_MODELL,
      max_tokens: 8000,
      thinking: { type: "adaptive" },
      system:
        "Du bist die interne Qualitätsprüfung des VersicherungsTech Magazins. Bewerte den Artikeltext streng nach den 8 Kategorien der Redaktionsanleitung (je 0–2 Punkte): " +
        kategorienListe +
        '. Antworte ausschließlich mit JSON in exakt dieser Form: {"kategorien":[{"kuerzel":"A","name":"Relevanz","punkte":0,"begruendung":"..."}, ...alle 8...]} – keine weiteren Felder, kein Text davor oder danach.',
      messages: [
        {
          role: "user",
          content: `Format: ${briefing.format}, Sponsored: ${briefing.sponsored ? "ja" : "nein"}.\n\nArtikeltext:\n\n${cardText}`,
        },
      ],
    });
    const text = antwort.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");
    const daten = extrahiereJson<{ kategorien: ScoreKategorie[] }>(text);
    const kategorien = SCORE_KATEGORIEN.map((vorgabe) => {
      const gefunden = daten.kategorien.find((k) => k.kuerzel === vorgabe.kuerzel);
      const punkte = Math.max(0, Math.min(2, Math.round(gefunden?.punkte ?? 0)));
      return {
        kuerzel: vorgabe.kuerzel,
        name: vorgabe.name,
        punkte,
        begruendung: gefunden?.begruendung ?? "",
      };
    });
    return { summe: kategorien.reduce((summe, k) => summe + k.punkte, 0), kategorien };
  }

  async extrahiereFakten(rohtext: string, cardText: string): Promise<FaktencheckClaim[]> {
    const antwort = await this.client.messages.create({
      model: KI_MODELL,
      max_tokens: 8000,
      thinking: { type: "adaptive" },
      system:
        "Du extrahierst die Kernaussagen eines Fachartikels für den Faktencheck. Klassifiziere jede Aussage ausschließlich anhand des Dokuments (keine Websuche): BELEGT (im Text mit Quellenangabe belegt; nenne die Quelle), ABLEITUNG (folgt logisch/rechtlich aus Genanntem), PROGNOSE (Zukunftsaussage). " +
        'Antworte ausschließlich mit JSON: {"claims":[{"aussage":"...","klassifikation":"BELEGT|ABLEITUNG|PROGNOSE","quelle":"... oder null"}]} – 4 bis 8 Aussagen.',
      messages: [
        {
          role: "user",
          content: `Manuskript:\n\n${rohtext}\n\n---\n\nAufbereiteter Artikeltext:\n\n${cardText}`,
        },
      ],
    });
    const text = antwort.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");
    const daten = extrahiereJson<{ claims: FaktencheckClaim[] }>(text);
    return daten.claims
      .filter((claim) => claim.aussage?.trim())
      .map((claim) => ({
        aussage: claim.aussage.trim(),
        klassifikation: ["BELEGT", "ABLEITUNG", "PROGNOSE"].includes(claim.klassifikation)
          ? claim.klassifikation
          : "ABLEITUNG",
        quelle: claim.quelle || null,
      }));
  }

  async generierePublishVorschlaege(cardText: string, titel: string): Promise<PublishVorschlaege> {
    const antwort = await this.client.messages.create({
      model: KI_MODELL,
      max_tokens: 4000,
      thinking: { type: "adaptive" },
      system:
        "Du bist die Schlussredaktion des VersicherungsTech Magazins. Erzeuge für den Artikel exakt 2 Headline-Vorschläge " +
        "(präzise, ohne Clickbait, keine Em-Dashes, keine Buzzwords) und exakt 3 Excerpt-Varianten (je maximal 300 Zeichen, " +
        "Sie-Form, Kernaussage zuerst). " +
        'Antworte ausschließlich mit JSON: {"headlines":["...","..."],"excerpts":["...","...","..."]}',
      messages: [{ role: "user", content: `Arbeitstitel: ${titel}\n\nArtikeltext:\n\n${cardText}` }],
    });
    const text = antwort.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");
    const daten = extrahiereJson<PublishVorschlaege>(text);
    return {
      headlines: (daten.headlines ?? []).filter(Boolean).slice(0, 2),
      excerpts: (daten.excerpts ?? []).filter(Boolean).slice(0, 3).map((excerpt) => kuerzeExcerpt(excerpt)),
    };
  }

  async generiereLinkedInPosts(eingabe: LinkedInGenerierung): Promise<string[]> {
    const kanalRegeln =
      eingabe.kanal === "VTM"
        ? "Kanal: VTM-Unternehmensprofil. Regeln (hart): Sie-Form. Aufbau: These-Hook (1–2 Sätze), 1–2 Faktenabsätze, " +
          "danach GENAU 3 Bullets, jede Zeile beginnt mit ▪️ und ist ein vollständiger Satz. " +
          'Danach der Abschlusssatz exakt: "Jetzt lesen und mitdiskutieren." ' +
          "Zum Schluss GENAU 5 Hashtags in einer Zeile. Keine Em-Dashes (—), keine Emojis außer ▪️."
        : "Kanal: Persönliches Profil des Herausgebers. Regeln: Du-Form, nahbarer und direkter Ton, persönliche Einordnung, " +
          "gleiche Faktentreue wie der Artikel (keine neuen Zahlen erfinden), 3–5 Hashtags, keine Em-Dashes, keine Emojis.";
    const antwort = await this.client.messages.create({
      model: KI_MODELL,
      max_tokens: 8000,
      thinking: { type: "adaptive" },
      system:
        "Du schreibst LinkedIn-Posts für das VersicherungsTech Magazin. " +
        kanalRegeln +
        (eingabe.sponsored
          ? ` Der Artikel ist Sponsored Content (Kunde: ${eingabe.kunde ?? "Partner"}); kennzeichne das transparent im Post (z. B. "Anzeige").`
          : "") +
        ' Erzeuge 3 unterschiedliche Varianten. Antworte ausschließlich mit JSON: {"posts":["...","...","..."]}',
      messages: [
        { role: "user", content: `Artikeltitel: ${eingabe.titel}\n\nArtikeltext:\n\n${eingabe.cardText}` },
      ],
    });
    const text = antwort.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");
    const daten = extrahiereJson<{ posts: string[] }>(text);
    return (daten.posts ?? []).filter(Boolean).slice(0, 3);
  }
}

class MockKiSchicht implements KiSchicht {
  async generiereCard(briefing: CardBriefing, rohtext: string): Promise<string> {
    return baueMockCard({
      kategorie: briefing.kategorie,
      format: briefing.format,
      sponsored: briefing.sponsored,
      kunde: briefing.kunde,
      ctaLabel: briefing.ctaLabel,
      ctaUrl: briefing.ctaUrl,
      rohtext,
    });
  }

  async bewerteQualitaet(): Promise<QualitaetsScore> {
    const punkteProKategorie = [2, 2, 1, 2, 2, 1, 2, 2];
    const kategorien = SCORE_KATEGORIEN.map((vorgabe, index) => ({
      kuerzel: vorgabe.kuerzel,
      name: vorgabe.name,
      punkte: punkteProKategorie[index] ?? 1,
      begruendung: "Mock-Bewertung (MOCK_KI=1, ohne Anthropic API).",
    }));
    return { summe: kategorien.reduce((summe, k) => summe + k.punkte, 0), kategorien };
  }

  async extrahiereFakten(rohtext: string): Promise<FaktencheckClaim[]> {
    const saetze = rohtext
      .replace(/\s+/g, " ")
      .split(/(?<=[.!?])\s+/)
      .filter((satz) => satz.trim().length > 20)
      .slice(0, 4);
    const klassifikationen: FaktenKlassifikation[] = ["BELEGT", "ABLEITUNG", "PROGNOSE", "ABLEITUNG"];
    return saetze.map((satz, index) => ({
      aussage: satz.trim(),
      klassifikation: klassifikationen[index] ?? "ABLEITUNG",
      quelle: index === 0 ? "Angabe laut Manuskript" : null,
    }));
  }

  async generierePublishVorschlaege(cardText: string, titel: string): Promise<PublishVorschlaege> {
    const saetze = cardText
      .replace(/\s+/g, " ")
      .split(/(?<=[.!?])\s+/)
      .filter((satz) => satz.trim().length > 30);
    const basis = saetze.slice(0, 3).join(" ") || titel;
    return {
      headlines: [`${titel}: Was jetzt zu tun ist`, `${titel} in der Analyse`],
      excerpts: [
        kuerzeExcerpt(basis),
        kuerzeExcerpt(`Die wichtigsten Erkenntnisse kompakt: ${basis}`),
        kuerzeExcerpt(`Für IT-Entscheider eingeordnet: ${basis}`),
      ],
    };
  }

  async generiereLinkedInPosts(eingabe: LinkedInGenerierung): Promise<string[]> {
    const saetze = eingabe.cardText
      .replace(/\s+/g, " ")
      .replace(/—/g, ",")
      .split(/(?<=[.!?])\s+/)
      .filter((satz) => satz.trim().length > 25);
    const satz = (index: number, fallback: string) => saetze[index]?.trim() ?? fallback;
    const anzeige = eingabe.sponsored ? `Anzeige · In Kooperation mit ${eingabe.kunde ?? "Partner"}\n\n` : "";

    if (eingabe.kanal === "VTM") {
      const bullets = [
        satz(2, "Die Ausgangslage ist im Artikel dokumentiert."),
        satz(3, "Die Belege stammen aus dem Manuskript."),
        satz(4, "Die Konsequenzen für Versicherer sind konkret benannt."),
      ]
        .map((inhalt) => `▪️ ${/[.!?]$/.test(inhalt) ? inhalt : `${inhalt}.`}`)
        .join("\n");
      const basis = (variante: string) =>
        `${anzeige}${variante}\n\n${satz(1, "Die Faktenlage ist eindeutig.")}\n\n${bullets}\n\nJetzt lesen und mitdiskutieren.\n\n#VersicherungsTech #InsurTech #Versicherung #Digitalisierung #KI`;
      return [
        basis(`${eingabe.titel}: ${satz(0, "Die Kernthese steht im Artikel.")}`),
        basis(`Was bedeutet das für Versicherer? ${satz(0, "Die Kernthese steht im Artikel.")}`),
        basis(`Unsere Analyse: ${satz(0, "Die Kernthese steht im Artikel.")}`),
      ];
    }

    const basisPersonal = (hook: string) =>
      `${anzeige}${hook}\n\n${satz(1, "Die Details habe ich im Artikel aufgeschrieben.")} ${satz(2, "")}\n\nMeine Einordnung findest du im neuen VTM-Artikel.\n\n#InsurTech #Versicherung #KI`;
    return [
      basisPersonal(`Ich habe mir das genauer angeschaut: ${eingabe.titel}.`),
      basisPersonal(`Kurz notiert aus der Redaktion: ${eingabe.titel}.`),
    ];
  }
}

async function ermittleApiKey(): Promise<string | null> {
  if (process.env.ANTHROPIC_API_KEY) {
    return process.env.ANTHROPIC_API_KEY;
  }
  try {
    const einstellungen = await ladeEinstellungen();
    if (einstellungen.anthropicApiKey) {
      return entschluesseln(einstellungen.anthropicApiKey);
    }
  } catch {
    // Einstellungen nicht erreichbar (z. B. ohne Datenbank) – unten behandelt
  }
  return null;
}

export async function ladeKiSchicht(): Promise<KiSchicht> {
  if (process.env.MOCK_KI === "1") {
    return new MockKiSchicht();
  }
  const apiKey = await ermittleApiKey();
  if (!apiKey) {
    throw new Error(
      "Kein Anthropic API Key konfiguriert. Bitte hinterlegen Sie den Key in den Einstellungen oder als ANTHROPIC_API_KEY – alternativ MOCK_KI=1 für den Betrieb ohne KI."
    );
  }
  return new AnthropicKiSchicht(new Anthropic({ apiKey }));
}
