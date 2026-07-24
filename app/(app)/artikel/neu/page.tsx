import Link from "next/link";
import { Topbar } from "@/components/shell/Topbar";
import { EmptyState } from "@/components/ui/EmptyState";

export default function NeuerArtikelSeite() {
  return (
    <section style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
      <Topbar bereich="REDAKTION / NEUER ARTIKEL" titel="Neuer Artikel" />
      <EmptyState
        titel="Upload folgt mit Meilenstein M2"
        beschreibung="Der Artikel-Upload (DOCX, Markdown, TXT, PDF) mit Briefing-Formular und automatischer Aufbereitung wird mit Meilenstein M2 (Artikel-Pipeline) verfügbar."
        aktionen={
          <Link href="/pipeline" className="button button-secondary">
            Zurück zur Pipeline
          </Link>
        }
      />
    </section>
  );
}
