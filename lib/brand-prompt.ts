// Baut den Systemprompt für die Card-Generierung zur Laufzeit aus den
// Brand-Rules zusammen (brand-rules/ ist die Single Source of Truth).
// Bei Sponsored Content kommt sponsored-content.md mit Vorrang hinzu.
import { readFileSync } from "node:fs";
import path from "node:path";

const BRAND_RULES_VERZEICHNIS = path.join(process.cwd(), "brand-rules");

function leseBrandRule(relativerPfad: string): string {
  return readFileSync(path.join(BRAND_RULES_VERZEICHNIS, relativerPfad), "utf8");
}

export const ABSCHNITT_MARKER_ANWEISUNG = `
## Technische Zusatzanweisung der Redaktionsplattform (VTM Studio)

Gib ausschließlich die vollständige Card-HTML aus – kein Markdown, keine Code-Fences, keine Trägerdatei, keine Erklärungen davor oder danach. Die Card beginnt mit dem Grundgerüst (äußere Tabelle) und enthält alle Bausteine inline.

Umschließe zusätzlich jeden logischen Abschnitt INNERHALB der Inhalts-td mit HTML-Kommentar-Markern (die Marker sind unsichtbar, E-Mail-sicher und werden von der Plattform für Gliederung und Bearbeitung genutzt):

<!--VTM:ABSCHNITT id="..." label="..."--> ... <!--/VTM:ABSCHNITT-->

Pflicht-Abschnitte in dieser Reihenfolge (ids exakt so vergeben):
- app-hinweis (Label "App-Hinweis")
- kategorie (Label "Kategorie-Zeile")
- lead (Label "Lead")
- wichtigste (Label "Das Wichtigste")
- hauptteil-1, hauptteil-2, ... (Label = jeweilige H2-Überschrift; ein Abschnitt pro H2 inklusive zugehöriger Absätze/Bausteine)
- gegenargumente (Label "Gegenargumente und Grenzen") – entfällt bei Sponsored
- was-tun (Label "Was Versicherer jetzt tun sollten")
- fazit (Label "Fazit") – bei Sponsored nur, wenn der Kundentext ein Fazit enthält
- quellen (Label "Quellenverzeichnis")
- cta (Label "CTA")
- sponsored-footer (Label "Sponsored-Footer") – nur bei Sponsored

In die Marker-Kommentare dürfen keine ">"-Zeichen außer am Ende. Verwende für Nicht-ASCII-Zeichen numerische Entities (z. B. &#228;), wie in den Komponenten vorgegeben.
`.trim();

export function baueCardSystemPrompt(optionen: { sponsored: boolean }): string {
  const teile = [
    leseBrandRule("SKILL.md"),
    "\n\n# Referenz: Verbindliche Artikelstruktur (redaktionsstruktur.md)\n\n" +
      leseBrandRule("references/redaktionsstruktur.md"),
    "\n\n# Referenz: E-Mail-sichere Komponenten (komponenten.md) – Bausteine 1:1 verwenden, Overrides niemals entfernen\n\n" +
      leseBrandRule("references/komponenten.md"),
    "\n\n# Pflichtblock: App-Hinweis (assets/app-hinweis.html) – exakt so als erstes Element übernehmen\n\n" +
      leseBrandRule("assets/app-hinweis.html"),
  ];
  if (optionen.sponsored) {
    teile.push(
      "\n\n# VORRANGREGELN: Sponsored Content (sponsored-content.md) – diese Regeln haben Vorrang vor der Redaktionsstruktur. Der Kundentext wird 1:1 übernommen, keine redaktionelle Umformulierung.\n\n" +
        leseBrandRule("references/sponsored-content.md")
    );
  }
  teile.push("\n\n" + ABSCHNITT_MARKER_ANWEISUNG);
  return teile.join("");
}

export interface CardBriefing {
  kategorie: string;
  format: string;
  zentraleFrage: string;
  anlass: string;
  sponsored: boolean;
  kunde: string | null;
  ctaLabel: string;
  ctaUrl: string;
}

export function baueCardUserPrompt(briefing: CardBriefing, rohtext: string): string {
  const zeilen = [
    "Erstelle aus dem folgenden Autorenmanuskript die vollständige VTM-Ghost-Single-Card.",
    "",
    "## Briefing",
    `- Kategorie: ${briefing.kategorie}`,
    `- Format: ${briefing.format}`,
    `- Zentrale Frage: ${briefing.zentraleFrage || "(nicht angegeben – aus dem Manuskript ableiten)"}`,
    `- Anlass: ${briefing.anlass || "(nicht angegeben)"}`,
    `- CTA (genau einer): "${briefing.ctaLabel}" → ${briefing.ctaUrl}`,
  ];
  if (briefing.sponsored) {
    zeilen.push(
      `- Sponsored Content: JA, Kunde: ${briefing.kunde ?? "(Kunde fehlt)"} – Kundentext 1:1 übernehmen, Kategorie-Zeile "Anzeige · In Kooperation mit ${briefing.kunde ?? "<Kunde>"} | ${briefing.format}", Sponsored-Footer als Pflicht.`
    );
  } else {
    zeilen.push("- Sponsored Content: NEIN");
  }
  zeilen.push("", "## Manuskript (Rohtext)", "", rohtext);
  return zeilen.join("\n");
}
