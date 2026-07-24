"use server";

import type { LinkedInKanal } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { schreibeAuditLog } from "@/lib/audit";
import { htmlZuText } from "@/lib/entities";
import { ladeKiSchicht } from "@/lib/ki";

export interface LinkedInPostVariante {
  text: string;
  zeichen: number;
}

export interface PostGenerierungErgebnis {
  ok: boolean;
  meldung?: string;
  varianten: LinkedInPostVariante[];
}

export async function generiereLinkedInPostsAction(
  artikelId: string,
  kanal: LinkedInKanal
): Promise<PostGenerierungErgebnis> {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, meldung: "Nicht angemeldet.", varianten: [] };
  }
  const artikel = await prisma.artikel.findUnique({ where: { id: artikelId } });
  if (!artikel?.cardHtml) {
    return {
      ok: false,
      meldung: "Zum Artikel liegt noch keine aufbereitete Card vor. Bitte zuerst die Verarbeitung abschließen.",
      varianten: [],
    };
  }

  try {
    const ki = await ladeKiSchicht();
    const posts = await ki.generiereLinkedInPosts({
      kanal,
      titel: artikel.titel,
      cardText: htmlZuText(artikel.cardHtml),
      sponsored: artikel.sponsored,
      kunde: artikel.kunde,
    });
    if (posts.length === 0) {
      return { ok: false, meldung: "Es konnten keine Post-Varianten erzeugt werden.", varianten: [] };
    }
    await prisma.linkedInPost.createMany({
      data: posts.map((text) => ({ artikelId, kanal, text })),
    });
    await schreibeAuditLog({
      userId: session.user.id,
      artikelId,
      aktion: "LINKEDIN_POSTS_GENERIERT",
      details: { kanal, anzahl: posts.length },
    });
    return { ok: true, varianten: posts.map((text) => ({ text, zeichen: text.length })) };
  } catch (fehler) {
    return {
      ok: false,
      meldung: fehler instanceof Error ? fehler.message : "Die Post-Generierung ist fehlgeschlagen.",
      varianten: [],
    };
  }
}
