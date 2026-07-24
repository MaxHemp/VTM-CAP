// E2E-Happy-Path: Upload → Verarbeitung → Review → Publish-Modal → Draft.
// Ghost- und Anthropic-Schicht sind gemockt (MOCK_GHOST=1, MOCK_KI=1).
import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { encode } from "next-auth/jwt";

const MANUSKRIPT =
  "Die BaFin konkretisiert ihre Anforderungen an KI-Governance. " +
  "Versicherer müssen Verantwortlichkeiten für automatisierte Entscheidungen klar regeln. " +
  "Das betrifft vor allem die Dunkelverarbeitung in der Schadenregulierung. " +
  "Die Beleglage stammt aus dem Rundschreiben selbst. " +
  "Für IT-Entscheider bedeutet das konkrete Prüfpflichten in den nächsten zwölf Monaten. " +
  "Prozesse und Rollen sind nachvollziehbar zu dokumentieren. " +
  "Eine Grenze bleibt: Das Rundschreiben ist keine Rechtsverordnung. " +
  "Wer früh startet, verschafft sich einen belastbaren Vorsprung.";

test("Upload → Review → Publish-Modal → Ghost-Draft", async ({ page, context, baseURL }) => {
  // Anmeldung: Session-JWT direkt setzen (Magic-Link entfällt im E2E)
  const benutzer = JSON.parse(
    readFileSync(path.join(__dirname, ".auth", "benutzer.json"), "utf8")
  ) as { id: string; email: string; name: string };
  const cookieName = "authjs.session-token";
  const sessionToken = await encode({
    token: { sub: benutzer.id, id: benutzer.id, rolle: "HERAUSGEBER", email: benutzer.email, name: benutzer.name },
    secret: process.env.AUTH_SECRET ?? "e2e-secret",
    salt: cookieName,
    maxAge: 60 * 60,
  });
  await context.addCookies([
    { name: cookieName, value: sessionToken, url: baseURL ?? "http://localhost:3000" },
  ]);

  // Pipeline erreichbar (Auth funktioniert)
  await page.goto("/pipeline");
  await expect(page.getByRole("heading", { name: "Pipeline" })).toBeVisible();

  // Upload + Briefing
  await page.goto("/artikel/neu");
  await page.setInputFiles('input[type="file"]', {
    name: "e2e-bafin-ki-governance.txt",
    mimeType: "text/plain",
    buffer: Buffer.from(MANUSKRIPT, "utf8"),
  });
  await expect(page.getByText("e2e-bafin-ki-governance.txt")).toBeVisible();
  await page.getByLabel("Zentrale Frage").fill("Was verlangt die BaFin konkret von Versicherern?");
  await page.getByLabel("Anlass").fill("BaFin-Rundschreiben");
  await page.getByRole("button", { name: "Verarbeitung starten" }).click();

  // Stepper läuft durch, danach Redirect in den Review
  await expect(page.getByText("Manuskript wird aufbereitet")).toBeVisible();
  await page.waitForURL("**/artikel/*/review", { timeout: 90_000 });
  await expect(page.getByText("ARTIKEL-REVIEW")).toBeVisible();
  await expect(page.getByRole("button", { name: "Stilcheck" })).toBeVisible();
  await expect(page.getByText("SCORE 14/16")).toBeVisible();

  // Outlook-Umschalter
  await page.getByRole("button", { name: "Outlook-Ansicht" }).click();
  await expect(page.getByText("SIMULATION: ECKIGE KANTEN")).toBeVisible();

  // Publish-Modal öffnen
  await page.getByRole("button", { name: "Nach Ghost übertragen" }).click();
  await expect(page.getByText("GHOST CMS / ÜBERTRAGUNG")).toBeVisible();

  // KI-Vorschläge (Mock) erscheinen; Excerpt-Variante wählen
  await expect(page.getByText("KI-VORSCHLAG").first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("button", { name: /^V2 · / })).toBeVisible();
  await page.getByRole("button", { name: /^V2 · / }).click();

  // Draft erstellen (MOCK_GHOST) und Erfolg prüfen
  await page.getByRole("button", { name: "Draft erstellen" }).click();
  await expect(page.getByText("Draft in Ghost erstellt")).toBeVisible({ timeout: 30_000 });
  // Nach router.refresh() existiert der Link doppelt (Modal + Review-Header)
  await expect(page.getByRole("link", { name: "Draft in Ghost öffnen" }).first()).toBeVisible();
});
