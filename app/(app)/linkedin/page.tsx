import Link from "next/link";
import { Topbar } from "@/components/shell/Topbar";
import { EmptyState } from "@/components/ui/EmptyState";

export default function LinkedInStudioSeite() {
  return (
    <section style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
      <Topbar bereich="DISTRIBUTION / LINKEDIN STUDIO" titel="LinkedIn Studio" />
      <EmptyState
        titel="LinkedIn Studio folgt mit Meilenstein M4"
        beschreibung="Der Post-Generator mit Kanal-Umschalter (VTM-Kanal und Personal) sowie der Beitragsbild-Generator im VTM-Corporate-Design werden mit Meilenstein M4 verfügbar."
        aktionen={
          <Link href="/pipeline" className="button button-secondary">
            Zurück zur Pipeline
          </Link>
        }
      />
    </section>
  );
}
