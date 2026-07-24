import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { baueFreigabeUrl } from "@/lib/freigabe";
import { Topbar } from "@/components/shell/Topbar";
import { FreigabeVerwaltung } from "./FreigabeVerwaltung";

export const dynamic = "force-dynamic";

const STATUS_BADGES: Record<string, { label: string; klasse: string }> = {
  OFFEN: { label: "Offen", klasse: "status status-warning" },
  FREIGEGEBEN: { label: "Freigegeben", klasse: "status status-good" },
  AENDERUNG_ANGEFRAGT: { label: "Änderung angefragt", klasse: "status status-error" },
  ABGELAUFEN: { label: "Abgelaufen", klasse: "status status-optional" },
};

export default async function FreigabeUebersichtSeite() {
  const session = await auth();
  const darfErstellen = Boolean(session?.user.rechte.freigabenVerwalten);
  const sponsoredArtikel = await prisma.artikel.findMany({
    where: { sponsored: true, cardHtml: { not: null } },
    orderBy: { updatedAt: "desc" },
    select: { id: true, titel: true, kunde: true },
  });
  const tokens = await prisma.freigabeToken.findMany({
    orderBy: { createdAt: "desc" },
    take: 25,
    include: { artikel: { select: { titel: true, kunde: true } } },
  });

  return (
    <section style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
      <Topbar bereich="EXTERN / SPONSORED-FREIGABE" titel="Sponsored-Freigabe" />
      <div style={{ flex: 1, overflow: "auto", padding: "22px 28px", display: "grid", gap: 18, alignContent: "start" }}>
        <div className="card" style={{ padding: "20px 22px", maxWidth: 1160 }}>
          <h3 style={{ margin: "0 0 14px", fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Freigabelink erzeugen
          </h3>
          <FreigabeVerwaltung artikelListe={sponsoredArtikel} darfErstellen={darfErstellen} />
        </div>

        <div className="card" style={{ padding: "20px 22px", maxWidth: 1160 }}>
          <h3 style={{ margin: "0 0 14px", fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Versendete Freigabelinks
          </h3>
          {tokens.length === 0 ? (
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.84rem" }}>
              Noch keine Freigabelinks versendet.
            </p>
          ) : (
            <div style={{ display: "grid" }}>
              {tokens.map((token) => {
                const badge = STATUS_BADGES[token.status] ?? STATUS_BADGES.OFFEN!;
                return (
                  <div
                    key={token.id}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: "1px solid var(--border-soft)", flexWrap: "wrap" }}
                  >
                    <div style={{ flex: 1, minWidth: 240 }}>
                      <div style={{ fontSize: "0.86rem", fontWeight: 600 }}>{token.artikel.titel}</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
                        {token.kundeEmail} · ERSTELLT {token.createdAt.toLocaleDateString("de-DE")}
                        {token.gueltigBis ? ` · GÜLTIG BIS ${token.gueltigBis.toLocaleDateString("de-DE")}` : ""}
                      </div>
                      {token.kommentar ? (
                        <div style={{ marginTop: 4, fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                          Kommentar: „{token.kommentar}“
                        </div>
                      ) : null}
                    </div>
                    <span className={badge.klasse} style={{ minHeight: 22, padding: "0.14rem 0.5rem", fontSize: "0.56rem" }}>
                      {badge.label}
                    </span>
                    <a
                      href={baueFreigabeUrl(token.token)}
                      target="_blank"
                      rel="noreferrer"
                      className="button button-quiet"
                      style={{ minHeight: 30, padding: "0.2rem 0.55rem", fontSize: "0.76rem" }}
                    >
                      Kundenansicht öffnen
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
