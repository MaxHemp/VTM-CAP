import Link from "next/link";
import { Topbar } from "@/components/shell/Topbar";
import { ladeEinstellungenFuerAnzeige } from "@/lib/einstellungen";
import { STANDARD_CTA_LABEL } from "@/lib/jobs";
import { UploadForm } from "./UploadForm";

export const dynamic = "force-dynamic";

export default async function NeuerArtikelSeite() {
  const einstellungen = await ladeEinstellungenFuerAnzeige();
  const ctaHinweis = einstellungen.ctaStandardLabel || STANDARD_CTA_LABEL;

  return (
    <section style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
      <Topbar
        bereich="REDAKTION / NEUER ARTIKEL"
        titel="Neuer Artikel"
        aktionen={
          <Link href="/pipeline" className="button button-quiet">
            Zur Pipeline
          </Link>
        }
      />
      <div style={{ flex: 1, overflow: "auto", padding: "24px 28px" }}>
        <UploadForm ctaHinweis={ctaHinweis} />
      </div>
    </section>
  );
}
