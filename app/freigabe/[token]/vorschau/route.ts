// Vollständige Web-Vorschau der Card für den Kunden (tokenisiert, ohne Account)
import { ladeFreigabeToken } from "@/lib/freigabe";
import { baueWebPreview } from "@/lib/preview";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
): Promise<Response> {
  const { token } = await params;
  const geladen = await ladeFreigabeToken(token);
  if (!geladen || !geladen.token.artikel.cardHtml) {
    return new Response("Der Freigabelink ist ungültig oder die Vorschau ist noch nicht verfügbar.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  return new Response(baueWebPreview(geladen.token.artikel.cardHtml, geladen.token.artikel.titel), {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}
