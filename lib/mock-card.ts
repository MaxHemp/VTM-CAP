// Baut eine valide VTM-Card aus den E-Mail-sicheren Bausteinen aus
// brand-rules/references/komponenten.md (Overrides 1:1 übernommen).
// Verwendet vom KI-Mock (MOCK_KI=1) und von den Stilcheck-Fixtures.
import { kodiereNichtAscii } from "@/lib/entities";

const APP_HINWEIS = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F5F7FA" style="display:table; white-space:normal; background-image:none; margin-top:0; background-color:#F5F7FA; border:1px solid #E8ECF2; border-left:0; border-radius:8px; margin-bottom:36px;">
  <tr>
    <td style="background-image:none; white-space:normal; border:0; border-left:4px solid #1F4EFF; padding:18px 24px;">
      <div style="font-family:'Arial Narrow',Arial,sans-serif; font-size:16px; font-weight:bold; line-height:1.4; color:#0D1C3C;">Diesen Artikel k&#246;nnen Sie ab sofort auch in unserer iOS App lesen.</div>
      <div style="font-family:Arial,sans-serif; font-size:13px; line-height:1.4; color:#5A6B85; padding-top:3px; padding-bottom:12px;">VersicherungsTech Magazin im App Store</div>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:table; white-space:normal; background-image:none; margin-top:0; margin:0; border-collapse:collapse;">
        <tr><td bgcolor="#1F4EFF" style="background-image:none; white-space:normal; border:0; padding:0; background-color:#1F4EFF; border-radius:8px;">
          <a href="https://apps.apple.com/de/app/versicherungstech-magazin/id6760129340" target="_blank" style="display:inline-block; padding:11px 22px; font-family:'Arial Narrow',Arial,sans-serif; font-size:14px; font-weight:bold; color:#ffffff; text-decoration:none;">Im App Store &#246;ffnen</a>
        </td></tr>
      </table>
    </td>
  </tr>
</table>`;

function kategorieZeile(inhalt: string): string {
  return `<div style="font-family:'Arial Narrow',Arial,sans-serif; font-size:13px; font-weight:bold; letter-spacing:2px; text-transform:uppercase; color:#1F4EFF; padding-bottom:18px;">${inhalt}</div>`;
}

function lead(inhalt: string): string {
  return `<div style="font-family:'Arial Narrow',Arial,sans-serif; font-size:21px; line-height:1.65; color:#122952; padding-bottom:32px;">${inhalt}</div>`;
}

function wichtigsteZeile(inhalt: string, letzte: boolean): string {
  const border = letzte ? "" : " border-bottom:1px solid #E8ECF2;";
  return `<tr>
        <td width="26" valign="top" style="background-image:none; white-space:normal; border:0; padding:20px 0 11px 0;${border}"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:table; white-space:normal; background-image:none; margin-top:0; margin:0; border-collapse:collapse;"><tr><td width="12" height="3" bgcolor="#E5A800" style="background-image:none; border:0; padding:0; background-color:#E5A800; font-size:0; line-height:0;">&nbsp;</td></tr></table></td>
        <td style="background-image:none; white-space:normal; border:0; padding:11px 0; font-family:'Arial Narrow',Arial,sans-serif; font-size:15.5px; line-height:1.6; color:#0D1C3C;${border}">${inhalt}</td>
      </tr>`;
}

function wichtigsteBox(punkte: string[]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F5F7FA" style="display:table; white-space:normal; background-image:none; margin-top:0; background-color:#F5F7FA; border:1px solid #E8ECF2; border-radius:8px; margin-bottom:36px;">
  <tr><td style="background-image:none; white-space:normal; border:0; padding:24px 28px;">
    <div style="font-family:Arial,sans-serif; font-size:12px; font-weight:bold; letter-spacing:2px; text-transform:uppercase; color:#1F4EFF; border-bottom:2px solid #E8ECF2; padding-bottom:10px; margin-bottom:6px;">Das Wichtigste</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="display:table; white-space:normal; background-image:none; margin-top:0; margin:0; border-collapse:collapse;">
      ${punkte.map((punkt, index) => wichtigsteZeile(punkt, index === punkte.length - 1)).join("\n      ")}
    </table>
  </td></tr>
</table>`;
}

function h2(inhalt: string): string {
  return `<h2 style="font-family:'Arial Narrow',Arial,sans-serif; font-size:28px; font-weight:bold; color:#0D1C3C; line-height:1.2; margin:52px 0 0; padding-bottom:14px;">${inhalt}</h2>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="display:table; white-space:normal; background-image:none; margin-top:0; margin:0; border-collapse:collapse;"><tr><td width="48" height="2" bgcolor="#1F4EFF" style="background-image:none; border:0; padding:0; background-color:#1F4EFF; background:linear-gradient(135deg,#1F4EFF 0%,#4B75FF 100%); font-size:0; line-height:0;">&nbsp;</td><td height="2" bgcolor="#E8ECF2" style="background-image:none; border:0; padding:0; background-color:#E8ECF2; font-size:0; line-height:0;">&nbsp;</td></tr><tr><td colspan="2" height="22" style="background-image:none; border:0; padding:0; font-size:0; line-height:0;">&nbsp;</td></tr></table>`;
}

function absatz(inhalt: string): string {
  return `<p style="font-family:'Arial Narrow',Arial,sans-serif; font-size:17px; line-height:1.8; color:#0D1C3C; margin:0 0 22px;">${inhalt}</p>`;
}

function wasTunBox(label: string, punkte: string[]): string {
  const zeilen = punkte
    .map((punkt, index) => {
      const border = index === punkte.length - 1 ? "" : " border-bottom:1px solid #E8ECF2;";
      return `<tr>
        <td width="26" valign="top" style="background-image:none; white-space:normal; border:0; padding:20px 0 11px 0;${border}"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:table; white-space:normal; background-image:none; margin-top:0; margin:0; border-collapse:collapse;"><tr><td width="12" height="3" bgcolor="#1F4EFF" style="background-image:none; border:0; padding:0; background-color:#1F4EFF; font-size:0; line-height:0;">&nbsp;</td></tr></table></td>
        <td style="background-image:none; white-space:normal; border:0; padding:11px 0; font-family:'Arial Narrow',Arial,sans-serif; font-size:14.5px; line-height:1.6; color:#0D1C3C;${border}">${punkt}</td>
      </tr>`;
    })
    .join("\n      ");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F5F7FA" style="display:table; white-space:normal; background-image:none; margin-top:0; background-color:#F5F7FA; border:1px solid #E8ECF2; border-radius:8px; margin-bottom:36px;">
  <tr><td style="background-image:none; white-space:normal; border:0; padding:24px 28px;">
    <div style="font-family:Arial,sans-serif; font-size:12px; font-weight:bold; letter-spacing:2px; text-transform:uppercase; color:#1F4EFF; border-bottom:2px solid #E8ECF2; padding-bottom:10px; margin-bottom:6px;">${label}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="display:table; white-space:normal; background-image:none; margin-top:0; margin:0; border-collapse:collapse;">
      ${zeilen}
    </table>
  </td></tr>
</table>`;
}

function quellenBox(quellen: string[]): string {
  const zeilen = quellen
    .map((quelle, index) => {
      const border = index === quellen.length - 1 ? "" : " border-bottom:1px solid #EEF1F5;";
      return `<div style="font-family:Arial,sans-serif; font-size:13px; line-height:1.5; color:#5A6B85; padding:6px 0;${border}">${quelle}</div>`;
    })
    .join("\n    ");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#FAFBFC" style="display:table; white-space:normal; background-image:none; margin-top:0; background-color:#FAFBFC; border:1px solid #E8ECF2; border-radius:8px; margin:36px 0 0;">
  <tr><td style="background-image:none; white-space:normal; border:0; padding:20px 24px;">
    <div style="font-family:Arial,sans-serif; font-size:11px; font-weight:bold; letter-spacing:2px; text-transform:uppercase; color:#5A6B85; padding-bottom:10px;">Quellen</div>
    ${zeilen}
  </td></tr>
</table>`;
}

function ctaBox(text: string, buttonLabel: string, url: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#122952" style="display:table; white-space:normal; background-image:none; margin-top:0; background-color:#122952; background:linear-gradient(135deg,#0D1C3C 0%,#122952 100%); border-radius:10px; margin:28px 0 0;">
  <tr><td height="3" bgcolor="#E5A800" style="background-image:none; white-space:normal; border:0; padding:0; background-color:#E5A800; font-size:0; line-height:0;">&nbsp;</td></tr>
  <tr><td style="background-image:none; white-space:normal; border:0; padding:26px 30px;">
    <div style="font-family:Arial,sans-serif; font-size:11px; font-weight:bold; letter-spacing:2px; text-transform:uppercase; color:#FFD700; -webkit-text-fill-color:#FFD700; opacity:1; padding-bottom:12px;">N&#228;chster Schritt</div>
    <div style="font-family:'Arial Narrow',Arial,sans-serif; font-size:16px; line-height:1.6; color:#ffffff; -webkit-text-fill-color:#ffffff; opacity:1; mix-blend-mode:normal; filter:none; text-shadow:none; padding-bottom:18px;">${text}</div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:table; white-space:normal; background-image:none; margin-top:0; margin:0; border-collapse:collapse;">
      <tr><td bgcolor="#1F4EFF" style="background-image:none; white-space:normal; border:0; padding:0; background-color:#1F4EFF; border-radius:8px;">
        <a href="${url}" target="_blank" style="display:inline-block; padding:12px 26px; font-family:'Arial Narrow',Arial,sans-serif; font-size:15px; font-weight:bold; color:#ffffff; text-decoration:none;">${buttonLabel}</a>
      </td></tr>
    </table>
  </td></tr>
</table>`;
}

function sponsoredFooter(kunde: string, kurzprofil: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F5F7FA" style="display:table; white-space:normal; background-image:none; margin-top:0; background-color:#F5F7FA; border:1px solid #E8ECF2; border-radius:8px; margin:32px 0 0;">
  <tr><td style="background-image:none; white-space:normal; border:0; padding:22px 26px;">
    <div style="font-family:Arial,sans-serif; font-size:11px; font-weight:bold; letter-spacing:2px; text-transform:uppercase; color:#1F4EFF; padding-bottom:10px;">Anzeige &#183; In Kooperation mit ${kunde}</div>
    <div style="font-family:'Arial Narrow',Arial,sans-serif; font-size:14px; line-height:1.65; color:#0D1C3C;">Dieser Beitrag entstand in Kooperation mit <strong>${kunde}</strong>. ${kurzprofil} Der geschilderte Erfahrungsbericht beruht auf Angaben des Kunden.</div>
  </td></tr>
</table>`;
}

function abschnitt(id: string, label: string, inhalt: string): string {
  return `<!--VTM:ABSCHNITT id="${id}" label="${label}"-->\n${inhalt}\n<!--/VTM:ABSCHNITT-->`;
}

export interface MockCardOptionen {
  kategorie: string;
  format: string;
  sponsored: boolean;
  kunde?: string | null;
  ctaLabel: string;
  ctaUrl: string;
  rohtext: string;
}

// Erzeugt eine strukturell vollständige, stilcheck-konforme Card. Die
// Textinhalte werden aus dem Rohtext abgeleitet (Mock-Betrieb ohne API-Key).
export function baueMockCard(optionen: MockCardOptionen): string {
  const saetze = optionen.rohtext
    .replace(/\s+/g, " ")
    .replace(/—/g, ",")
    .replace(/ – /g, ", ")
    .split(/(?<=[.!?])\s+/)
    .filter((satz) => satz.trim().length > 0);
  const satz = (index: number, fallback: string) => kodiereNichtAscii(saetze[index]?.trim() ?? fallback);

  const kategorieInhalt = optionen.sponsored
    ? kodiereNichtAscii(`Anzeige · In Kooperation mit ${optionen.kunde ?? "Kunde"} | ${optionen.format}`)
    : kodiereNichtAscii(`${optionen.kategorie} | ${optionen.format}`);

  const bloecke: string[] = [
    abschnitt("app-hinweis", "App-Hinweis", APP_HINWEIS),
    abschnitt("kategorie", "Kategorie-Zeile", kategorieZeile(kategorieInhalt)),
    abschnitt(
      "lead",
      "Lead",
      lead(
        `${satz(0, "Der Beitrag ordnet die aktuelle Entwicklung ein.")} <strong style="color:#0D1C3C;">${satz(1, "Die Kernaussage steht am Anfang.")}</strong>`
      )
    ),
    abschnitt(
      "wichtigste",
      "Das Wichtigste",
      wichtigsteBox([
        satz(0, "Kernerkenntnis eins aus dem Manuskript."),
        satz(1, "Kernerkenntnis zwei aus dem Manuskript."),
        satz(2, "Kernerkenntnis drei aus dem Manuskript."),
      ])
    ),
    abschnitt(
      "hauptteil-1",
      "Ausgangslage und Beleglage",
      h2("Ausgangslage und Beleglage") + "\n" + absatz(satz(3, "Der erste Hauptabschnitt ordnet die Ausgangslage ein.")) + "\n" + absatz(satz(4, "Ein zweiter Absatz vertieft die Belege."))
    ),
    abschnitt(
      "hauptteil-2",
      "Bedeutung f&#252;r Versicherer",
      h2("Bedeutung f&#252;r Versicherer") + "\n" + absatz(satz(5, "Der zweite Hauptabschnitt beschreibt die Konsequenzen."))
    ),
  ];

  if (!optionen.sponsored) {
    bloecke.push(
      abschnitt(
        "gegenargumente",
        "Gegenargumente und Grenzen",
        h2("Gegenargumente und Grenzen") + "\n" + absatz(satz(6, "Eine relevante Einschr&#228;nkung relativiert die Analyse nicht, sie st&#228;rkt sie."))
      )
    );
  }

  bloecke.push(
    abschnitt(
      "was-tun",
      "Was Versicherer jetzt tun sollten",
      wasTunBox("Was Versicherer jetzt tun sollten", [
        "<strong>Standortbestimmung durchf&#252;hren.</strong> Prozesse und Rollen kl&#228;ren.",
        "<strong>Verantwortlichkeiten festlegen.</strong> Pr&#252;ffragen an die IT-Strategie stellen.",
        "<strong>Pilot definieren.</strong> Einen abgegrenzten Anwendungsfall starten.",
      ])
    ),
    abschnitt(
      "fazit",
      "Fazit",
      h2("Fazit") + "\n" + absatz(satz(7, "Das Fazit beantwortet die Leitfrage und benennt den n&#228;chsten Schritt."))
    ),
    abschnitt(
      "quellen",
      "Quellenverzeichnis",
      quellenBox([
        'Autorenmanuskript: Angaben laut eingereichtem Manuskript. <a href="#LINK-QUELLE-EINSETZEN" target="_blank" style="color:#1F4EFF; text-decoration:none;">quelle.de</a>',
      ])
    ),
    abschnitt(
      "cta",
      "CTA",
      ctaBox(
        "Vertiefen Sie das Thema mit unserem w&#246;chentlichen Research-Briefing.",
        kodiereNichtAscii(optionen.ctaLabel),
        optionen.ctaUrl
      )
    )
  );

  if (optionen.sponsored) {
    bloecke.push(
      abschnitt(
        "sponsored-footer",
        "Sponsored-Footer",
        sponsoredFooter(
          kodiereNichtAscii(optionen.kunde ?? "dem Kunden"),
          "Das Unternehmen entwickelt Software f&#252;r digitales Dokumentenmanagement und Gesch&#228;ftsprozesse."
        )
      )
    );
  }

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="display:table; white-space:normal; background-image:none; margin-top:0; max-width:780px; margin:0 auto; font-family:'Arial Narrow',Arial,sans-serif; color:#0D1C3C;">
<tr><td style="background-image:none; white-space:normal; border:0; padding:0;">
${bloecke.join("\n")}
</td></tr>
</table>`;
}
