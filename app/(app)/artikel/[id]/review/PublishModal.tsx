"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  erstelleGhostDraftAction,
  ladePublishVorschlaegeAction,
} from "./actions";

const monoKlein: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.58rem",
  fontWeight: 600,
  letterSpacing: "0.12em",
  color: "var(--text-muted)",
};

const labelStil: React.CSSProperties = { fontSize: "0.8rem", fontWeight: 700 };

export function PublishModal({
  artikelId,
  initialHeadline,
  initialTags,
  ghostVerbunden,
  onSchliessen,
}: {
  artikelId: string;
  initialHeadline: string;
  initialTags: string[];
  ghostVerbunden: boolean;
  onSchliessen: () => void;
}) {
  const router = useRouter();
  const [headline, setHeadline] = useState(initialHeadline);
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState(initialTags.join(", "));
  const [headlineVorschlaege, setHeadlineVorschlaege] = useState<string[]>([]);
  const [excerptVorschlaege, setExcerptVorschlaege] = useState<string[]>([]);
  const [vorschlaegeFehler, setVorschlaegeFehler] = useState<string | null>(null);
  const [ladeVorschlaege, setLadeVorschlaege] = useState(true);
  const [fehler, setFehler] = useState<string | null>(null);
  const [ergebnis, setErgebnis] = useState<{ editorUrl: string; postId: string } | null>(null);
  const [sendet, startTransition] = useTransition();
  const bildInput = useRef<HTMLInputElement>(null);
  const [bildName, setBildName] = useState<string | null>(null);

  useEffect(() => {
    let aktiv = true;
    ladePublishVorschlaegeAction(artikelId).then((antwort) => {
      if (!aktiv) {
        return;
      }
      setLadeVorschlaege(false);
      if (antwort.ok) {
        setHeadlineVorschlaege(antwort.headlines);
        setExcerptVorschlaege(antwort.excerpts);
        if (antwort.excerpts[0]) {
          setExcerpt(antwort.excerpts[0]);
        }
      } else {
        setVorschlaegeFehler(antwort.meldung ?? "Vorschläge nicht verfügbar.");
      }
    });
    return () => {
      aktiv = false;
    };
  }, [artikelId]);

  function absenden() {
    setFehler(null);
    const formData = new FormData();
    formData.set("headline", headline);
    formData.set("excerpt", excerpt);
    formData.set("tags", tags);
    const bild = bildInput.current?.files?.[0];
    if (bild) {
      formData.set("featureImage", bild);
    }
    startTransition(async () => {
      const antwort = await erstelleGhostDraftAction(artikelId, formData);
      if (antwort.ok && antwort.editorUrl && antwort.postId) {
        setErgebnis({ editorUrl: antwort.editorUrl, postId: antwort.postId });
        router.refresh();
      } else {
        setFehler(antwort.meldung ?? "Der Ghost-Draft konnte nicht erstellt werden.");
      }
    });
  }

  const excerptZuLang = excerpt.length > 300;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 110,
        display: "grid",
        placeItems: "center",
        background: "rgb(8 13 24 / 0.55)",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "min(680px, 100%)",
          maxHeight: "calc(100vh - 48px)",
          overflow: "auto",
          background: "var(--c-white)",
          border: "1px solid var(--border-medium)",
          borderRadius: 8,
          boxShadow: "var(--shadow-medium)",
        }}
      >
        {ergebnis ? (
          <div style={{ display: "grid", justifyItems: "center", gap: 12, padding: "44px 32px 36px", textAlign: "center" }}>
            <span
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: "var(--c-success-bg)",
                border: "1px solid rgb(23 102 58 / 0.24)",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--c-success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 12.5l5 5L20 7"></path>
              </svg>
            </span>
            <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
              Draft in Ghost erstellt
            </h2>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
              ID {ergebnis.postId.slice(-8).toUpperCase()} · STATUS: DRAFT
            </div>
            <p style={{ margin: 0, maxWidth: 400, fontSize: "0.86rem", lineHeight: 1.6, color: "var(--text-secondary)" }}>
              Der Artikel liegt als Draft im Ghost CMS. Excerpt, Tags und Feature-Image wurden übernommen; die
              Pipeline-Karte wurde auf „In Ghost“ verschoben. Die Veröffentlichung bleibt bewusst ein manueller
              Schritt in Ghost.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <a href={ergebnis.editorUrl} target="_blank" rel="noreferrer" className="button button-primary">
                Draft in Ghost öffnen
              </a>
              <button type="button" className="button button-quiet" onClick={onSchliessen}>
                Schließen
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 24px 0" }}>
              <div style={{ flex: 1 }}>
                <div style={monoKlein}>GHOST CMS / ÜBERTRAGUNG</div>
                <h2 style={{ margin: "4px 0 0", fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
                  Nach Ghost übertragen
                </h2>
              </div>
              <span
                className={ghostVerbunden ? "status status-good" : "status status-warning"}
                style={{ minHeight: 22, padding: "0.14rem 0.5rem", fontSize: "0.56rem" }}
              >
                {ghostVerbunden ? "Verbunden" : "Nicht geprüft"}
              </span>
            </div>
            <div style={{ display: "grid", gap: 18, padding: "20px 24px" }}>
              <div style={{ display: "grid", gap: 7 }}>
                <label htmlFor="publish-headline" style={labelStil}>Headline</label>
                <input
                  id="publish-headline"
                  value={headline}
                  onChange={(ereignis) => setHeadline(ereignis.target.value)}
                  style={{ minHeight: 44, padding: "0 12px", border: "1px solid var(--c-neutral-300)", borderRadius: 4, fontSize: "0.9rem", fontWeight: 600, background: "var(--c-white)" }}
                />
                <div style={{ display: "grid", gap: 5, marginTop: 2 }}>
                  {ladeVorschlaege ? (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--text-muted)" }}>
                      KI-Vorschläge werden erzeugt …
                    </span>
                  ) : (
                    headlineVorschlaege.map((vorschlag, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setHeadline(vorschlag)}
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: 8,
                          width: "100%",
                          textAlign: "left",
                          padding: "8px 10px",
                          border: "1px dashed var(--border-medium)",
                          borderRadius: 4,
                          background: "var(--c-paper)",
                          cursor: "pointer",
                        }}
                      >
                        <span style={{ flex: "none", fontFamily: "var(--font-mono)", fontSize: "0.54rem", fontWeight: 700, letterSpacing: "0.08em", color: "var(--c-blue-700)" }}>
                          KI-VORSCHLAG
                        </span>
                        <span style={{ fontSize: "0.8rem", lineHeight: 1.45, color: "var(--text-secondary)" }}>{vorschlag}</span>
                      </button>
                    ))
                  )}
                  {vorschlaegeFehler ? (
                    <span style={{ fontSize: "0.74rem", color: "var(--c-warning)" }}>{vorschlaegeFehler}</span>
                  ) : null}
                </div>
              </div>

              <div style={{ display: "grid", gap: 7 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <label htmlFor="publish-excerpt" style={{ ...labelStil, flex: 1 }}>Excerpt</label>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.66rem",
                      fontWeight: 700,
                      color: excerptZuLang ? "var(--c-danger)" : "var(--text-muted)",
                    }}
                  >
                    {excerpt.length}/300
                  </span>
                </div>
                <textarea
                  id="publish-excerpt"
                  value={excerpt}
                  onChange={(ereignis) => setExcerpt(ereignis.target.value)}
                  rows={4}
                  style={{ padding: "10px 12px", border: "1px solid var(--c-neutral-300)", borderRadius: 4, fontSize: "0.84rem", lineHeight: 1.6, background: "var(--c-white)", resize: "vertical" }}
                />
                {excerptZuLang ? (
                  <p style={{ margin: 0, color: "var(--c-danger)", fontSize: "0.76rem", fontWeight: 600 }}>
                    Limit von 300 Zeichen überschritten. Ghost kürzt den Excerpt sonst automatisch.
                  </p>
                ) : null}
                <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
                  {excerptVorschlaege.map((vorschlag, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setExcerpt(vorschlag)}
                      style={{
                        padding: "5px 10px",
                        borderRadius: 4,
                        border: "1px solid " + (excerpt === vorschlag ? "var(--c-blue-700)" : "var(--border-medium)"),
                        background: excerpt === vorschlag ? "var(--c-blue-050)" : "var(--c-white)",
                        color: excerpt === vorschlag ? "var(--c-blue-800)" : "var(--text-secondary)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.62rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      V{index + 1} · {vorschlag.length} Z.
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ display: "grid", gap: 7, alignContent: "start" }}>
                  <label htmlFor="publish-tags" style={labelStil}>Tags</label>
                  <input
                    id="publish-tags"
                    value={tags}
                    onChange={(ereignis) => setTags(ereignis.target.value)}
                    placeholder="Kommagetrennt"
                    style={{ minHeight: 42, padding: "0 12px", border: "1px solid var(--c-neutral-300)", borderRadius: 4, fontSize: "0.84rem", background: "var(--c-white)" }}
                  />
                </div>
                <div style={{ display: "grid", gap: 7, alignContent: "start" }}>
                  <label htmlFor="publish-status" style={labelStil}>Status</label>
                  <select id="publish-status" disabled style={{ minHeight: 42, padding: "0 10px", border: "1px solid var(--c-neutral-300)", borderRadius: 4, fontSize: "0.84rem", background: "var(--c-white)" }}>
                    <option>Draft</option>
                  </select>
                  <small style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>
                    Es wird immer nur ein Draft erstellt, nie direkt publiziert.
                  </small>
                </div>
              </div>

              <div style={{ display: "grid", gap: 7 }}>
                <label style={labelStil}>Feature-Image</label>
                <input
                  ref={bildInput}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(ereignis) => setBildName(ereignis.target.files?.[0]?.name ?? null)}
                  style={{ fontSize: "0.82rem" }}
                />
                <small style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>
                  {bildName
                    ? `${bildName} wird über /admin/images/upload/ hochgeladen.`
                    : "Optional; wird über die Ghost Admin API hochgeladen. Beitragsbilder erzeugt das LinkedIn Studio (M4)."}
                </small>
              </div>

              {fehler ? (
                <p
                  role="alert"
                  style={{
                    margin: 0,
                    padding: "10px 12px",
                    borderRadius: 4,
                    fontSize: "0.82rem",
                    lineHeight: 1.55,
                    color: "var(--c-danger)",
                    background: "var(--c-danger-bg)",
                    border: "1px solid rgb(165 38 38 / 0.24)",
                  }}
                >
                  {fehler}
                </p>
              ) : null}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 24px", borderTop: "1px solid var(--border-soft)", background: "var(--c-paper)" }}>
              <button type="button" className="button button-quiet" onClick={onSchliessen} disabled={sendet}>
                Abbrechen
              </button>
              <button type="button" className="button button-primary" onClick={absenden} disabled={sendet || excerptZuLang || !headline.trim()}>
                {sendet ? "Erstellt Draft …" : "Draft erstellen"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
