# E-Mail-sichere VTM-Komponenten (Ghost-Card-Bausteine)

**Web-Theme-Override (Pflicht in jedem Baustein):** Ghost-Themes stylen Content-Tabellen als scrollbare Datentabellen (`white-space:nowrap`, `display:inline-block`, td-Rahmen/-Padding) und malt weiße Scroll-Schatten-Bilder über erste/letzte Spalten sowie radiale Schatten auf die Tabelle (`background-image:none` neutralisiert beides; bewusste `background:linear-gradient`-Shorthands stehen später im style und gewinnen). Deshalb trägt jede `<table>` inline `display:table; white-space:normal; background-image:none; margin-top:0;` (Tabellen ohne weitere Styles zusätzlich `margin:0; border-collapse:collapse;`) und jede `<td>` `background-image:none; border:0` (Deko-/Button-Zellen zusätzlich `padding:0`). Bewusste eigene Rahmen (`border-bottom:...`) stehen NACH dem `border:0` im selben style-Attribut und gewinnen dadurch. Die Bausteine unten enthalten diese Overrides bereits; beim Bauen niemals entfernen.

Alle Bausteine sind Outlook-kompatibel (Word-Engine): Tabellen-Layout, inline Styles, bgcolor-Fallbacks, keine Pseudo-Elemente, kein SVG, kein Flex/Grid. In der Card-`<pre>`-Box werden `< > " &` entity-kodiert (`&lt; &gt; &quot; &amp;`).

## Design-Tokens

- Deep Cobalt `#0D1C3C`, Cobalt `#122952` (dunkle Flächen; Gradient 135deg #0D1C3C→#122952 mit bgcolor="#122952"-Fallback)
- Electric Blue `#1F4EFF` (Akzente, Buttons, Labels), Hell-Blau `#4B75FF`
- Gold `#FFD700` / `#E5A800` (Signatur-Akzente, ▪ in Wichtigste-Box)
- Flächen `#F5F7FA`, Linien `#E8ECF2`, Sekundärtext `#5A6B85`, Quellen-BG `#FAFBFC`
- Schrift: `'Arial Narrow',Arial,sans-serif` (Fließtext/Headlines), `Arial,sans-serif` (Labels/Meta)
- Fließtext 17px/1.8, Lead 21px/1.65 (#122952), H2 28px bold, Labels 11–12px bold letter-spacing 2px uppercase

## Grundgerüst (umschließt alles)

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="display:table; white-space:normal; background-image:none; margin-top:0; max-width:780px; margin:0 auto; font-family:'Arial Narrow',Arial,sans-serif; color:#0D1C3C;">
<tr><td style="background-image:none; white-space:normal; border:0; padding:0;">
  <!-- Bausteine hier -->
</td></tr>
</table>
```

## 1 · App-Hinweisblock (Pflicht, erstes Element jedes Artikels)

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F5F7FA" style="display:table; white-space:normal; background-image:none; margin-top:0; background-color:#F5F7FA; border:1px solid #E8ECF2; border-left:0; border-radius:8px; margin-bottom:36px;">
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
</table>
```

## 2 · Kategorie-Zeile

```html
<div style="font-family:'Arial Narrow',Arial,sans-serif; font-size:13px; font-weight:bold; letter-spacing:2px; text-transform:uppercase; color:#1F4EFF; padding-bottom:18px;">KATEGORIE | FORMAT</div>
```

## 3 · Lead

```html
<div style="font-family:'Arial Narrow',Arial,sans-serif; font-size:21px; line-height:1.65; color:#122952; padding-bottom:32px;">Text ... <strong style="color:#0D1C3C;">Kernaussage fett.</strong> ...</div>
```

## 4 · „Das Wichtigste"-Box (3 Punkte, Gold-▪)

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F5F7FA" style="display:table; white-space:normal; background-image:none; margin-top:0; background-color:#F5F7FA; border:1px solid #E8ECF2; border-radius:8px; margin-bottom:36px;">
  <tr><td style="background-image:none; white-space:normal; border:0; padding:24px 28px;">
    <div style="font-family:Arial,sans-serif; font-size:12px; font-weight:bold; letter-spacing:2px; text-transform:uppercase; color:#1F4EFF; border-bottom:2px solid #E8ECF2; padding-bottom:10px; margin-bottom:6px;">Das Wichtigste</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="display:table; white-space:normal; background-image:none; margin-top:0; margin:0; border-collapse:collapse;">
      <tr>
        <td width="26" valign="top" style="background-image:none; white-space:normal; border:0; padding:20px 0 11px 0; border-bottom:1px solid #E8ECF2;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:table; white-space:normal; background-image:none; margin-top:0; margin:0; border-collapse:collapse;"><tr><td width="12" height="3" bgcolor="#E5A800" style="background-image:none; border:0; padding:0; background-color:#E5A800; font-size:0; line-height:0;">&nbsp;</td></tr></table></td>
        <td style="background-image:none; white-space:normal; border:0; padding:11px 0; font-family:'Arial Narrow',Arial,sans-serif; font-size:15.5px; line-height:1.6; color:#0D1C3C; border-bottom:1px solid #E8ECF2;">Kernerkenntnis eins.</td>
      </tr>
      <!-- weitere Zeilen identisch; letzte Zeile OHNE border-bottom auf beiden td. Was-tun-Box: Balkenfarbe #1F4EFF statt #E5A800 -->
    </table>
  </td></tr>
</table>
```

## 5 · H2 (Zwischenüberschrift mit inhaltlicher Aussage)

```html
<h2 style="font-family:'Arial Narrow',Arial,sans-serif; font-size:28px; font-weight:bold; color:#0D1C3C; line-height:1.2; margin:52px 0 0; padding-bottom:14px;">Aussagekr&#228;ftige &#220;berschrift</h2>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="display:table; white-space:normal; background-image:none; margin-top:0; margin:0; border-collapse:collapse;"><tr><td width="48" height="2" bgcolor="#1F4EFF" style="background-image:none; border:0; padding:0; background-color:#1F4EFF; background:linear-gradient(135deg,#1F4EFF 0%,#4B75FF 100%); font-size:0; line-height:0;">&nbsp;</td><td height="2" bgcolor="#E8ECF2" style="background-image:none; border:0; padding:0; background-color:#E8ECF2; font-size:0; line-height:0;">&nbsp;</td></tr><tr><td colspan="2" height="22" style="background-image:none; border:0; padding:0; font-size:0; line-height:0;">&nbsp;</td></tr></table>
```

Ergebnis wie im Original-Webdesign: graue Trennlinie mit blauem 48px-Kurzakzent links, danach 22px Abstand.

## 6 · Absatz

```html
<p style="font-family:'Arial Narrow',Arial,sans-serif; font-size:17px; line-height:1.8; color:#0D1C3C; margin:0 0 22px;">Text ...</p>
```

## 7 · Callout (blauer Balken, für Erklärkästen / „Der Kern in einem Satz")

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F5F7FA" style="display:table; white-space:normal; background-image:none; margin-top:0; background-color:#F5F7FA; border-radius:0 6px 6px 0; margin:28px 0;">
  <tr>
    <td style="background-image:none; white-space:normal; border:0; border-left:4px solid #1F4EFF; padding:22px 26px;">
      <div style="font-family:Arial,sans-serif; font-size:11px; font-weight:bold; letter-spacing:2px; text-transform:uppercase; color:#1F4EFF; padding-bottom:10px;">Label</div>
      <div style="font-family:'Arial Narrow',Arial,sans-serif; font-size:15px; line-height:1.7; color:#0D1C3C;">Inhalt ...</div>
    </td>
  </tr>
</table>
```

Varianten: **Gold-Callout** („Meine Einschätzung"): Balken-td und Label-color `#E5A800`. **Rot-Callout** (Handlungsrelevant/Warnung): `#C62828`.

## 8 · Pull-Quote (Gold-Balken)

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="display:table; white-space:normal; background-image:none; margin-top:0; margin:36px 0;">
  <tr>
    <td style="background-image:none; white-space:normal; border:0; border-left:3px solid #FFD700; padding:10px 0 10px 26px;">
      <div style="font-family:'Arial Narrow',Arial,sans-serif; font-size:24px; font-style:italic; line-height:1.35; color:#122952;">&#8222;Zitat.&#8220;</div>
      <div style="font-family:Arial,sans-serif; font-size:12px; font-weight:bold; letter-spacing:1.5px; text-transform:uppercase; color:#1F4EFF; padding-top:12px;">Autor &#183; Funktion</div>
    </td>
  </tr>
</table>
```

Eigene Kommentare als „VTM · Redaktioneller Kommentar" zuschreiben; Fremdzitate nur verifiziert.

## 9 · Fakt-Kacheln (Kennzahlen, untereinander für E-Mail-Robustheit)

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F5F7FA" style="display:table; white-space:normal; background-image:none; margin-top:0; background-color:#F5F7FA; border:1px solid #E8ECF2; border-radius:8px; margin-bottom:14px;">
  <tr><td style="background-image:none; white-space:normal; border:0; padding:20px 24px;">
    <div style="font-family:'Arial Narrow',Arial,sans-serif; font-size:32px; font-weight:bold; color:#1F4EFF; line-height:1; padding-bottom:8px;">30 bis 40 %</div>
    <div style="font-family:Arial,sans-serif; font-size:11px; font-weight:bold; letter-spacing:1.5px; text-transform:uppercase; color:#122952; padding-bottom:8px;">Kennzahl-Label</div>
    <div style="font-family:'Arial Narrow',Arial,sans-serif; font-size:14px; line-height:1.55; color:#0D1C3C;">Einordnung mit Bezugsgr&#246;&#223;e und Quelle.</div>
  </td></tr>
</table>
```

## 10 · Vergleichskarten (zwei Konzepte gegenüberstellen, untereinander)

Je Karte: Kopfzeile als dunkle td (bgcolor="#122952", Label gold, Titel weiß mit vollem Weiß-Stack), Körper als weiße td mit 1px-Rahmen. Zwei Tabellen untereinander mit margin-bottom:14px.

## 11 · Schritte-Box (nummerierte Abfolge)

Wie Wichtigste-Box, aber statt ▪ eine Nummern-td: `<td width="34" valign="top" style="background-image:none; white-space:normal; border:0; padding:11px 0; font-family:'Arial Narrow',Arial,sans-serif; font-size:22px; font-weight:bold; color:#1F4EFF; border-bottom:1px solid #E8ECF2;">1</td>`.

## 12 · Was-tun-Box (Maßnahmen/Prüffragen, Blau-▪)

Identisch zur Wichtigste-Box, aber ▪-Farbe `#1F4EFF`, Label z. B. „Konsequenzen für die IT-Strategie" oder „Standortbestimmung ...", Punkte mit `<strong>Maßnahme.</strong> Begründung`-Muster, Textgröße 14.5px.

## 13 · Quellen-Box

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#FAFBFC" style="display:table; white-space:normal; background-image:none; margin-top:0; background-color:#FAFBFC; border:1px solid #E8ECF2; border-radius:8px; margin:36px 0 0;">
  <tr><td style="background-image:none; white-space:normal; border:0; padding:20px 24px;">
    <div style="font-family:Arial,sans-serif; font-size:11px; font-weight:bold; letter-spacing:2px; text-transform:uppercase; color:#5A6B85; padding-bottom:10px;">Quellen</div>
    <div style="font-family:Arial,sans-serif; font-size:13px; line-height:1.5; color:#5A6B85; padding:6px 0; border-bottom:1px solid #EEF1F5;">Herausgeber: &#8222;Titel&#8220;, Datum. <a href="URL" target="_blank" style="color:#1F4EFF; text-decoration:none;">domain.de</a></div>
    <!-- letzte Quelle ohne border-bottom -->
  </td></tr>
</table>
```

## 14 · CTA-Box (dunkel, genau einmal, am Ende)

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#122952" style="display:table; white-space:normal; background-image:none; margin-top:0; background-color:#122952; background:linear-gradient(135deg,#0D1C3C 0%,#122952 100%); border-radius:10px; margin:28px 0 0;">
  <tr><td height="3" bgcolor="#E5A800" style="background-image:none; white-space:normal; border:0; padding:0; background-color:#E5A800; font-size:0; line-height:0;">&nbsp;</td></tr>
  <tr><td style="background-image:none; white-space:normal; border:0; padding:26px 30px;">
    <div style="font-family:Arial,sans-serif; font-size:11px; font-weight:bold; letter-spacing:2px; text-transform:uppercase; color:#FFD700; -webkit-text-fill-color:#FFD700; opacity:1; padding-bottom:12px;">N&#228;chster Schritt</div>
    <div style="font-family:'Arial Narrow',Arial,sans-serif; font-size:16px; line-height:1.6; color:#ffffff; -webkit-text-fill-color:#ffffff; opacity:1; mix-blend-mode:normal; filter:none; text-shadow:none; padding-bottom:18px;">CTA-Text.</div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:table; white-space:normal; background-image:none; margin-top:0; margin:0; border-collapse:collapse;">
      <tr><td bgcolor="#1F4EFF" style="background-image:none; white-space:normal; border:0; padding:0; background-color:#1F4EFF; border-radius:8px;">
        <a href="URL" target="_blank" style="display:inline-block; padding:12px 26px; font-family:'Arial Narrow',Arial,sans-serif; font-size:15px; font-weight:bold; color:#ffffff; text-decoration:none;">Button-Text</a>
      </td></tr>
    </table>
  </td></tr>
</table>
```

Standard-CTA: „AI Insurance Briefing abonnieren" → https://www.linkedin.com/newsletters/ai-insurance-briefing-7376977231333453824/

## 15 · Dunkle Inhalts-/Diagramm-Box (Schichten, Arbeitsteilungen, Schluss-Statements)

Dunkle Tabelle wie CTA-Box (bgcolor="#122952" + Gradient), innen gestapelte helle Zeilen-Tabellen: `bgcolor="#1a3a6e"`-nahe Flächen gehen nicht verlässlich transparent, daher innere Kästen als eigene Tabellen mit `bgcolor="#1E3D75"` (Fallback für rgba-Blau) bzw. `bgcolor="#0D1C3C"`, Rahmen `border:1px solid #4B75FF`. Pfeile zwischen Ebenen als Textzeile `&#8595;` in Gold, zentriert. Jeder Text mit vollem Weiß-/Gold-Stack. Für „Die VTM-Schlussfolgerung" dieselbe Box ohne Binnenkästen.

## 16 · Sponsored-Footer (nur Sponsored-Artikel, vor App-freiem Ende)

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F5F7FA" style="display:table; white-space:normal; background-image:none; margin-top:0; background-color:#F5F7FA; border:1px solid #E8ECF2; border-radius:8px; margin:32px 0 0;">
  <tr><td style="background-image:none; white-space:normal; border:0; padding:22px 26px;">
    <div style="font-family:Arial,sans-serif; font-size:11px; font-weight:bold; letter-spacing:2px; text-transform:uppercase; color:#1F4EFF; padding-bottom:10px;">Anzeige &#183; In Kooperation mit &lt;Kunde&gt;</div>
    <div style="font-family:'Arial Narrow',Arial,sans-serif; font-size:14px; line-height:1.65; color:#0D1C3C;">Dieser Beitrag entstand in Kooperation mit der <strong>&lt;Kunde&gt;</strong>. &lt;Kurzprofil&gt;. Der geschilderte Erfahrungsbericht beruht auf Angaben des Kunden.</div>
  </td></tr>
</table>
```
