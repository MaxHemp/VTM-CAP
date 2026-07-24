import Link from "next/link";
import { prisma } from "@/lib/db";
import { gruppiereNachStatus, type BoardArtikel } from "@/lib/status";
import { Topbar } from "@/components/shell/Topbar";
import { EmptyState } from "@/components/ui/EmptyState";
import { ArtikelKarte } from "@/components/pipeline/ArtikelKarte";

export const dynamic = "force-dynamic";

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
          beschreibung="Legen Sie ein Manuskript ab, um die automatische Aufbereitung zu starten."
          aktionen={
            <Link href="/artikel/neu" className="button button-primary">
              Ersten Artikel anlegen
            </Link>
          }
        />
      ) : (
        <div style={{ flex: 1, overflow: "auto", padding: "20px 28px 28px" }}>
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
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, padding: "2px 4px" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.64rem",
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
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.64rem",
                      fontWeight: 600,
                      color: "var(--c-blue-700)",
                    }}
                  >
                    {spalte.artikel.length}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.58rem",
                      letterSpacing: "0.05em",
                      color: "var(--text-muted)",
                    }}
                  >
                    {spalte.hinweis}
                  </span>
                </div>
                {spalte.artikel.length === 0 ? (
                  <div
                    style={{
                      padding: "18px 14px",
                      border: "1px dashed var(--border-soft)",
                      borderRadius: 6,
                      color: "var(--text-muted)",
                      fontSize: "0.78rem",
                      textAlign: "center",
                    }}
                  >
                    Keine Artikel
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
