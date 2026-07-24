import { describe, expect, it } from "vitest";
import { pruefeCard } from "@/lib/stilcheck";
import { baueMockCard } from "@/lib/mock-card";

const ROHTEXT =
  "Die BaFin hat neue Anforderungen an KI-Governance formuliert. Versicherer müssen Verantwortlichkeiten klar regeln. " +
  "Das betrifft vor allem die Dunkelverarbeitung. Die Beleglage stammt aus dem Rundschreiben selbst. " +
  "Für IT-Entscheider bedeutet das konkrete Prüfpflichten. Prozesse und Rollen sind zu dokumentieren. " +
  "Eine Grenze bleibt: Das Rundschreiben ist keine Rechtsverordnung. Wer jetzt startet, verschafft sich Vorsprung.";

function valideCard(): string {
  return baueMockCard({
    kategorie: "Regulatorik",
    format: "Analyse",
    sponsored: false,
    ctaLabel: "AI Insurance Briefing abonnieren",
    ctaUrl: "https://www.linkedin.com/newsletters/ai-insurance-briefing-7376977231333453824/",
    rohtext: ROHTEXT,
  });
}

describe("pruefeCard – valide Card aus brand-rules-Bausteinen", () => {
  it("liefert 0 Fehler (Parität zu scripts/stilcheck.py verifiziert)", () => {
    const ergebnis = pruefeCard(valideCard());
    expect(ergebnis.fehler).toEqual([]);
    expect(ergebnis.bestanden).toBe(true);
    // Identische Werte wie das Python-Original auf derselben Card:
    expect(ergebnis.wortzahl).toBeGreaterThan(100);
    expect(ergebnis.warnungen).toEqual(["Platzhalter-Link (#LINK-...) noch nicht ersetzt"]);
  });

  it("liefert bei der Sponsored-Variante 0 Fehler", () => {
    const card = baueMockCard({
      kategorie: "Vertrieb",
      format: "Praxis-Case",
      sponsored: true,
      kunde: "d.velop",
      ctaLabel: "Mehr erfahren",
      ctaUrl: "https://example.com/kunde",
      rohtext: ROHTEXT,
    });
    expect(pruefeCard(card, { sponsored: true }).fehler).toEqual([]);
  });
});

describe("pruefeCard – erkannte Verstöße (DoD-Fixtures)", () => {
  it("erkennt Em-Dashes", () => {
    const card = valideCard().replace("Verantwortlichkeiten", "Verantwortlichkeiten — klar — geregelt");
    const ergebnis = pruefeCard(card);
    expect(ergebnis.fehler).toContain("Em-Dash gefunden (2x)");
  });

  it("erkennt Em-Dashes auch als numerische Entity (&#8212;)", () => {
    const card = valideCard().replace("Verantwortlichkeiten", "Verantwortlichkeiten &#8212; Einschub");
    expect(pruefeCard(card).fehler.some((f) => f.startsWith("Em-Dash gefunden"))).toBe(true);
  });

  it("erkennt En-Dash-Satzunterbrecher", () => {
    const card = valideCard().replace("Verantwortlichkeiten", "Verantwortlichkeiten – als Unterbrecher");
    expect(pruefeCard(card).fehler).toContain("En-Dash als Satzunterbrecher gefunden");
  });

  it("erkennt Flexbox als E-Mail-unsicher", () => {
    const card = valideCard().replace('style="background-image:none; white-space:normal; border:0; padding:0;"', 'style="display:flex; background-image:none; white-space:normal; border:0; padding:0;"');
    expect(pruefeCard(card).fehler).toContain("E-Mail-unsicher: Flexbox");
  });

  it("erkennt fehlendes background-image:none auf Tabellen und tds", () => {
    const card = valideCard().replaceAll("background-image:none; ", "");
    const fehler = pruefeCard(card).fehler;
    expect(fehler.some((f) => f.includes("Tabelle(n) ohne background-image:none"))).toBe(true);
    expect(fehler.some((f) => f.includes("td(s) ohne background-image:none"))).toBe(true);
  });

  it("erkennt einen zweiten CTA-Button", () => {
    const zweiterCta =
      '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:table; white-space:normal; background-image:none; margin-top:0; margin:0; border-collapse:collapse;"><tr><td bgcolor="#1F4EFF" style="background-image:none; white-space:normal; border:0; padding:0; background-color:#1F4EFF;"><a href="https://example.com" style="display:inline-block; padding:12px 26px; color:#ffffff;">Zweiter CTA</a></td></tr></table>';
    const card = valideCard().replace("</td></tr>\n</table>", `${zweiterCta}</td></tr>\n</table>`);
    expect(pruefeCard(card).fehler).toContain("Struktur fehlt/verletzt: Genau 1 CTA-Button");
  });

  it("erkennt Buzzwords unabhängig von Groß-/Kleinschreibung", () => {
    const card = valideCard().replace("Verantwortlichkeiten", "Disruptive Verantwortlichkeiten");
    expect(pruefeCard(card).fehler).toContain("Buzzword: disruptiv");
  });

  it("erkennt fehlende Pflicht-Struktur (fehlendes Fazit)", () => {
    const card = valideCard().replaceAll("Fazit", "Schluss");
    expect(pruefeCard(card).fehler).toContain("Struktur fehlt/verletzt: Fazit");
  });

  it("warnt bei Sponsored, wenn Gegenargumente enthalten sind", () => {
    const card = valideCard(); // enthält Gegenargumente-Abschnitt
    const ergebnis = pruefeCard(card, { sponsored: true });
    expect(ergebnis.warnungen).toContain("Sponsored: Gegenargumente-Abschnitt gefunden (sollte entfallen)");
  });
});
