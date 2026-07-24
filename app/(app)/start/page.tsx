import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Topbar } from "@/components/shell/Topbar";
import { FORMAT_LABELS, STATUS_LABELS, SCORE_MAXIMUM, SCORE_SCHWELLE } from "@/lib/status";

export const dynamic = "force-dynamic";

function begruessung(): string {
  const stunde = Number(
    new Intl.DateTimeFormat("de-DE", { hour: "numeric", hour12: false, timeZone: "Europe/Berlin" }).format(
      new Date()
    )
  );
  if (stunde < 5) {
    return "Guten Abend";
  }
  if (stunde < 11) {
    return "Guten Morgen";
  }
  if (stunde < 18) {
    return "Guten Tag";
  }
  return "Guten Abend";
}

interface Handlungskarte {
  tag: string;
  tagKlasse: string;
  titel: string;
  text: string;
  href: string;
  aktion: string;
}

export default async function StartSeite() {
  const session = await auth();
  const name = session?.user.name ?? session?.user.email ?? "";
  const vorname = name.split(/\s+/)[0] ?? "";

  const [artikel, offeneJobs, offeneFreigaben] = await Promise.all([
    prisma.artikel.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        titel: true,
        status: true,
        format: true,
        sponsored: true,
        qualitaetsScore: true,
        cardHtml: true,
        updatedAt: true,
      },
    }),
    prisma.job.findMany({
      where: { status: { in: ["WARTEND", "LAEUFT"] } },
      orderBy: { updatedAt: "desc" },
      select: { artikelId: true, artikel: { select: { titel: true } } },
    }),
    prisma.freigabeToken.findMany({
      where: { status: "OFFEN", gueltigBis: { gt: new Date() } },
      select: { id: true },
    }),
  ]);

  const nachStatus = (status: string) => artikel.filter((a) => a.status === status);
  const imReview = nachStatus("REVIEW");
  const bereit = nachStatus("BEREIT");
  const inGhost = nachStatus("IN_GHOST");
  const beimKunden = nachStatus("KUNDENFREIGABE");

  const karten: Handlungskarte[] = [];
  for (const job of offeneJobs.slice(0, 2)) {
    karten.push({
      tag: "Läuft",
      tagKlasse: "status status-recommended",
      titel: "Aufbereitung läuft",
      text: `„${job.artikel.titel}“ wird gerade automatisch aufbereitet. Öffnen Sie den Artikel, um den Fortschritt zu verfolgen.`,
      href: `/artikel/${job.artikelId}`,
      aktion: "Fortschritt ansehen",
    });
  }
  if (imReview.length > 0) {
    const erster = imReview[0]!;
    karten.push({
      tag: `${imReview.length} im Review`,
      tagKlasse: "status status-mandatory",
      titel: imReview.length === 1 ? "Ein Artikel wartet auf Ihre Prüfung" : `${imReview.length} Artikel warten auf Ihre Prüfung`,
      text:
        imReview.length === 1
          ? `„${erster.titel}“ ist aufbereitet. Prüfen Sie Qualität, Stilcheck und Faktencheck.`
          : "Die Aufbereitung ist abgeschlossen. Prüfen Sie Qualität, Stilcheck und Faktencheck.",
      href: imReview.length === 1 && erster.cardHtml ? `/artikel/${erster.id}/review` : "/pipeline",
      aktion: "Jetzt prüfen",
    });
  }
  if (bereit.length > 0) {
    const erster = bereit[0]!;
    karten.push({
      tag: `${bereit.length} bereit`,
      tagKlasse: "status status-good",
      titel: bereit.length === 1 ? "Ein Artikel ist bereit für Ghost" : `${bereit.length} Artikel sind bereit für Ghost`,
      text: "Freigegeben und publizierbar: Übertragen Sie den Artikel als Draft in das Ghost-CMS.",
      href: bereit.length === 1 && erster.cardHtml ? `/artikel/${erster.id}/review` : "/pipeline",
      aktion: "Nach Ghost übertragen",
    });
  }
  if (beimKunden.length > 0 || offeneFreigaben.length > 0) {
    karten.push({
      tag: "Sponsored",
      tagKlasse: "tag tag-brass",
      titel:
        offeneFreigaben.length === 1
          ? "Eine Kundenfreigabe ist offen"
          : `${Math.max(offeneFreigaben.length, beimKunden.length)} Kundenfreigaben offen`,
      text: "Sponsored-Artikel warten auf die Rückmeldung des Kunden. Prüfen Sie den Stand oder erinnern Sie den Kunden.",
      href: "/freigabe",
      aktion: "Freigaben verwalten",
    });
  }
  if (inGhost.length > 0) {
    karten.push({
      tag: "Reichweite",
      tagKlasse: "tag tag-electric",
      titel: "LinkedIn-Posts zu publizierten Artikeln",
      text: "Erzeugen Sie Post-Varianten und Beitragsbilder im VTM-Design für Artikel, die bereits in Ghost liegen.",
      href: "/linkedin",
      aktion: "LinkedIn Studio öffnen",
    });
  }
  karten.push({
    tag: "Neu",
    tagKlasse: "tag",
    titel: "Neues Manuskript ablegen",
    text: "DOCX, PDF, Markdown oder Text hochladen – die Aufbereitung zur publikationsreifen VTM-Card startet automatisch.",
    href: "/artikel/neu",
    aktion: "Artikel anlegen",
  });

  const statistik = [
    { wert: imReview.length, label: "Im Review" },
    { wert: beimKunden.length, label: "Beim Kunden" },
    { wert: bereit.length, label: "Bereit" },
    { wert: inGhost.length, label: "In Ghost" },
  ];
  const geprueft = artikel.filter((a) => a.qualitaetsScore !== null);
  const scoreDurchschnitt =
    geprueft.length > 0
      ? (geprueft.reduce((summe, a) => summe + (a.qualitaetsScore ?? 0), 0) / geprueft.length).toFixed(1)
      : null;

  const zuletzt = artikel.slice(0, 5);
  const datum = new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Berlin",
  }).format(new Date());

  return (
    <section style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
      <Topbar
        bereich="REDAKTION / START"
        titel="Start"
        aktionen={
          <Link href="/artikel/neu" className="button button-primary">
            Neuer Artikel
          </Link>
        }
      />
      <div style={{ flex: 1, overflow: "auto", padding: "22px 28px 32px" }}>
        <div style={{ display: "grid", gap: 18, maxWidth: 1160 }}>
          <div className="card card-dark" style={{ padding: "26px 28px" }}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                fontWeight: 600,
                letterSpacing: "0.14em",
                color: "var(--c-brass-300)",
                marginBottom: 10,
                textTransform: "uppercase",
              }}
            >
              {datum}
            </div>
            <h2
              style={{
                margin: "0 0 8px",
                fontFamily: "var(--font-display)",
                fontSize: "1.6rem",
                fontWeight: 800,
                letterSpacing: "-0.035em",
              }}
            >
              {begruessung()}
              {vorname ? `, ${vorname}` : ""}.
            </h2>
            <p style={{ margin: 0, maxWidth: 640, fontSize: "0.92rem", lineHeight: 1.65 }}>
              {artikel.length === 0
                ? "Ihre Pipeline ist leer. Legen Sie das erste Manuskript ab – die Aufbereitung zur publikationsreifen VTM-Card läuft automatisch."
                : `${artikel.length} ${artikel.length === 1 ? "Artikel" : "Artikel"} in der Pipeline` +
                  (imReview.length > 0
                    ? `, davon ${imReview.length} ${imReview.length === 1 ? "wartet" : "warten"} auf Ihr Review.`
                    : scoreDurchschnitt
                      ? ` mit einem Qualitätsscore von durchschnittlich ${scoreDurchschnitt}/${SCORE_MAXIMUM}.`
                      : ".")}
            </p>
          </div>

          {artikel.length > 0 ? (
            <div className="start-statistik">
              {statistik.map((eintrag) => (
                <div key={eintrag.label} className="card" style={{ padding: "14px 18px" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.5rem",
                      fontWeight: 800,
                      letterSpacing: "-0.03em",
                      color: eintrag.wert > 0 ? "var(--text-primary)" : "var(--text-muted)",
                    }}
                  >
                    {eintrag.wert}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6rem",
                      fontWeight: 600,
                      letterSpacing: "0.09em",
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                    }}
                  >
                    {eintrag.label}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div>
            <div className="kicker" style={{ marginBottom: 12 }}>
              NÄCHSTE SCHRITTE
            </div>
            <div className="start-aktionen">
              {karten.map((karte) => (
                <Link key={karte.titel + karte.href} href={karte.href} style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="card" style={{ padding: "18px 20px", height: "100%", display: "grid", gap: 10, alignContent: "start" }}>
                    <span className={karte.tagKlasse} style={{ justifySelf: "start", minHeight: 22, padding: "0.14rem 0.45rem", fontSize: "0.58rem" }}>
                      {karte.tag}
                    </span>
                    <strong style={{ fontFamily: "var(--font-display)", fontSize: "1.02rem", letterSpacing: "-0.02em", lineHeight: 1.35 }}>
                      {karte.titel}
                    </strong>
                    <span style={{ fontSize: "0.84rem", lineHeight: 1.6, color: "var(--text-secondary)" }}>{karte.text}</span>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--action)" }}>{karte.aktion} →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {zuletzt.length > 0 ? (
            <div className="card" style={{ padding: "18px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, letterSpacing: "-0.02em", flex: 1 }}>
                  Zuletzt bearbeitet
                </h3>
                <Link href="/pipeline" style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                  Zur Pipeline →
                </Link>
              </div>
              <div style={{ display: "grid" }}>
                {zuletzt.map((eintrag) => (
                  <div
                    key={eintrag.id}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: "1px solid var(--border-soft)", flexWrap: "wrap" }}
                  >
                    <span className={eintrag.sponsored ? "tag tag-brass" : "tag tag-electric"} style={{ minHeight: 20, padding: "0.1rem 0.4rem", fontSize: "0.54rem" }}>
                      {FORMAT_LABELS[eintrag.format]}
                    </span>
                    <Link
                      href={`/artikel/${eintrag.id}`}
                      style={{ flex: 1, minWidth: 220, fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)", textDecoration: "none" }}
                    >
                      {eintrag.titel}
                    </Link>
                    {eintrag.qualitaetsScore !== null ? (
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.62rem",
                          fontWeight: 700,
                          color: eintrag.qualitaetsScore >= SCORE_SCHWELLE ? "var(--c-success)" : "var(--c-warning)",
                        }}
                      >
                        {eintrag.qualitaetsScore}/{SCORE_MAXIMUM}
                      </span>
                    ) : null}
                    <span className="status status-optional" style={{ minHeight: 20, padding: "0.1rem 0.4rem", fontSize: "0.54rem" }}>
                      {STATUS_LABELS[eintrag.status]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
