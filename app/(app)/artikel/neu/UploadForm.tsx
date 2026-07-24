"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  erstelleArtikelAction,
  verarbeiteNaechstenSchrittAction,
  type JobZustand,
} from "./actions";

const KATEGORIEN = [
  "KI & Automatisierung",
  "Kernsysteme",
  "Markt & Strategie",
  "Regulatorik",
  "IT-Security",
];

const FORMATE = [
  { wert: "EINORDNUNG", label: "Einordnung" },
  { wert: "ANALYSE", label: "Analyse" },
  { wert: "PRAXIS_CASE", label: "Praxis-Case" },
  { wert: "LEITFADEN", label: "Leitfaden" },
  { wert: "INTERVIEW", label: "Interview" },
];

const labelStil: React.CSSProperties = { fontSize: "0.8rem", fontWeight: 700 };
const eingabeStil: React.CSSProperties = {
  minHeight: 42,
  padding: "0 12px",
  border: "1px solid var(--c-neutral-300)",
  borderRadius: 4,
  fontSize: "0.84rem",
  background: "var(--c-white)",
};

export function UploadForm({ ctaHinweis }: { ctaHinweis: string }) {
  const router = useRouter();
  const dateiInput = useRef<HTMLInputElement>(null);
  const [datei, setDatei] = useState<File | null>(null);
  const [sponsored, setSponsored] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const [job, setJob] = useState<JobZustand | null>(null);
  const [laeuft, setLaeuft] = useState(false);

  async function starteVerarbeitung(formData: FormData) {
    setFehler(null);
    if (!datei) {
      setFehler("Bitte legen Sie ein Manuskript ab (DOCX, Markdown, TXT oder PDF).");
      return;
    }
    formData.set("datei", datei);
    formData.set("sponsored", sponsored ? "1" : "0");
    setLaeuft(true);
    try {
      const ergebnis = await erstelleArtikelAction(formData);
      if (!ergebnis.ok || !ergebnis.jobId || !ergebnis.artikelId) {
        setFehler(ergebnis.meldung ?? "Der Artikel konnte nicht angelegt werden.");
        setLaeuft(false);
        return;
      }
      let zustand = await verarbeiteNaechstenSchrittAction(ergebnis.jobId);
      setJob(zustand);
      while (zustand.status !== "FERTIG" && zustand.status !== "FEHLGESCHLAGEN") {
        zustand = await verarbeiteNaechstenSchrittAction(ergebnis.jobId);
        setJob(zustand);
      }
      if (zustand.status === "FERTIG") {
        router.push(`/artikel/${ergebnis.artikelId}/review`);
        return;
      }
      setFehler(zustand.fehler ?? "Die Verarbeitung ist fehlgeschlagen.");
      setLaeuft(false);
    } catch (unbekannt) {
      setFehler(unbekannt instanceof Error ? unbekannt.message : "Die Verarbeitung ist fehlgeschlagen.");
      setLaeuft(false);
    }
  }

  if (job) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "100%" }}>
        <div className="card" style={{ width: "min(560px, 100%)", padding: "30px 32px" }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.62rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              color: "var(--text-muted)",
            }}
          >
            VERARBEITUNG
          </div>
          <h2
            style={{
              margin: "8px 0 4px",
              fontFamily: "var(--font-display)",
              fontSize: "1.2rem",
              fontWeight: 800,
              letterSpacing: "-0.03em",
            }}
          >
            Manuskript wird aufbereitet
          </h2>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: 22 }}>
            {datei?.name}
          </div>
          <div style={{ display: "grid" }}>
            {job.schrittStatus.map((schritt) => {
              const aktiv = job.status === "LAEUFT" && schritt.schritt === job.schritt + 1;
              const farbe =
                schritt.status === "FERTIG"
                  ? "var(--c-success)"
                  : schritt.status === "FEHLGESCHLAGEN"
                    ? "var(--c-danger)"
                    : aktiv
                      ? "var(--c-blue-700)"
                      : "var(--text-muted)";
              return (
                <div
                  key={schritt.schritt}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "13px 0",
                    borderTop: "1px solid var(--border-soft)",
                  }}
                >
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      flex: "none",
                      display: "grid",
                      placeItems: "center",
                      borderRadius: "50%",
                      border: `2px solid ${farbe}`,
                      color: farbe,
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      animation: aktiv ? "vtm-step-pulse 1.4s ease-in-out infinite" : undefined,
                    }}
                  >
                    {schritt.status === "FERTIG" ? "✓" : schritt.schritt}
                  </span>
                  <span style={{ fontSize: "0.88rem", fontWeight: aktiv ? 700 : 500, color: "var(--text-primary)" }}>
                    {schritt.name}
                  </span>
                  <span style={{ flex: 1 }} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--text-muted)" }}>
                    {schritt.info ??
                      (schritt.status === "FERTIG"
                        ? "Fertig"
                        : schritt.status === "FEHLGESCHLAGEN"
                          ? "Fehlgeschlagen"
                          : aktiv
                            ? "Läuft …"
                            : "Wartet")}
                  </span>
                </div>
              );
            })}
          </div>
          {fehler ? (
            <p
              role="alert"
              style={{
                margin: "18px 0 0",
                padding: "10px 12px",
                borderRadius: 4,
                fontSize: "0.84rem",
                lineHeight: 1.55,
                color: "var(--c-danger)",
                background: "var(--c-danger-bg)",
                border: "1px solid rgb(165 38 38 / 0.24)",
              }}
            >
              {fehler}
            </p>
          ) : (
            <p style={{ margin: "18px 0 0", color: "var(--text-muted)", fontSize: "0.78rem", lineHeight: 1.6 }}>
              Der Autorentext wird nicht verändert. Ergänzt werden Struktur, HTML-Card im Corporate Design und
              die Prüfberichte.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <form action={starteVerarbeitung} className="upload-grid">
      <div className="card" style={{ padding: 22 }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            color: "var(--text-muted)",
            marginBottom: 14,
          }}
        >
          MANUSKRIPT
        </div>
        <input
          ref={dateiInput}
          type="file"
          accept=".docx,.pdf,.md,.markdown,.txt"
          style={{ display: "none" }}
          onChange={(ereignis) => setDatei(ereignis.target.files?.[0] ?? null)}
        />
        {!datei ? (
          <button
            type="button"
            onClick={() => dateiInput.current?.click()}
            style={{
              display: "grid",
              justifyItems: "center",
              gap: 12,
              width: "100%",
              padding: "64px 32px",
              background: "var(--c-paper-blue)",
              border: "1.5px dashed var(--border-medium)",
              borderRadius: 6,
              cursor: "pointer",
              textAlign: "center",
            }}
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--c-blue-700)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 16V4M7 9l5-5 5 5M4 20h16"></path>
            </svg>
            <strong style={{ fontFamily: "var(--font-display)", fontSize: "1rem", letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
              Manuskript hier ablegen
            </strong>
            <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.6 }}>
              oder klicken, um eine Datei auszuwählen.
              <br />
              Der fertige Autorentext wird unverändert übernommen.
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
              DOCX · MARKDOWN · TXT · PDF · MAX. 20 MB
            </span>
          </button>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: 16,
              border: "1px solid var(--border-electric)",
              borderRadius: 6,
              background: "var(--c-blue-050)",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--c-blue-800)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"></path>
              <path d="M14 3v5h5"></path>
            </svg>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.74rem", fontWeight: 600, color: "var(--text-primary)" }}>
                {datei.name}
              </div>
              <div style={{ marginTop: 2 }}>
                <span className="status status-good" style={{ minHeight: 20, padding: "0.1rem 0.4rem", fontSize: "0.56rem" }}>
                  Bereit
                </span>
              </div>
            </div>
            <button
              type="button"
              className="button button-quiet"
              style={{ minHeight: 34, padding: "0.3rem 0.7rem", fontSize: "0.8rem" }}
              onClick={() => {
                setDatei(null);
                if (dateiInput.current) {
                  dateiInput.current.value = "";
                }
              }}
            >
              Entfernen
            </button>
          </div>
        )}
        <p style={{ margin: "14px 0 0", color: "var(--text-muted)", fontSize: "0.8rem", lineHeight: 1.6 }}>
          Die Struktur wird beim Verarbeiten gegen die VTM-Redaktionsanleitung geprüft (Stilcheck,
          Qualitätsscore 13/16, Faktencheck).
        </p>
      </div>

      <div className="card" style={{ padding: 22, display: "grid", gap: 16 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.1em", color: "var(--text-muted)" }}>
          BRIEFING
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <label htmlFor="kategorie" style={labelStil}>Kategorie</label>
            <select id="kategorie" name="kategorie" style={{ ...eingabeStil, cursor: "pointer" }}>
              {KATEGORIEN.map((kategorie) => (
                <option key={kategorie}>{kategorie}</option>
              ))}
            </select>
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            <label htmlFor="format" style={labelStil}>Artikelformat</label>
            <select id="format" name="format" style={{ ...eingabeStil, cursor: "pointer" }} defaultValue="ANALYSE">
              {FORMATE.map((format) => (
                <option key={format.wert} value={format.wert}>
                  {format.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          <label htmlFor="zentraleFrage" style={labelStil}>Zentrale Frage</label>
          <input id="zentraleFrage" name="zentraleFrage" placeholder="Welche Frage beantwortet der Artikel?" style={eingabeStil} />
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          <label htmlFor="anlass" style={labelStil}>Anlass</label>
          <input id="anlass" name="anlass" placeholder="z. B. Pressemitteilung, Studie, Regulatorik-Termin" style={eingabeStil} />
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          <span style={labelStil}>CTA-Ziel</span>
          <div style={{ ...eingabeStil, display: "flex", alignItems: "center", color: "var(--text-secondary)" }}>{ctaHinweis}</div>
          <small style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>
            Genau ein CTA pro Artikel; Standardziel aus den Einstellungen.
          </small>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 14px",
            border: "1px solid var(--border-soft)",
            borderRadius: 6,
            background: "var(--c-paper)",
          }}
        >
          <button
            type="button"
            role="switch"
            aria-checked={sponsored}
            aria-label="Sponsored Content umschalten"
            onClick={() => setSponsored((wert) => !wert)}
            style={{
              width: 40,
              height: 22,
              flex: "none",
              borderRadius: 11,
              border: "none",
              cursor: "pointer",
              position: "relative",
              background: sponsored ? "var(--c-brass-600)" : "var(--c-neutral-300)",
              transition: "background 160ms ease",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 3,
                left: sponsored ? 21 : 3,
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "#fff",
                transition: "left 160ms ease",
              }}
            />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "0.84rem", fontWeight: 700 }}>Sponsored Content</div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.74rem", lineHeight: 1.5 }}>
              Kennzeichnung „Anzeige“, Kundentext 1:1, Kundenfreigabe wird Pflichtschritt.
            </div>
          </div>
        </div>
        {sponsored ? (
          <div style={{ display: "grid", gap: 6 }}>
            <label htmlFor="kunde" style={labelStil}>Kundenname</label>
            <input id="kunde" name="kunde" placeholder="z. B. d.velop" style={eingabeStil} />
          </div>
        ) : null}
        {fehler ? (
          <p
            role="alert"
            style={{
              margin: 0,
              padding: "10px 12px",
              borderRadius: 4,
              fontSize: "0.84rem",
              lineHeight: 1.55,
              color: "var(--c-danger)",
              background: "var(--c-danger-bg)",
              border: "1px solid rgb(165 38 38 / 0.24)",
            }}
          >
            {fehler}
          </p>
        ) : null}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 2 }}>
          <button type="submit" className="button button-primary" disabled={laeuft}>
            {laeuft ? "Startet …" : "Verarbeitung starten"}
          </button>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
            4 SCHRITTE · CA. 40–90 SEKUNDEN
          </span>
        </div>
      </div>
    </form>
  );
}
