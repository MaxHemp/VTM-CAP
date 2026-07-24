import Link from "next/link";
import { Topbar } from "@/components/shell/Topbar";
import { EmptyState } from "@/components/ui/EmptyState";

export default function FreigabeUebersichtSeite() {
  return (
    <section style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
      <Topbar bereich="EXTERN / SPONSORED-FREIGABE" titel="Sponsored-Freigabe" />
      <EmptyState
        titel="Kundenfreigabe folgt mit Meilenstein M5"
        beschreibung="Die Kundenansicht mit tokenisierten Freigabelinks, Diff-Ansicht (Kundentext gegen Card-Fließtext) und Freigabe-Workflow wird mit Meilenstein M5 verfügbar."
        aktionen={
          <Link href="/pipeline" className="button button-secondary">
            Zurück zur Pipeline
          </Link>
        }
      />
    </section>
  );
}
