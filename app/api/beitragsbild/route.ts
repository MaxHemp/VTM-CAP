// PNG-Export der Beitragsbilder (2-fache Auflösung, serverseitig via sharp)
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { BILD_FORMATE, type BeitragsbildOptionen, type BildFormat, type BildTemplate } from "@/lib/beitragsbild";
import { exportDateiname, exportiereBeitragsbildPng } from "@/lib/beitragsbild-export";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ fehler: "Nicht angemeldet." }, { status: 401 });
  }

  let eingabe: Partial<BeitragsbildOptionen>;
  try {
    eingabe = (await request.json()) as Partial<BeitragsbildOptionen>;
  } catch {
    return NextResponse.json({ fehler: "Ungültige Anfrage." }, { status: 400 });
  }

  const template = eingabe.template as BildTemplate;
  const format = eingabe.format as BildFormat;
  if (!["konzept", "zahl", "zitat"].includes(template) || !BILD_FORMATE[format]) {
    return NextResponse.json({ fehler: "Unbekanntes Template oder Format." }, { status: 400 });
  }

  const optionen: BeitragsbildOptionen = {
    template,
    format,
    titel: String(eingabe.titel ?? "").slice(0, 200) || "VTM Beitragsbild",
    unterzeile: String(eingabe.unterzeile ?? "").slice(0, 200),
    kicker: String(eingabe.kicker ?? "").slice(0, 60) || undefined,
    sponsored: Boolean(eingabe.sponsored),
    kunde: eingabe.kunde ? String(eingabe.kunde).slice(0, 60) : null,
  };

  const png = await exportiereBeitragsbildPng(optionen);
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="${exportDateiname(optionen)}"`,
      "Cache-Control": "no-store",
    },
  });
}
