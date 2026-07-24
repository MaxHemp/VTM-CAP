import Link from "next/link";
import { prisma } from "@/lib/db";
import { Topbar } from "@/components/shell/Topbar";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkedInStudio } from "./LinkedInStudio";

export const dynamic = "force-dynamic";

export default async function LinkedInStudioSeite({
  searchParams,
}: {
  searchParams: Promise<{ artikel?: string }>;
}) {
  const { artikel: initialArtikelId } = await searchParams;
  const artikel = await prisma.artikel.findMany({
    where: { cardHtml: { not: null } },
    orderBy: { updatedAt: "desc" },
    select: { id: true, titel: true, sponsored: true, kunde: true, kategorie: true },
  });

  return (
    <section style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
      <Topbar bereich="DISTRIBUTION / LINKEDIN STUDIO" titel="LinkedIn Studio" />
      {artikel.length === 0 ? (
        <EmptyState
          titel="Noch kein aufbereiteter Artikel"
          beschreibung="Das LinkedIn Studio arbeitet mit aufbereiteten Artikeln. Laden Sie zuerst ein Manuskript hoch und schließen Sie die Verarbeitung ab."
          aktionen={
            <Link href="/artikel/neu" className="button button-primary">
              Artikel hochladen
            </Link>
          }
        />
      ) : (
        <div style={{ flex: 1, overflow: "auto", padding: "22px 28px" }}>
          <LinkedInStudio artikelListe={artikel} initialArtikelId={initialArtikelId ?? null} />
        </div>
      )}
    </section>
  );
}
