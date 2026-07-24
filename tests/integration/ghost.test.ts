// Ghost-Integrationstest (M3) – läuft ausschließlich in GitHub Actions gegen
// den ghost:5-alpine-Service-Container (RUN_INTEGRATION=1 + GHOST_URL).
//
// Der Test provisioniert sich seine Zugangsdaten selbst: frische Instanz
// über den Setup-Endpoint initialisieren, per Session-Cookie anmelden und
// eine Integration samt Admin API Key programmatisch anlegen. Es werden
// keine echten Secrets benötigt.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { baueMockCard } from "@/lib/mock-card";
import {
  erstelleGhostDraft,
  ladeFeatureImageHoch,
  ladeGhostPostLexical,
  type GhostZugang,
} from "@/lib/ghost-publish";

const aktiv = process.env.RUN_INTEGRATION === "1" && Boolean(process.env.GHOST_URL);
const GHOST_URL = (process.env.GHOST_URL ?? "").replace(/\/+$/, "");

const TEST_ADMIN = {
  name: "VTM Studio Test",
  email: "integrationstest@vtm-studio.example",
  password: "vtm-studio-Testpasswort-2026!",
  blogTitle: "VTM Integrationstest",
};

// 1×1-PNG für den Bild-Upload
const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

async function provisioniereAdminKey(): Promise<string> {
  // Frische Instanz initialisieren (403/… wenn bereits eingerichtet – dann weiter mit Login)
  const setupAntwort = await fetch(`${GHOST_URL}/ghost/api/admin/authentication/setup/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: GHOST_URL },
    body: JSON.stringify({ setup: [TEST_ADMIN] }),
  });
  if (!setupAntwort.ok && setupAntwort.status !== 403) {
    const text = await setupAntwort.text();
    if (!text.includes("already")) {
      throw new Error(`Ghost-Setup fehlgeschlagen (HTTP ${setupAntwort.status}): ${text.slice(0, 300)}`);
    }
  }

  // Session-Login (Cookie-Auth für Staff-Endpunkte)
  const loginAntwort = await fetch(`${GHOST_URL}/ghost/api/admin/session/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: GHOST_URL },
    body: JSON.stringify({ username: TEST_ADMIN.email, password: TEST_ADMIN.password }),
  });
  if (!loginAntwort.ok && loginAntwort.status !== 201) {
    throw new Error(`Ghost-Login fehlgeschlagen (HTTP ${loginAntwort.status}): ${await loginAntwort.text()}`);
  }
  const cookie = loginAntwort.headers.get("set-cookie");
  if (!cookie) {
    throw new Error("Ghost hat kein Session-Cookie zurückgegeben.");
  }

  // Integration + Admin API Key programmatisch anlegen
  const integrationAntwort = await fetch(`${GHOST_URL}/ghost/api/admin/integrations/?include=api_keys`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: GHOST_URL,
      Cookie: cookie.split(";")[0]!,
    },
    body: JSON.stringify({ integrations: [{ name: `vtm-studio-test-${Date.now()}` }] }),
  });
  if (!integrationAntwort.ok) {
    throw new Error(
      `Integration konnte nicht angelegt werden (HTTP ${integrationAntwort.status}): ${await integrationAntwort.text()}`
    );
  }
  const daten = (await integrationAntwort.json()) as {
    integrations: Array<{ api_keys: Array<{ type: string; id: string; secret: string }> }>;
  };
  const adminKey = daten.integrations[0]?.api_keys.find((key) => key.type === "admin");
  if (!adminKey) {
    throw new Error("Die Integration enthält keinen Admin API Key.");
  }
  return `${adminKey.id}:${adminKey.secret}`;
}

describe.skipIf(!aktiv)("Ghost-Draft als Lexical-html-Card (Admin API)", () => {
  let zugang: GhostZugang;
  const card = baueMockCard({
    kategorie: "Regulatorik",
    format: "Analyse",
    sponsored: false,
    ctaLabel: "AI Insurance Briefing abonnieren",
    ctaUrl: "https://www.linkedin.com/newsletters/ai-insurance-briefing-7376977231333453824/",
    rohtext:
      "Integrationstest-Satz eins mit Prüfpflichten. Satz zwei über Verantwortlichkeiten. Satz drei. Satz vier. Satz fünf. Satz sechs. Satz sieben. Satz acht.",
  });

  beforeAll(async () => {
    zugang = { url: GHOST_URL, adminApiKey: await provisioniereAdminKey() };
  }, 120_000);

  afterAll(() => {
    delete process.env.MOCK_GHOST;
  });

  it("erstellt den Draft und verifiziert die unveränderte html-Card-Node", async () => {
    const ergebnis = await erstelleGhostDraft(zugang, {
      titel: "VTM Integrationstest: Lexical-html-Card",
      cardHtml: card,
      excerpt: "Integrationstest-Excerpt unter 300 Zeichen.",
      tags: ["Integrationstest", "Analyse"],
    });
    expect(ergebnis.postId).toBeTruthy();
    expect(ergebnis.editorUrl).toContain("/ghost/#/editor/post/");

    const post = await ladeGhostPostLexical(zugang, ergebnis.postId);
    expect(post.title).toBe("VTM Integrationstest: Lexical-html-Card");
    const lexical = JSON.parse(post.lexical) as {
      root: { children: Array<{ type: string; html?: string }> };
    };
    const htmlNodes = lexical.root.children.filter((node) => node.type === "html");
    expect(htmlNodes).toHaveLength(1);
    expect(lexical.root.children).toHaveLength(1);
    // Kritisch: Die Card liegt unverändert in der html-Card-Node – Ghost hat
    // sie NICHT in native Blöcke zerlegt (Inline-Styles bleiben erhalten).
    expect(htmlNodes[0]!.html).toBe(card);
  }, 60_000);

  it("lädt ein Feature-Image über /admin/images/upload/ hoch", async () => {
    const url = await ladeFeatureImageHoch(zugang, "vtm-test.png", PNG_1X1, "image/png");
    expect(url).toMatch(/^https?:\/\//);
    expect(url).toContain("/content/images/");
  }, 60_000);
});
