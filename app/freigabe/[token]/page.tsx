import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ladeFreigabeToken } from "@/lib/freigabe";
import { htmlZuText } from "@/lib/entities";
import { parseAbschnitte, extrahiereTextbloecke } from "@/lib/card-abschnitte";
import { pruefeTextUebernahme } from "@/lib/diff";
import { FORMAT_LABELS } from "@/lib/status";
import { RueckmeldungForm } from "./RueckmeldungForm";

export const dynamic = "force-dynamic";

const monoKlein: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.6rem",
  fontWeight: 600,
  letterSpacing: "0.1em",
  color: "var(--text-muted)",
};

const STATUS_ANZEIGE: Record<string, { label: string; klasse: string }> = {
  OFFEN: { label: "Zur Freigabe", klasse: "status status-warning" },
  FREIGEGEBEN: { label: "Freigegeben", klasse: "status status-good" },
  AENDERUNG_ANGEFRAGT: { label: "Änderung angefragt", klasse: "status status-error" },
  ABGELAUFEN: { label: "Link abgelaufen", klasse: "status status-optional" },
};

function KopfZeile({ hinweis }: { hinweis: string }) {
  return (
    <>
      <div style={{ height: 4, background: "linear-gradient(90deg, #121e39 0%, #123fa6 48%, #2468e8 78%, #c99b32 96%, #e4c36e 100%)" }} />
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "16px 32px",
          background: "var(--c-white)",
          borderBottom: "1px solid var(--border-soft)",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Image src="/logos/vtm-icon-color.png" alt="" width={32} height={32} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--c-cobalt-950)" }}>
            VersicherungsTech <span style={{ color: "var(--c-blue-700)" }}>Magazin</span>
          </span>
        </div>
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.08em", color: "var(--text-muted)" }}>
          {hinweis}
        </span>
      </header>
    </>
  );
}

export default async function FreigabeSeite({ params }: { params: Promise<{ token: string }> }) {
  const { token: tokenWert } = await params;
  const geladen = await ladeFreigabeToken(tokenWert);

  if (!geladen) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--c-paper)" }}>
        <KopfZeile hinweis="SPONSORED-FREIGABE" />
        <div style={{ maxWidth: 620, margin: "0 auto", padding: "56px 24px" }}>
          <div className="card" style={{ padding: "32px 34px", textAlign: "center" }}>
            <h1 style={{ margin: "0 0 10px", fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
              Dieser Freigabelink ist ungültig
            </h1>
            <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.65 }}>
              Der Link wurde möglicherweise falsch kopiert oder bereits ersetzt. Bitte wenden Sie sich an Ihre
              Ansprechperson beim VersicherungsTech Magazin, um einen neuen Link zu erhalten.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const { token } = geladen;
  const artikel = token.artikel;
  const statusAnzeige = STATUS_ANZEIGE[token.status] ?? STATUS_ANZEIGE.OFFEN!;

  const abschnitte = artikel.cardHtml ? parseAbschnitte(artikel.cardHtml) : [];
  const lead = abschnitte.find((a) => a.id === "lead");
  const wichtigste = abschnitte.find((a) => a.id === "wichtigste");
  const leadText = lead ? htmlZuText(lead.html) : null;
  const wichtigstePunkte = wichtigste
    ? extrahiereTextbloecke(wichtigste.html)
        .map((block) => block.text)
        .filter((text) => text !== "Das Wichtigste")
    : [];
  const hauptteile = abschnitte.filter((a) => a.id.startsWith("hauptteil-"));

  const cardFliesstext = artikel.cardHtml ? htmlZuText(artikel.cardHtml) : "";
  const uebernahme =
    artikel.quelltextOriginal && cardFliesstext
      ? pruefeTextUebernahme(artikel.quelltextOriginal, cardFliesstext)
      : null;

  const verlauf = await prisma.auditLog.findMany({
    where: { artikelId: artikel.id, aktion: { in: ["ARTIKEL_HOCHGELADEN", "ARTIKEL_AUFBEREITET", "FREIGABE_ERTEILT", "FREIGABE_AENDERUNG_ANGEFRAGT", "FREIGABELINK_ERSTELLT"] } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  const verlaufTexte: Record<string, string> = {
    ARTIKEL_HOCHGELADEN: "Manuskript eingegangen",
    ARTIKEL_AUFBEREITET: "Aufbereitung abgeschlossen, Artikel im Review",
    FREIGABELINK_ERSTELLT: "Freigabelink an den Kunden versendet",
    FREIGABE_ERTEILT: "Kundenfreigabe erteilt",
    FREIGABE_AENDERUNG_ANGEFRAGT: "Kunde hat eine Änderung angefragt",
  };

  const gueltigHinweis = token.gueltigBis
    ? `SPONSORED-FREIGABE · GESICHERTER LINK · GÜLTIG BIS ${token.gueltigBis.toLocaleDateString("de-DE")}`
    : "SPONSORED-FREIGABE · GESICHERTER LINK";

  return (
    <main style={{ minHeight: "100vh", background: "var(--c-paper)" }}>
      <KopfZeile hinweis={gueltigHinweis} />
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "32px 24px 48px", display: "grid", gap: 18 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <span className="tag tag-brass">Anzeige · Sponsored Content</span>
            <span className={statusAnzeige.klasse} style={{ minHeight: 22, padding: "0.14rem 0.5rem", fontSize: "0.56rem" }}>
              {statusAnzeige.label}
            </span>
          </div>
          <h1 style={{ margin: "0 0 8px", fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.15 }}>
            {artikel.titel}
          </h1>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.64rem", letterSpacing: "0.05em", color: "var(--text-muted)", textTransform: "uppercase" }}>
            {artikel.kunde ?? "Kunde"} · {FORMAT_LABELS[artikel.format]} · Zur Freigabe seit {token.createdAt.toLocaleDateString("de-DE")}
          </div>
        </div>

        {/* Artikelvorschau */}
        <div className="card" style={{ padding: "22px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ ...monoKlein, flex: 1 }}>ARTIKELVORSCHAU</span>
            {artikel.cardHtml ? (
              <Link
                href={`/freigabe/${token.token}/vorschau`}
                target="_blank"
                className="button button-quiet"
                style={{ minHeight: 30, padding: "0.2rem 0.55rem", fontSize: "0.76rem" }}
              >
                Vollständige Vorschau öffnen
              </Link>
            ) : null}
          </div>
          {artikel.cardHtml ? (
            <>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.12em", color: "var(--c-blue-800)", marginBottom: 8, textTransform: "uppercase" }}>
                Sponsored Content / {FORMAT_LABELS[artikel.format]}
              </div>
              {leadText ? (
                <p style={{ margin: "0 0 12px", fontSize: "0.95rem", fontWeight: 600, lineHeight: 1.6, color: "var(--text-primary)" }}>
                  {leadText}
                </p>
              ) : null}
              {wichtigstePunkte.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>
                  {wichtigstePunkte.map((punkt, index) => (
                    <li key={index} style={{ fontSize: "0.86rem", lineHeight: 1.55, color: "var(--text-secondary)" }}>
                      {punkt}
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          ) : (
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.86rem", lineHeight: 1.6 }}>
              Die Aufbereitung dieses Artikels ist noch nicht abgeschlossen. Sie erhalten eine Nachricht, sobald
              die Vorschau bereitsteht.
            </p>
          )}
        </div>

        {/* Diff Kundentext / Umsetzung */}
        {uebernahme ? (
          <div className="card" style={{ padding: "22px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              <h3 style={{ flex: 1, margin: 0, fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
                Ihr Text / Unsere Umsetzung
              </h3>
              {uebernahme.einsZuEins ? (
                <span className="status status-good" style={{ minHeight: 22, padding: "0.14rem 0.5rem", fontSize: "0.56rem" }}>
                  Text 1:1 übernommen
                </span>
              ) : (
                <span className="status status-warning" style={{ minHeight: 22, padding: "0.14rem 0.5rem", fontSize: "0.56rem" }}>
                  {uebernahme.uebernommen}/{uebernahme.gesamt} Sätze unverändert
                </span>
              )}
            </div>
            <div className="freigabe-diff" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ padding: "14px 16px", border: "1px solid var(--border-soft)", borderRadius: 4, background: "var(--c-paper-blue)" }}>
                <div style={{ ...monoKlein, fontSize: "0.56rem", marginBottom: 8 }}>IHR TEXT (MANUSKRIPT)</div>
                <div style={{ display: "grid", gap: 6 }}>
                  {uebernahme.saetze.map((eintrag, index) => (
                    <span
                      key={index}
                      style={{
                        fontSize: "0.84rem",
                        lineHeight: 1.6,
                        color: eintrag.uebernommen ? "var(--text-secondary)" : "var(--c-warning)",
                        background: eintrag.uebernommen ? "transparent" : "var(--c-warning-bg)",
                        borderRadius: 3,
                        padding: eintrag.uebernommen ? 0 : "1px 4px",
                      }}
                      title={eintrag.uebernommen ? "Unverändert übernommen (Typografie-Normalisierung)" : "Nicht wörtlich in der Umsetzung gefunden"}
                    >
                      {eintrag.satz}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ padding: "14px 16px", border: "1px solid var(--border-electric)", borderRadius: 4, background: "var(--c-white)" }}>
                <div style={{ ...monoKlein, fontSize: "0.56rem", color: "var(--c-blue-800)", marginBottom: 8 }}>UNSERE UMSETZUNG</div>
                <p style={{ margin: "0 0 10px", fontSize: "0.84rem", lineHeight: 1.65, color: "var(--text-secondary)" }}>
                  {leadText ?? cardFliesstext.slice(0, 260)}
                </p>
                <div style={{ display: "grid", gap: 4 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.56rem", letterSpacing: "0.04em", color: "var(--c-blue-700)" }}>
                    + ZWISCHENÜBERSCHRIFTEN ERGÄNZT ({hauptteile.length})
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.56rem", letterSpacing: "0.04em", color: "var(--c-blue-700)" }}>
                    + „DAS WICHTIGSTE“ UND CTA ERGÄNZT
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.56rem", letterSpacing: "0.04em", color: "var(--c-blue-700)" }}>
                    + KENNZEICHNUNG „ANZEIGE“ VOR TITEL
                  </span>
                </div>
                <p style={{ margin: "12px 0 0", fontSize: "0.72rem", lineHeight: 1.55, color: "var(--text-muted)" }}>
                  Als gleich gelten ausschließlich Typografie-Änderungen (z. B. Gedankenstrich-Bereinigung);
                  geprüft wird über den Hash-Vergleich der normalisierten Texte.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Rückmeldung */}
        <div className="card" style={{ padding: "22px 24px" }}>
          <div style={{ ...monoKlein, marginBottom: 12 }}>IHRE RÜCKMELDUNG</div>
          {token.status === "OFFEN" ? (
            <RueckmeldungForm token={token.token} />
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", border: "1px solid var(--border-soft)", borderRadius: 4, background: "var(--c-paper-blue)", flexWrap: "wrap" }}>
              <span className={statusAnzeige.klasse} style={{ minHeight: 22, padding: "0.14rem 0.5rem", fontSize: "0.56rem" }}>
                {statusAnzeige.label}
              </span>
              <span style={{ fontSize: "0.84rem", lineHeight: 1.55, color: "var(--text-secondary)" }}>
                {token.status === "FREIGEGEBEN"
                  ? "Vielen Dank, die Freigabe wurde übermittelt. Die Redaktion plant jetzt die Veröffentlichung."
                  : token.status === "AENDERUNG_ANGEFRAGT"
                    ? `Ihre Änderungsanfrage wurde übermittelt${token.kommentar ? `: „${token.kommentar}“` : "."} Die Redaktion meldet sich bei Ihnen.`
                    : "Dieser Link ist abgelaufen. Bitte fordern Sie bei der Redaktion einen neuen Freigabelink an."}
              </span>
            </div>
          )}
        </div>

        {/* Statusverlauf */}
        <div className="card" style={{ padding: "22px 24px" }}>
          <div style={{ ...monoKlein, marginBottom: 8 }}>STATUSVERLAUF</div>
          <div style={{ display: "grid" }}>
            {verlauf.length === 0 ? (
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.82rem" }}>Noch keine Einträge.</p>
            ) : (
              verlauf.map((eintrag) => (
                <div key={eintrag.id} style={{ display: "flex", gap: 14, padding: "10px 0", borderTop: "1px solid var(--border-soft)" }}>
                  <span style={{ flex: "none", fontFamily: "var(--font-mono)", fontSize: "0.64rem", fontWeight: 600, color: "var(--c-blue-800)", paddingTop: 1 }}>
                    {eintrag.createdAt.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}
                  </span>
                  <span style={{ fontSize: "0.84rem", lineHeight: 1.55, color: "var(--text-secondary)" }}>
                    {verlaufTexte[eintrag.aktion] ?? eintrag.aktion}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
