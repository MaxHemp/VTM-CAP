// Erzeugt die README-Screenshots gegen die lokal laufende App.
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import { encode } from "next-auth/jwt";

const BASIS = "http://localhost:3000";
const ZIEL = path.join(process.cwd(), "docs", "screenshots");

async function main() {
  mkdirSync(ZIEL, { recursive: true });
  const benutzer = JSON.parse(
    readFileSync(path.join(process.cwd(), "tests", "e2e", ".auth", "benutzer.json"), "utf8")
  ) as { id: string; email: string; name: string };
  const cookieName = "authjs.session-token";
  const sessionToken = await encode({
    token: { sub: benutzer.id, id: benutzer.id, rolle: "HERAUSGEBER", email: benutzer.email, name: "Max Brenner" },
    secret: process.env.AUTH_SECRET ?? "e2e-secret",
    salt: cookieName,
    maxAge: 3600,
  });

  const browser = await chromium.launch({ executablePath: process.env.E2E_CHROMIUM_PATH });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await context.addCookies([{ name: cookieName, value: sessionToken, url: BASIS }]);
  const page = await context.newPage();

  async function schuss(pfad: string, datei: string, warteAuf?: string) {
    await page.goto(`${BASIS}${pfad}`, { waitUntil: "domcontentloaded" });
    if (warteAuf) {
      await page.getByText(warteAuf).first().waitFor({ timeout: 15000 });
    }
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ZIEL, datei) });
    console.log("✓", datei);
  }

  await schuss("/pipeline", "pipeline.png", "Eingegangen");

  // Review des geseedeten Artikels (Provinzial, Status REVIEW)
  await page.goto(`${BASIS}/pipeline`, { waitUntil: "networkidle" });
  await page.getByText("Wie die Provinzial ihre Antragsstrecken").first().click();
  await page.getByRole("link", { name: "Zum Review" }).click();
  await page.getByText("ARTIKEL-REVIEW").waitFor({ timeout: 15000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(ZIEL, "review.png") });
  console.log("✓ review.png");

  await page.getByRole("button", { name: "Nach Ghost übertragen" }).click();
  await page.getByText("GHOST CMS / ÜBERTRAGUNG").waitFor({ timeout: 15000 });
  await page.getByText("KI-VORSCHLAG").first().waitFor({ timeout: 15000 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(ZIEL, "publish-modal.png") });
  console.log("✓ publish-modal.png");

  await schuss("/artikel/neu", "upload.png", "MANUSKRIPT");
  await schuss("/linkedin", "linkedin-studio.png", "BEITRAGSBILD");
  await schuss("/einstellungen", "einstellungen.png", "Ghost-Verbindung");
  await schuss("/freigabe/demo-freigabe-token", "freigabe.png", "Ihr Text / Unsere Umsetzung");

  await browser.close();
}

main().catch((fehler) => {
  console.error(fehler);
  process.exit(1);
});
