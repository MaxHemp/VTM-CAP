"use client";

import { useMemo, useState, useTransition } from "react";
import type { LinkedInKanal } from "@prisma/client";
import {
  BILD_FORMATE,
  BILD_TEMPLATES,
  EXPORT_FAKTOR,
  baueBeitragsbildSvg,
  type BildFormat,
  type BildTemplate,
} from "@/lib/beitragsbild";
import { KANAL_HINWEISE } from "@/lib/linkedin";
import { generiereLinkedInPostsAction, type LinkedInPostVariante } from "./actions";

export interface StudioArtikel {
  id: string;
  titel: string;
  sponsored: boolean;
  kunde: string | null;
  kategorie: string | null;
}

const monoLabel: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "0.6rem",
  fontWeight: 600,
  letterSpacing: "0.1em",
  color: "var(--text-muted)",
};

function umschaltKnopf(aktiv: boolean): React.CSSProperties {
  return {
    padding: "6px 12px",
    borderRadius: 4,
    border: "1px solid " + (aktiv ? "var(--c-blue-700)" : "var(--border-medium)"),
    background: aktiv ? "var(--c-blue-050)" : "var(--c-white)",
    color: aktiv ? "var(--c-blue-800)" : "var(--text-secondary)",
    fontSize: "0.78rem",
    fontWeight: 700,
    cursor: "pointer",
  };
}

export function LinkedInStudio({
  artikelListe,
  initialArtikelId,
}: {
  artikelListe: StudioArtikel[];
  initialArtikelId: string | null;
}) {
  const [artikelId, setArtikelId] = useState(initialArtikelId ?? artikelListe[0]?.id ?? "");
  const [kanal, setKanal] = useState<LinkedInKanal>("VTM");
  const [varianten, setVarianten] = useState<LinkedInPostVariante[]>([]);
  const [fehler, setFehler] = useState<string | null>(null);
  const [kopiert, setKopiert] = useState<number | null>(null);
  const [laeuft, startTransition] = useTransition();

  const artikel = artikelListe.find((eintrag) => eintrag.id === artikelId) ?? null;

  const [bildFormat, setBildFormat] = useState<BildFormat>("1200x630");
  const [template, setTemplate] = useState<BildTemplate>("konzept");
  const [titelzeile, setTitelzeile] = useState(artikel?.titel ?? "");
  const [unterzeile, setUnterzeile] = useState("versicherungstech-magazin.de");
  const [laedtBild, setLaedtBild] = useState(false);

  const svg = useMemo(
    () =>
      baueBeitragsbildSvg({
        template,
        format: bildFormat,
        titel: titelzeile || "Titelzeile eingeben",
        unterzeile,
        sponsored: artikel?.sponsored ?? false,
        kunde: artikel?.kunde ?? null,
      }),
    [template, bildFormat, titelzeile, unterzeile, artikel]
  );

  const { breite, hoehe } = BILD_FORMATE[bildFormat];

  function generierePosts() {
    if (!artikelId) {
      setFehler("Bitte wählen Sie einen Artikel aus.");
      return;
    }
    setFehler(null);
    startTransition(async () => {
      const ergebnis = await generiereLinkedInPostsAction(artikelId, kanal);
      if (ergebnis.ok) {
        setVarianten(ergebnis.varianten);
      } else {
        setVarianten([]);
        setFehler(ergebnis.meldung ?? "Die Post-Generierung ist fehlgeschlagen.");
      }
    });
  }

  async function kopiere(text: string, index: number) {
    await navigator.clipboard.writeText(text);
    setKopiert(index);
    setTimeout(() => setKopiert(null), 1600);
  }

  async function ladeBildHerunter() {
    setLaedtBild(true);
    try {
      const antwort = await fetch("/api/beitragsbild", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template,
          format: bildFormat,
          titel: titelzeile,
          unterzeile,
          sponsored: artikel?.sponsored ?? false,
          kunde: artikel?.kunde ?? null,
        }),
      });
      if (!antwort.ok) {
        throw new Error("Der PNG-Export ist fehlgeschlagen.");
      }
      const blob = await antwort.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `vtm-beitragsbild-${template}-${breite * EXPORT_FAKTOR}x${hoehe * EXPORT_FAKTOR}.png`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (unbekannt) {
      setFehler(unbekannt instanceof Error ? unbekannt.message : "Der PNG-Export ist fehlgeschlagen.");
    } finally {
      setLaedtBild(false);
    }
  }

  return (
    <div className="studio-grid">
      <div style={{ display: "grid", gap: 14 }}>
        <div className="card" style={{ padding: "18px 20px", display: "grid", gap: 14 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <label htmlFor="studio-artikel" style={monoLabel}>ARTIKEL</label>
            <select
              id="studio-artikel"
              value={artikelId}
              onChange={(ereignis) => {
                setArtikelId(ereignis.target.value);
                const gewaehlt = artikelListe.find((eintrag) => eintrag.id === ereignis.target.value);
                setTitelzeile(gewaehlt?.titel ?? "");
                setVarianten([]);
              }}
              style={{
                minHeight: 42,
                padding: "0 10px",
                border: "1px solid var(--c-neutral-300)",
                borderRadius: 4,
                fontSize: "0.86rem",
                fontWeight: 600,
                background: "var(--c-white)",
                cursor: "pointer",
              }}
            >
              {artikelListe.map((eintrag) => (
                <option key={eintrag.id} value={eintrag.id}>
                  {eintrag.titel}
                  {eintrag.sponsored ? ` (Sponsored, ${eintrag.kunde ?? "Kunde"})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: "grid", gap: 6 }}>
            <span style={monoLabel}>KANAL</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button type="button" style={umschaltKnopf(kanal === "VTM")} onClick={() => setKanal("VTM")}>
                VTM-Kanal (Sie)
              </button>
              <button type="button" style={umschaltKnopf(kanal === "PERSONAL")} onClick={() => setKanal("PERSONAL")}>
                Personal (Du)
              </button>
            </div>
            <p style={{ margin: "2px 0 0", fontSize: "0.76rem", lineHeight: 1.55, color: "var(--text-muted)" }}>
              {KANAL_HINWEISE[kanal]}
            </p>
          </div>
          <div>
            <button type="button" className="button button-primary" onClick={generierePosts} disabled={laeuft || artikelListe.length === 0}>
              {laeuft ? "Generiert Varianten …" : "Post-Varianten generieren"}
            </button>
          </div>
          {fehler ? (
            <p
              role="alert"
              style={{
                margin: 0,
                padding: "10px 12px",
                borderRadius: 4,
                fontSize: "0.82rem",
                color: "var(--c-danger)",
                background: "var(--c-danger-bg)",
                border: "1px solid rgb(165 38 38 / 0.24)",
              }}
            >
              {fehler}
            </p>
          ) : null}
        </div>

        {varianten.length === 0 && !laeuft ? (
          <div
            style={{
              padding: "26px 24px",
              border: "1px dashed var(--border-medium)",
              borderRadius: 6,
              color: "var(--text-muted)",
              fontSize: "0.84rem",
              lineHeight: 1.6,
              background: "var(--c-paper)",
            }}
          >
            Noch keine Varianten erzeugt. Wählen Sie Artikel und Kanal und starten Sie die Generierung; es
            entstehen 2 bis 3 Varianten mit Zeichenzähler und Copy-Button. Ein direktes Posten über die
            LinkedIn API ist bewusst nicht angebunden.
          </div>
        ) : null}

        {varianten.map((variante, index) => (
          <article key={index} className="card" style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.09em", color: "var(--c-blue-800)" }}>
                VARIANTE {String(index + 1).padStart(2, "0")}
              </span>
              <span style={{ flex: 1 }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--text-muted)" }}>
                {variante.zeichen.toLocaleString("de-DE")} ZEICHEN
              </span>
              <button
                type="button"
                className="button button-secondary"
                style={{ minHeight: 32, padding: "0.25rem 0.7rem", fontSize: "0.78rem" }}
                onClick={() => kopiere(variante.text, index)}
              >
                {kopiert === index ? "Kopiert" : "Kopieren"}
              </button>
            </div>
            <div style={{ whiteSpace: "pre-wrap", fontSize: "0.88rem", lineHeight: 1.65, color: "var(--text-primary)" }}>
              {variante.text}
            </div>
          </article>
        ))}
      </div>

      <div className="card" style={{ padding: "18px 20px", display: "grid", gap: 14, position: "sticky", top: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={monoLabel}>BEITRAGSBILD</span>
          <span style={{ flex: 1 }} />
          {(Object.keys(BILD_FORMATE) as BildFormat[]).map((format) => (
            <button key={format} type="button" style={umschaltKnopf(bildFormat === format)} onClick={() => setBildFormat(format)}>
              {format.replace("x", "×")}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {BILD_TEMPLATES.map((eintrag) => (
            <button key={eintrag.wert} type="button" style={umschaltKnopf(template === eintrag.wert)} onClick={() => setTemplate(eintrag.wert)}>
              {eintrag.label}
            </button>
          ))}
        </div>
        <div
          style={{ borderRadius: 6, overflow: "hidden", border: "1px solid var(--border-soft)" }}
          dangerouslySetInnerHTML={{
            __html: svg.replace("<svg ", '<svg style="display:block;width:100%;height:auto" '),
          }}
        />
        <div style={{ display: "grid", gap: 6 }}>
          <label htmlFor="bild-titel" style={monoLabel}>TITELZEILE</label>
          <input
            id="bild-titel"
            value={titelzeile}
            onChange={(ereignis) => setTitelzeile(ereignis.target.value)}
            style={{ minHeight: 42, padding: "0 12px", border: "1px solid var(--c-neutral-300)", borderRadius: 4, fontSize: "0.86rem", background: "var(--c-white)" }}
          />
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          <label htmlFor="bild-unterzeile" style={monoLabel}>UNTERZEILE</label>
          <input
            id="bild-unterzeile"
            value={unterzeile}
            onChange={(ereignis) => setUnterzeile(ereignis.target.value)}
            style={{ minHeight: 42, padding: "0 12px", border: "1px solid var(--c-neutral-300)", borderRadius: 4, fontSize: "0.86rem", background: "var(--c-white)" }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button type="button" className="button button-primary" onClick={ladeBildHerunter} disabled={laedtBild}>
            {laedtBild ? "Exportiert …" : "Bild herunterladen"}
          </button>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
            PNG · {breite * EXPORT_FAKTOR}×{hoehe * EXPORT_FAKTOR} (2X)
          </span>
        </div>
      </div>
    </div>
  );
}
