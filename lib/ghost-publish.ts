// Ghost-Publishing (M3): Draft-Erstellung als Lexical-Dokument mit GENAU
// EINER html-Card-Node sowie Feature-Image-Upload über die Admin API.
//
// Kritisches Detail aus dem Auftrag: Der Post wird NICHT über den
// ?source=html-Konvertierungspfad angelegt (der zerlegt die Card in native
// Blöcke und zerstört die Inline-Styles), sondern als Lexical-Dokument, in
// dem die komplette VTM-Card unverändert in einer html-Card-Node liegt.
import { erzeugeGhostJwt, normalisiereGhostUrl, parseAdminApiKey } from "@/lib/ghost";

export interface GhostZugang {
  url: string;
  adminApiKey: string;
}

export interface GhostDraftEingabe {
  titel: string;
  cardHtml: string;
  excerpt: string;
  tags: string[];
  featureImageUrl?: string | null;
}

export interface GhostDraftErgebnis {
  postId: string;
  editorUrl: string;
}

// Lexical-Dokument mit genau einer html-Card-Node, die die komplette Card
// unverändert enthält.
export function baueLexicalPayload(cardHtml: string): string {
  return JSON.stringify({
    root: {
      children: [
        {
          type: "html",
          version: 1,
          html: cardHtml,
        },
      ],
      direction: null,
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  });
}

function ghostHeaders(zugang: GhostZugang): Record<string, string> {
  const key = parseAdminApiKey(zugang.adminApiKey);
  return {
    Authorization: `Ghost ${erzeugeGhostJwt(key)}`,
    "Accept-Version": "v5.0",
  };
}

async function leseGhostFehler(antwort: Response): Promise<string> {
  try {
    const daten = (await antwort.json()) as { errors?: Array<{ message?: string; context?: string }> };
    const erster = daten.errors?.[0];
    return erster?.context || erster?.message || `HTTP ${antwort.status}`;
  } catch {
    return `HTTP ${antwort.status}`;
  }
}

export async function erstelleGhostDraft(
  zugang: GhostZugang,
  eingabe: GhostDraftEingabe,
  fetchImpl: typeof fetch = fetch
): Promise<GhostDraftErgebnis> {
  if (process.env.MOCK_GHOST === "1") {
    const postId = `mock-${Date.now().toString(36)}`;
    return { postId, editorUrl: `https://ghost.example/ghost/#/editor/post/${postId}` };
  }
  const basisUrl = normalisiereGhostUrl(zugang.url);
  const antwort = await fetchImpl(`${basisUrl}/ghost/api/admin/posts/`, {
    method: "POST",
    headers: { ...ghostHeaders(zugang), "Content-Type": "application/json" },
    body: JSON.stringify({
      posts: [
        {
          title: eingabe.titel,
          lexical: baueLexicalPayload(eingabe.cardHtml),
          status: "draft",
          custom_excerpt: eingabe.excerpt || undefined,
          tags: eingabe.tags.map((name) => ({ name })),
          feature_image: eingabe.featureImageUrl || undefined,
        },
      ],
    }),
  });
  if (!antwort.ok) {
    throw new Error(`Ghost hat den Draft abgelehnt: ${await leseGhostFehler(antwort)}`);
  }
  const daten = (await antwort.json()) as { posts?: Array<{ id: string }> };
  const post = daten.posts?.[0];
  if (!post?.id) {
    throw new Error("Ghost hat keinen Post zurückgegeben. Bitte die Ghost-Version prüfen (erwartet: 5.x).");
  }
  return { postId: post.id, editorUrl: `${basisUrl}/ghost/#/editor/post/${post.id}` };
}

// Lädt einen Post inklusive Lexical-Inhalt (für den Integrationstest, der
// verifiziert, dass die Card unverändert als html-Card-Node liegt).
export async function ladeGhostPostLexical(
  zugang: GhostZugang,
  postId: string,
  fetchImpl: typeof fetch = fetch
): Promise<{ lexical: string; title: string }> {
  const basisUrl = normalisiereGhostUrl(zugang.url);
  const antwort = await fetchImpl(`${basisUrl}/ghost/api/admin/posts/${postId}/?formats=lexical`, {
    headers: ghostHeaders(zugang),
  });
  if (!antwort.ok) {
    throw new Error(`Post konnte nicht geladen werden: ${await leseGhostFehler(antwort)}`);
  }
  const daten = (await antwort.json()) as { posts?: Array<{ lexical: string; title: string }> };
  const post = daten.posts?.[0];
  if (!post) {
    throw new Error("Post nicht gefunden.");
  }
  return post;
}

export async function ladeFeatureImageHoch(
  zugang: GhostZugang,
  dateiname: string,
  daten: Buffer,
  mime: string,
  fetchImpl: typeof fetch = fetch
): Promise<string> {
  if (process.env.MOCK_GHOST === "1") {
    return `https://ghost.example/content/images/mock/${encodeURIComponent(dateiname)}`;
  }
  const basisUrl = normalisiereGhostUrl(zugang.url);
  const formular = new FormData();
  formular.append("file", new Blob([new Uint8Array(daten)], { type: mime }), dateiname);
  formular.append("purpose", "image");
  const antwort = await fetchImpl(`${basisUrl}/ghost/api/admin/images/upload/`, {
    method: "POST",
    headers: ghostHeaders(zugang),
    body: formular,
  });
  if (!antwort.ok) {
    throw new Error(`Der Bild-Upload wurde abgelehnt: ${await leseGhostFehler(antwort)}`);
  }
  const ergebnis = (await antwort.json()) as { images?: Array<{ url: string }> };
  const url = ergebnis.images?.[0]?.url;
  if (!url) {
    throw new Error("Ghost hat keine Bild-URL zurückgegeben.");
  }
  return url;
}
