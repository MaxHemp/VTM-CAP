import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { parseAbschnitte, extrahiereTextbloecke } from "@/lib/card-abschnitte";
import { baueOutlookPreview, baueWebPreview } from "@/lib/preview";
import { FORMAT_LABELS } from "@/lib/status";
import type { FaktencheckClaim, QualitaetsScore } from "@/lib/ki";
import type { StilcheckErgebnis } from "@/lib/stilcheck";
import { ReviewClient } from "./ReviewClient";

export const dynamic = "force-dynamic";

export default async function ReviewSeite({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artikel = await prisma.artikel.findUnique({ where: { id } });
  if (!artikel) {
    notFound();
  }
  if (!artikel.cardHtml) {
    redirect(`/artikel/${id}`);
  }

  const abschnitte = parseAbschnitte(artikel.cardHtml).map((abschnitt) => ({
    id: abschnitt.id,
    label: abschnitt.label,
    textbloecke: extrahiereTextbloecke(abschnitt.html),
  }));

  return (
    <ReviewClient
      artikel={{
        id: artikel.id,
        titel: artikel.titel,
        formatLabel: FORMAT_LABELS[artikel.format],
        sponsored: artikel.sponsored,
        kunde: artikel.kunde,
        qualitaetsScore: artikel.qualitaetsScore,
        status: artikel.status,
      }}
      abschnitte={abschnitte}
      webPreview={baueWebPreview(artikel.cardHtml, artikel.titel)}
      outlookPreview={baueOutlookPreview(artikel.cardHtml, artikel.titel)}
      stilcheck={(artikel.stilcheckFindings as unknown as StilcheckErgebnis) ?? null}
      score={(artikel.scoreDetails as unknown as QualitaetsScore) ?? null}
      claims={(artikel.faktencheckClaims as unknown as FaktencheckClaim[]) ?? []}
    />
  );
}
