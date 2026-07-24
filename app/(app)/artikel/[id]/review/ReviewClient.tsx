"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FaktencheckClaim, QualitaetsScore } from "@/lib/ki";
import type { StilcheckErgebnis } from "@/lib/stilcheck";
import { aktualisiereAbschnittAction } from "./actions";

interface ReviewArtikel {
  id: string;
  titel: string;
  formatLabel: string;
  sponsored: boolean;
  kunde: string | null;
  qualitaetsScore: number | null;
  status: string;
}

interface ReviewAbschnitt {
  id: string;
  label: string;
  textbloecke: Array<{ index: number; text: string }>;
}

type Tab = "qualitaet" | "stilcheck" | "fakten";

const monoKlein: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.58rem",
  fontWeight: 600,
  letterSpacing: "0.1em",
  color: "var(--text-muted)",
};

export function ReviewClient({
  artikel,
  abschnitte,
  webPreview,
  outlookPreview,
  stilcheck,
  score,
  claims,
}: {
  artikel: ReviewArtikel;
  abschnitte: ReviewAbschnitt[];
  webPreview: string;
  outlookPreview: string;
  stilcheck: StilcheckErgebnis | null;
  score: QualitaetsScore | null;
  claims: FaktencheckClaim[];
}) {
  const router = useRouter();
  const [ansicht, setAnsicht] = useState<"web" | "outlook">("web");
  const [tab, setTab] = useState<Tab>("qualitaet");
  const [bearbeiteAbschnitt, setBearbeiteAbschnitt] = useState<ReviewAbschnitt | null>(null);
  const [entwuerfe, setEntwuerfe] = useState<Map<number, string>>(new Map());
  const [meldung, setMeldung] = useState<{ ok: boolean; text: string } | null>(null);
  const [speichert, startTransition] = useTransition();

  const scoreWert = artikel.qualitaetsScore;
  const scoreFarbe = scoreWert === null ? "var(--c-neutral-300)" : scoreWert >= 13 ? "var(--c-success)" : "var(--c-warning)";
  const ringUmfang = 2 * Math.PI * 34;
  const ringOffset = ringUmfang * (1 - (scoreWert ?? 0) / 16);

  const previewHtml = useMemo(
    () => (ansicht === "web" ? webPreview : outlookPreview),
    [ansicht, webPreview, outlookPreview]
  );

  function oeffneEditor(abschnitt: ReviewAbschnitt) {
    setMeldung(null);
    setEntwuerfe(new Map(abschnitt.textbloecke.map((block) => [block.index, block.text])));
    setBearbeiteAbschnitt(abschnitt);
  }

  function speichereAbschnitt() {
    if (!bearbeiteAbschnitt) {
      return;
    }
    const aenderungen = bearbeiteAbschnitt.textbloecke
      .filter((block) => entwuerfe.get(block.index) !== undefined && entwuerfe.get(block.index) !== block.text)
      .map((block) => ({ index: block.index, text: entwuerfe.get(block.index)! }));
    if (aenderungen.length === 0) {
      setBearbeiteAbschnitt(null);
      return;
    }
    startTransition(async () => {
      const ergebnis = await aktualisiereAbschnittAction(artikel.id, bearbeiteAbschnitt.id, aenderungen);
      setMeldung({ ok: ergebnis.ok, text: ergebnis.meldung });
      if (ergebnis.ok) {
        setBearbeiteAbschnitt(null);
        router.refresh();
      }
    });
  }

  return (
    <section style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
      <header
        style={{
          flex: "none",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 10,
          padding: "12px 20px",
          background: "var(--c-white)",
          borderBottom: "1px solid var(--border-soft)",
        }}
      >
        <Link href="/pipeline" className="button button-quiet" style={{ minHeight: 36, padding: "0.3rem 0.7rem", fontSize: "0.82rem" }}>
          ← Pipeline
        </Link>
        <div style={{ width: 1, height: 26, background: "var(--border-soft)" }} />
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={monoKlein}>ARTIKEL-REVIEW</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 2, minWidth: 0 }}>
            <h1
              style={{
                margin: 0,
                fontFamily: "var(--font-display)",
                fontSize: "1.02rem",
                fontWeight: 800,
                letterSpacing: "-0.025em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {artikel.titel}
            </h1>
            <span
              className={artikel.sponsored ? "tag tag-brass" : "tag tag-electric"}
              style={{ minHeight: 20, padding: "0.1rem 0.4rem", fontSize: "0.56rem", flex: "none" }}
            >
              {artikel.formatLabel}
            </span>
          </div>
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.68rem",
            fontWeight: 600,
            color: "var(--c-brass-700)",
            border: "1px solid var(--border-brass)",
            borderRadius: 4,
            padding: "6px 10px",
            background: "#fffdf7",
          }}
        >
          SCORE {scoreWert !== null ? `${scoreWert}/16` : "—"}
        </span>
        <button className="button button-secondary" disabled title="Verfügbar ab Meilenstein M4" style={{ minHeight: 38, padding: "0.4rem 0.9rem", fontSize: "0.86rem" }}>
          LinkedIn-Post erstellen
        </button>
        <button className="button button-primary" disabled title="Verfügbar ab Meilenstein M3" style={{ minHeight: 38, padding: "0.4rem 0.9rem", fontSize: "0.86rem" }}>
          Nach Ghost übertragen
        </button>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "250px minmax(460px, 1fr) 338px", flex: 1, minHeight: 0, overflowX: "auto" }}>
        {/* Outline */}
        <aside style={{ overflow: "auto", background: "var(--c-white)", borderRight: "1px solid var(--border-soft)", padding: "14px 10px" }}>
          <div style={{ ...monoKlein, padding: "0 10px 10px" }}>STRUKTUR / REDAKTIONSANLEITUNG</div>
          <div style={{ display: "grid", gap: 1 }}>
            {abschnitte.map((abschnitt, index) => (
              <button
                key={abschnitt.id}
                type="button"
                onClick={() => oeffneEditor(abschnitt)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  width: "100%",
                  padding: "9px 10px",
                  border: "none",
                  borderRadius: 4,
                  background: "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "0.82rem",
                  color: "var(--text-primary)",
                }}
              >
                <span style={{ ...monoKlein, color: "var(--c-blue-700)", paddingTop: 2 }}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  {abschnitt.label}
                  <span style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.56rem", letterSpacing: "0.04em", color: "var(--c-brass-700)" }}>
                    {abschnitt.textbloecke.length > 0 ? "BEARBEITBAR" : ""}
                  </span>
                </span>
              </button>
            ))}
            {artikel.sponsored ? (
              <div
                style={{
                  margin: "8px 4px 0",
                  padding: "10px 12px",
                  border: "1px dashed var(--border-medium)",
                  borderRadius: 4,
                  color: "var(--text-muted)",
                  fontSize: "0.74rem",
                  lineHeight: 1.55,
                }}
              >
                Gegenargumente und redaktionelle Wertung entfallen bei Sponsored Content.
              </div>
            ) : null}
          </div>
        </aside>

        {/* Preview */}
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0, background: "var(--surface-muted)" }}>
          <div
            style={{
              flex: "none",
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "10px 20px",
              borderBottom: "1px solid var(--border-soft)",
              background: "rgb(255 255 255 / 0.7)",
            }}
          >
            <div style={{ display: "flex", gap: 5 }}>
              {(
                [
                  { wert: "web", label: "Web-Ansicht" },
                  { wert: "outlook", label: "Outlook-Ansicht" },
                ] as const
              ).map((option) => (
                <button
                  key={option.wert}
                  type="button"
                  onClick={() => setAnsicht(option.wert)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 4,
                    border: "1px solid " + (ansicht === option.wert ? "var(--c-blue-700)" : "var(--border-medium)"),
                    background: ansicht === option.wert ? "var(--c-blue-050)" : "var(--c-white)",
                    color: ansicht === option.wert ? "var(--c-blue-800)" : "var(--text-secondary)",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <span style={{ flex: 1 }} />
            {ansicht === "outlook" ? (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.05em", color: "var(--c-warning)" }}>
                SIMULATION: ECKIGE KANTEN, VOLLFARBEN STATT VERLÄUFEN
              </span>
            ) : (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
                GH-CONTENT-WRAPPER MIT ECHTEN THEME-TABELLENREGELN
              </span>
            )}
          </div>
          <iframe
            title={ansicht === "web" ? "Web-Vorschau" : "Outlook-Vorschau"}
            srcDoc={previewHtml}
            sandbox=""
            style={{ flex: 1, width: "100%", border: "none", background: "#ffffff" }}
          />
        </div>

        {/* Prüf-Panel */}
        <aside style={{ display: "flex", flexDirection: "column", minHeight: 0, background: "var(--c-white)", borderLeft: "1px solid var(--border-soft)" }}>
          <div style={{ flex: "none", display: "flex", borderBottom: "1px solid var(--border-soft)" }}>
            {(
              [
                { wert: "qualitaet", label: "Qualität" },
                { wert: "stilcheck", label: "Stilcheck" },
                { wert: "fakten", label: "Faktencheck" },
              ] as const
            ).map((option) => (
              <button
                key={option.wert}
                type="button"
                onClick={() => setTab(option.wert)}
                style={{
                  flex: 1,
                  padding: "12px 8px",
                  border: "none",
                  borderBottom: tab === option.wert ? "2px solid var(--c-blue-700)" : "2px solid transparent",
                  background: "transparent",
                  color: tab === option.wert ? "var(--c-blue-800)" : "var(--text-muted)",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: "18px 16px" }}>
            {tab === "qualitaet" ? (
              <>
                <div style={{ display: "grid", justifyItems: "center", gap: 10, padding: "4px 0 16px" }}>
                  <div style={{ position: "relative", width: 104, height: 104 }}>
                    <svg width="104" height="104" viewBox="0 0 104 104">
                      <circle cx="52" cy="52" r="34" fill="none" stroke="var(--c-neutral-100)" strokeWidth="9" />
                      <circle
                        cx="52"
                        cy="52"
                        r="34"
                        fill="none"
                        stroke={scoreFarbe}
                        strokeWidth="9"
                        strokeLinecap="round"
                        strokeDasharray={ringUmfang}
                        strokeDashoffset={ringOffset}
                        transform="rotate(-90 52 52)"
                      />
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      {scoreWert !== null ? `${scoreWert}/16` : "—"}
                    </div>
                  </div>
                  <span
                    className={scoreWert !== null && scoreWert >= 13 ? "status status-good" : "status status-warning"}
                    style={{ minHeight: 22, padding: "0.14rem 0.5rem", fontSize: "0.58rem" }}
                  >
                    {scoreWert === null ? "Noch nicht geprüft" : scoreWert >= 13 ? "Publizierbar" : "Unter Schwelle 13/16"}
                  </span>
                </div>
                <div style={{ display: "grid" }}>
                  {(score?.kategorien ?? []).map((kategorie) => (
                    <div key={kategorie.kuerzel} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 2px", borderTop: "1px solid var(--border-soft)" }} title={kategorie.begruendung}>
                      <span style={{ flex: 1, fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)" }}>
                        {kategorie.kuerzel} · {kategorie.name}
                      </span>
                      {[0, 1].map((punkt) => (
                        <span
                          key={punkt}
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: kategorie.punkte > punkt ? "var(--c-blue-700)" : "var(--c-neutral-200)",
                          }}
                        />
                      ))}
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", fontWeight: 700, color: "var(--text-secondary)", width: 26, textAlign: "right" }}>
                        {kategorie.punkte}/2
                      </span>
                    </div>
                  ))}
                </div>
                <p style={{ margin: "12px 0 0", fontSize: "0.74rem", lineHeight: 1.6, color: "var(--text-muted)" }}>
                  Je Kategorie 0 bis 2 Punkte. Artikel unter 13 Punkten gehen zurück in die Aufbereitung.
                </p>
              </>
            ) : null}

            {tab === "stilcheck" ? (
              <>
                <div style={{ marginBottom: 12 }}>
                  <span
                    className={stilcheck && stilcheck.fehler.length === 0 ? "status status-good" : "status status-error"}
                    style={{ minHeight: 22, padding: "0.14rem 0.5rem", fontSize: "0.58rem" }}
                  >
                    {stilcheck
                      ? stilcheck.fehler.length === 0
                        ? `Bestanden · ${stilcheck.wortzahl.toLocaleString("de-DE")} Wörter`
                        : `${stilcheck.fehler.length} Fehler`
                      : "Noch nicht geprüft"}
                  </span>
                </div>
                <div style={{ display: "grid", gap: 8 }}>
                  {(stilcheck?.fehler ?? []).map((fehler, index) => (
                    <div key={`f-${index}`} style={{ padding: "10px 12px", border: "1px solid rgb(165 38 38 / 0.24)", borderRadius: 4, background: "var(--c-danger-bg)" }}>
                      <div style={{ ...monoKlein, color: "var(--c-danger)", marginBottom: 4 }}>FEHLER</div>
                      <div style={{ fontSize: "0.8rem", lineHeight: 1.55, color: "var(--text-secondary)" }}>{fehler}</div>
                    </div>
                  ))}
                  {(stilcheck?.warnungen ?? []).map((warnung, index) => (
                    <div key={`w-${index}`} style={{ padding: "10px 12px", border: "1px solid rgb(122 82 0 / 0.24)", borderRadius: 4, background: "var(--c-warning-bg)" }}>
                      <div style={{ ...monoKlein, color: "var(--c-warning)", marginBottom: 4 }}>WARNUNG</div>
                      <div style={{ fontSize: "0.8rem", lineHeight: 1.55, color: "var(--text-secondary)" }}>{warnung}</div>
                    </div>
                  ))}
                  {stilcheck && stilcheck.fehler.length === 0 && stilcheck.warnungen.length === 0 ? (
                    <div style={{ padding: "10px 12px", border: "1px solid rgb(23 102 58 / 0.24)", borderRadius: 4, background: "var(--c-success-bg)", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      Alle Prüfungen bestanden.
                    </div>
                  ) : null}
                </div>
                <p style={{ margin: "12px 0 0", fontSize: "0.74rem", lineHeight: 1.6, color: "var(--text-muted)" }}>
                  Geprüft: Em-Dashes, Buzzwords, E-Mail-Sicherheit, Web-Theme-Overrides, Pflicht-Strukturelemente
                  (deckungsgleich zu brand-rules/scripts/stilcheck.py).
                </p>
              </>
            ) : null}

            {tab === "fakten" ? (
              <>
                <div style={{ ...monoKlein, marginBottom: 10 }}>EXTRAHIERTE KERNAUSSAGEN</div>
                <div style={{ display: "grid", gap: 8 }}>
                  {claims.length === 0 ? (
                    <div style={{ padding: "10px 12px", border: "1px dashed var(--border-medium)", borderRadius: 4, color: "var(--text-muted)", fontSize: "0.78rem" }}>
                      Noch keine Kernaussagen extrahiert.
                    </div>
                  ) : (
                    claims.map((claim, index) => (
                      <div key={index} style={{ padding: "11px 12px", border: "1px solid var(--border-soft)", borderRadius: 4, background: "var(--c-white)" }}>
                        <div style={{ fontSize: "0.8rem", lineHeight: 1.55, color: "var(--text-primary)", marginBottom: 8 }}>{claim.aussage}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span
                            className={
                              claim.klassifikation === "BELEGT"
                                ? "status status-good"
                                : claim.klassifikation === "PROGNOSE"
                                  ? "status status-warning"
                                  : "status status-recommended"
                            }
                            style={{ minHeight: 20, padding: "0.1rem 0.4rem", fontSize: "0.54rem" }}
                          >
                            {claim.klassifikation}
                          </span>
                          <span style={{ flex: 1 }} />
                          {claim.quelle ? (
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.03em", color: "var(--c-blue-700)" }}>
                              {claim.quelle}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <p style={{ margin: "12px 0 0", fontSize: "0.74rem", lineHeight: 1.6, color: "var(--text-muted)" }}>
                  Klassifikation ausschließlich aus dem Dokument (BELEGT mit Quellenangabe, ABLEITUNG, PROGNOSE).
                  Eine Recherche-Stufe ist bewusst noch nicht angebunden.
                </p>
              </>
            ) : null}
          </div>
        </aside>
      </div>

      {/* Abschnitts-Editor */}
      {bearbeiteAbschnitt ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgb(18 30 57 / 0.45)",
            display: "grid",
            placeItems: "center",
            padding: 24,
          }}
        >
          <div className="card" style={{ width: "min(680px, 100%)", maxHeight: "calc(100vh - 48px)", overflow: "auto", padding: "24px 26px" }}>
            <div style={monoKlein}>ABSCHNITT BEARBEITEN</div>
            <h2 style={{ margin: "6px 0 4px", fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
              {bearbeiteAbschnitt.label}
            </h2>
            <p style={{ margin: "0 0 16px", color: "var(--text-secondary)", fontSize: "0.82rem", lineHeight: 1.6 }}>
              Änderungen werden in die Card übernommen; anschließend laufen Stilcheck, Qualitätsscore und
              Faktencheck erneut.
            </p>
            {bearbeiteAbschnitt.textbloecke.length === 0 ? (
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.82rem" }}>
                Dieser Abschnitt enthält keine direkt editierbaren Textblöcke.
              </p>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {bearbeiteAbschnitt.textbloecke.map((block) => (
                  <textarea
                    key={block.index}
                    value={entwuerfe.get(block.index) ?? block.text}
                    onChange={(ereignis) =>
                      setEntwuerfe((alt) => new Map(alt).set(block.index, ereignis.target.value))
                    }
                    rows={Math.min(6, Math.max(2, Math.ceil(block.text.length / 90)))}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid var(--c-neutral-300)",
                      borderRadius: 4,
                      fontSize: "0.86rem",
                      lineHeight: 1.6,
                      fontFamily: "var(--font-body)",
                      resize: "vertical",
                    }}
                  />
                ))}
              </div>
            )}
            {meldung ? (
              <p
                role="status"
                style={{
                  margin: "14px 0 0",
                  padding: "10px 12px",
                  borderRadius: 4,
                  fontSize: "0.82rem",
                  color: meldung.ok ? "var(--c-success)" : "var(--c-danger)",
                  background: meldung.ok ? "var(--c-success-bg)" : "var(--c-danger-bg)",
                  border: `1px solid ${meldung.ok ? "rgb(23 102 58 / 0.24)" : "rgb(165 38 38 / 0.24)"}`,
                }}
              >
                {meldung.text}
              </p>
            ) : null}
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button type="button" className="button button-primary" onClick={speichereAbschnitt} disabled={speichert || bearbeiteAbschnitt.textbloecke.length === 0}>
                {speichert ? "Speichert und prüft …" : "Speichern und erneut prüfen"}
              </button>
              <button type="button" className="button button-quiet" onClick={() => setBearbeiteAbschnitt(null)} disabled={speichert}>
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
