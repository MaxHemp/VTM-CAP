import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { baueLexicalPayload, erstelleGhostDraft } from "@/lib/ghost-publish";
import { kuerzeExcerpt, ladeKiSchicht, EXCERPT_MAX_ZEICHEN } from "@/lib/ki";
import { baueMockCard } from "@/lib/mock-card";

const TEST_KEY = "6866abc123def456789012ab:0123456789abcdef0123456789abcdef";

const CARD = baueMockCard({
  kategorie: "Regulatorik",
  format: "Analyse",
  sponsored: false,
  ctaLabel: "AI Insurance Briefing abonnieren",
  ctaUrl: "https://example.com",
  rohtext: "Erster Satz mit Umlauten: Prüfpflichten. Zweiter Satz. Dritter Satz. Vierter Satz.",
});

describe("baueLexicalPayload", () => {
  it("erzeugt ein Lexical-Dokument mit genau einer html-Card-Node", () => {
    const payload = JSON.parse(baueLexicalPayload(CARD)) as {
      root: { type: string; children: Array<{ type: string; version: number; html: string }> };
    };
    expect(payload.root.type).toBe("root");
    expect(payload.root.children).toHaveLength(1);
    expect(payload.root.children[0]!.type).toBe("html");
    expect(payload.root.children[0]!.version).toBe(1);
  });

  it("übernimmt die Card byte-identisch (Inline-Styles bleiben erhalten)", () => {
    const payload = JSON.parse(baueLexicalPayload(CARD)) as {
      root: { children: Array<{ html: string }> };
    };
    expect(payload.root.children[0]!.html).toBe(CARD);
  });
});

describe("erstelleGhostDraft", () => {
  beforeEach(() => {
    delete process.env.MOCK_GHOST;
  });
  afterEach(() => {
    delete process.env.MOCK_GHOST;
  });

  it("legt den Draft über POST /ghost/api/admin/posts/ als Lexical an (kein ?source=html)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ posts: [{ id: "abc123" }] }), { status: 201 })
    );
    const ergebnis = await erstelleGhostDraft(
      { url: "https://magazin.ghost.io/", adminApiKey: TEST_KEY },
      { titel: "Testartikel", cardHtml: CARD, excerpt: "Kurz.", tags: ["Regulatorik", "Analyse"] },
      fetchMock
    );
    const [url, optionen] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://magazin.ghost.io/ghost/api/admin/posts/");
    expect(String(url)).not.toContain("source=html");
    const body = JSON.parse((optionen as RequestInit).body as string) as {
      posts: Array<{ title: string; status: string; lexical: string; tags: Array<{ name: string }> }>;
    };
    expect(body.posts[0]!.status).toBe("draft");
    expect(body.posts[0]!.tags).toEqual([{ name: "Regulatorik" }, { name: "Analyse" }]);
    const lexical = JSON.parse(body.posts[0]!.lexical) as { root: { children: Array<{ type: string; html: string }> } };
    expect(lexical.root.children).toHaveLength(1);
    expect(lexical.root.children[0]!.html).toBe(CARD);
    expect(ergebnis).toEqual({
      postId: "abc123",
      editorUrl: "https://magazin.ghost.io/ghost/#/editor/post/abc123",
    });
  });

  it("meldet Ghost-Fehler handlungsleitend", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ errors: [{ message: "Validation error", context: "Titel fehlt" }] }), {
        status: 422,
      })
    );
    await expect(
      erstelleGhostDraft(
        { url: "https://magazin.ghost.io", adminApiKey: TEST_KEY },
        { titel: "", cardHtml: CARD, excerpt: "", tags: [] },
        fetchMock
      )
    ).rejects.toThrow(/Titel fehlt/);
  });
});

describe("Excerpts", () => {
  it("kuerzeExcerpt hält das 300-Zeichen-Limit ein (satzweise Kürzung)", () => {
    const lang = Array.from({ length: 30 }, (_, i) => `Satz Nummer ${i + 1} mit etwas Inhalt.`).join(" ");
    const gekuerzt = kuerzeExcerpt(lang);
    expect(gekuerzt.length).toBeLessThanOrEqual(EXCERPT_MAX_ZEICHEN);
    expect(gekuerzt.endsWith(".")).toBe(true);
  });

  it("lässt kurze Excerpts unverändert", () => {
    expect(kuerzeExcerpt("Kurzer Excerpt.")).toBe("Kurzer Excerpt.");
  });

  it("Mock-KI liefert 2 Headlines und 3 Excerpts ≤ 300 Zeichen", async () => {
    process.env.MOCK_KI = "1";
    const ki = await ladeKiSchicht();
    const vorschlaege = await ki.generierePublishVorschlaege(
      "Ein sehr langer Artikeltext. ".repeat(50),
      "Testartikel"
    );
    delete process.env.MOCK_KI;
    expect(vorschlaege.headlines).toHaveLength(2);
    expect(vorschlaege.excerpts).toHaveLength(3);
    for (const excerpt of vorschlaege.excerpts) {
      expect(excerpt.length).toBeLessThanOrEqual(EXCERPT_MAX_ZEICHEN);
    }
  });
});
