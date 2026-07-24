import Link from "next/link";
import { prisma } from "@/lib/db";
import { gruppiereNachStatus, type BoardArtikel } from "@/lib/status";
import { Topbar } from "@/components/shell/Topbar";
import { EmptyState } from "@/components/ui/EmptyState";
import { ArtikelKarte } from "@/components/pipeline/ArtikelKarte";

export const dynamic = "force-dynamic";

const WORKFLOW = [
  "Manuskript ablegen",
  "Automatische Aufbereitung",
  "Review und Checks",
  "Ghost-Draft",
  "LinkedIn-Post",
];

export default async function PipelineSeite() {
  const artikel = await prisma.artikel.findMany({
    include: { autor: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const boardArtikel: BoardArtikel[] = artikel.map((a) => ({
    id: a.id,
    titel: a.titel,
    format: a.format,
    status: a.status,
    sponsored: a.sponsored,
    kunde: a.kunde,
    qualitaetsScore: a.qualitaetsScore,
    autorName: a.autor?.name ?? null,
    updatedAt: a.updatedAt,
    hatCard: Boolean(a.cardHtml),
    ghostDraftUrl: a.ghostDraftUrl,
  }));

  const spalten = gruppiereNachStatus(boardArtikel);
  const leer = boardArtikel.length === 0;

  return (
    <section style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
      <Topbar
        bereich="REDAKTION / ARTIKEL-PIPELINE"
        titel="Pipeline"
        aktionen={
          <Link href="/artikel/neu" className="button button-primary">
            Neuer Artikel
          </Link>
        }
      />
      {leer ? (
        <EmptyState
          titel="Keine Artikel in der Pipeline"
          beschreibung="Legen Sie ein Manuskript ab, um die automatische Aufbereitung zu starten. Der Artikel durchläuft dann die Schritte Aufbereitung, Review und Ghost-Draft."
          aktionen={
            <Link href="/artikel/neu" className="button button-primary">
              Ersten Artikel anlegen
            </Link>
          }
        />
      ) : (
        <div style={{ flex: 1, overflow: "auto", padding: "16px 28px 28px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              flexWrap: "wrap",
              marginBottom: 16,
            }}
          >
            <ol className="workflow-steps">
              {WORKFLOW.map((schritt) => (
                <li key={schritt}>{schritt}</li>
              ))}
            </ol>
            <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
              Jede Karte zeigt unten den nächsten Schritt.
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridAutoFlow: "column",
              gridAutoColumns: "276px",
              gap: 14,
              alignItems: "start",
              width: "max-content",
              minWidth: "100%",
            }}
          >
            {spalten.map((spalte) => (
              <div key={spalte.status} style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 120 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 10px",
                    background: "var(--c-paper-blue)",
                    border: "1px solid var(--border-soft)",
                    borderRadius: 6,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.62rem",
                      fontWeight: 700,
                      letterSpacing: "0.09em",
                      textTransform: "uppercase",
                      color: "var(--text-primary)",
                    }}
                  >
                    {spalte.label}
                  </span>
                  <span
                    style={{
                      display: "inline-grid",
                      placeItems: "center",
                      minWidth: 20,
                      height: 20,
                      padding: "0 5px",
                      borderRadius: 10,
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.62rem",
                      fontWeight: 700,
                      color: spalte.artikel.length > 0 ? "var(--c-white)" : "var(--text-muted)",
                      background: spalte.artikel.length > 0 ? "var(--c-blue-700)" : "var(--c-neutral-200)",
                    }}
                  >
                    {spalte.artikel.length}
                  </span>
                  <span style={{ flex: 1 }} />
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.56rem",
                      letterSpacing: "0.04em",
                      color: "var(--text-muted)",
                      textAlign: "right",
                    }}
                  >
                    {spalte.hinweis}
                  </span>
                </div>
                {spalte.artikel.length === 0 ? (
                  <div
                    style={{
                      padding: "14px",
                      border: "1px dashed var(--border-soft)",
                      borderRadius: 6,
                      color: "var(--c-neutral-300)",
                      fontSize: "0.9rem",
                      textAlign: "center",
                    }}
                  >
                    –
                  </div>
                ) : (
                  spalte.artikel.map((a) => <ArtikelKarte key={a.id} artikel={a} />)
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
