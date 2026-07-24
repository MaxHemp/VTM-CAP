import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Topbar } from "@/components/shell/Topbar";
import { FORMAT_LABELS, SCORE_MAXIMUM, STATUS_LABELS } from "@/lib/status";

export const dynamic = "force-dynamic";

function Zeile({ label, wert }: { label: string; wert: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 10, padding: "9px 0", borderTop: "1px solid var(--border-soft)" }}>
      <span
        style={{
          width: 150,
          flex: "none",
          fontFamily: "var(--font-mono)",
          fontSize: "0.6rem",
          fontWeight: 600,
          letterSpacing: "0.06em",
          color: "var(--text-muted)",
          paddingTop: 2,
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: "0.86rem", color: "var(--text-primary)" }}>{wert}</span>
    </div>
  );
}

export default async function ArtikelDetailSeite({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artikel = await prisma.artikel.findUnique({
    where: { id },
    include: { autor: { select: { name: true } } },
  });
  if (!artikel) {
    notFound();
  }

  return (
    <section style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
      <Topbar
        bereich="REDAKTION / ARTIKEL"
        titel={artikel.titel}
        aktionen={
          <Link href="/pipeline" className="button button-secondary">
            Zurück zur Pipeline
          </Link>
        }
      />
      <div style={{ flex: 1, overflow: "auto", padding: "22px 28px" }}>
        <div className="card" style={{ maxWidth: 720, padding: "20px 22px" }}>
          <h3
            style={{
              margin: "0 0 14px",
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Stammdaten
          </h3>
          <div style={{ display: "grid" }}>
            <Zeile label="Status" wert={STATUS_LABELS[artikel.status]} />
            <Zeile label="Format" wert={FORMAT_LABELS[artikel.format]} />
            <Zeile label="Kategorie" wert={artikel.kategorie ?? "—"} />
            <Zeile
              label="Sponsored"
              wert={artikel.sponsored ? `Ja · ${artikel.kunde ?? "Kunde offen"}` : "Nein"}
            />
            <Zeile label="Autor" wert={artikel.autor?.name ?? "—"} />
            <Zeile
              label="Qualitätsscore"
              wert={artikel.qualitaetsScore !== null ? `${artikel.qualitaetsScore}/${SCORE_MAXIMUM}` : "Noch nicht geprüft"}
            />
            <Zeile
              label="Ghost-Draft"
              wert={
                artikel.ghostDraftUrl ? (
                  <a href={artikel.ghostDraftUrl} target="_blank" rel="noreferrer">
                    Draft in Ghost öffnen
                  </a>
                ) : (
                  "—"
                )
              }
            />
            <Zeile
              label="Zuletzt geändert"
              wert={artikel.updatedAt.toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" })}
            />
          </div>
          <p style={{ margin: "16px 0 0", color: "var(--text-muted)", fontSize: "0.8rem", lineHeight: 1.6 }}>
            Upload, automatische Aufbereitung und der Review-Bildschirm folgen mit Meilenstein M2.
          </p>
        </div>
      </div>
    </section>
  );
}
