// Erzeugt die Review-Vorschauen:
// - Web-Ansicht: Card in einem .gh-content-Wrapper mit den echten
//   (feindlichen) Theme-Tabellenregeln aus GHOST_THEME_SIMULATION_CSS
//   (SKILL.md Bauregel 10) – so wird sichtbar, ob die Inline-Overrides der
//   Card das Theme wirklich schlagen.
// - Outlook-Ansicht: simuliert die Word-Engine – border-radius entfernt,
//   Gradients durch bgcolor-Vollfarben ersetzt, Schatten entfernt.

// Nachbau der in SKILL.md Bauregel 10 beschriebenen Theme-Regeln des echten
// VTM-Ghost-Themes: Content-Tabellen werden als scrollbare Datentabellen
// gestylt, weiße Scroll-Schatten-Verläufe über erste/letzte Spalte gemalt,
// radiale Schatten auf die Tabelle gelegt und margin-top nach Textabsätzen
// erzwungen. Eine korrekt gebaute Card neutralisiert all das inline.
export const GHOST_THEME_SIMULATION_CSS = `
.gh-content { max-width: 780px; margin: 0 auto; padding: 32px 20px 64px; font-family: Georgia, serif; color: #15171a; }
.gh-content table { display: inline-block; overflow-x: auto; white-space: nowrap; max-width: 100%; width: auto !important; background-image: radial-gradient(ellipse at left, rgba(0,0,0,0.14) 0%, rgba(0,0,0,0) 75%), radial-gradient(ellipse at right, rgba(0,0,0,0.14) 0%, rgba(0,0,0,0) 75%); background-size: 10px 100%, 10px 100%; background-position: 0 0, 100% 0; background-repeat: no-repeat; }
.gh-content table td, .gh-content table th { border: 1px solid #e5eff5; padding: 6px 12px; font-size: 1.4rem; white-space: nowrap; }
.gh-content table td:first-child { background-image: linear-gradient(to right, #fff 50%, rgba(255,255,255,0) 100%); background-size: 20px 100%; background-position: 0 0; background-repeat: no-repeat; }
.gh-content table td:last-child { background-image: linear-gradient(to left, #fff 50%, rgba(255,255,255,0) 100%); background-size: 20px 100%; background-position: 100% 0; background-repeat: no-repeat; }
.gh-content p + table, .gh-content div + table { margin-top: 2em; }
.gh-content p { line-height: 1.6; }
`;

function htmlDokument(inhalt: string, zusatzCss: string): string {
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body { margin: 0; background: #ffffff; }
${zusatzCss}
</style>
</head>
<body>
${inhalt}
</body>
</html>`;
}

export function baueWebPreview(cardHtml: string, headline: string): string {
  const headlineHtml = `<h1 style="font-family:'Arial Narrow',Arial,sans-serif; font-weight:900; font-size:34px; line-height:1.15; color:#0D1C3C; border-bottom:3px solid #1F4EFF; padding-bottom:14px; margin:0 0 24px;">${headline}</h1>
<div style="font-family:Arial,sans-serif; font-size:12px; color:#5A6B85; letter-spacing:1px; text-transform:uppercase; margin-bottom:28px;">Simulierte Headline &#183; wird in Ghost gepflegt, nie Teil der Card</div>`;
  return htmlDokument(`<div class="gh-content">${headlineHtml}${cardHtml}</div>`, GHOST_THEME_SIMULATION_CSS);
}

// Outlook-Simulation: strippt border-radius und ersetzt Gradients durch die
// bgcolor-Vollfarbe (background:linear-gradient(...) wird entfernt, der
// zuvor deklarierte background-color-Fallback gewinnt). Box-Shadows ebenso.
export function transformiereFuerOutlook(cardHtml: string): string {
  return cardHtml
    .replace(/border-radius:[^;"]+;?\s*/g, "")
    .replace(/background:\s*linear-gradient\([^;"]+\);?\s*/g, "")
    .replace(/box-shadow:[^;"]+;?\s*/g, "");
}

export function baueOutlookPreview(cardHtml: string, headline: string): string {
  const transformiert = transformiereFuerOutlook(cardHtml);
  const headlineHtml = `<h1 style="font-family:Arial,sans-serif; font-weight:bold; font-size:30px; line-height:1.2; color:#0D1C3C; margin:0 0 24px;">${headline}</h1>`;
  return htmlDokument(
    `<div style="max-width:660px; margin:0 auto; padding:24px 16px; font-family:Arial,sans-serif;">${headlineHtml}${transformiert}</div>`,
    ""
  );
}
