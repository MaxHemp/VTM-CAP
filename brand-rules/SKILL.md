---
name: vtm-ghost-html-card
description: Erstellt publikationsreife Fachartikel für das VersicherungsTech Magazin (VTM) als Ghost-CMS-Single-HTML-Cards im VTM-Design, E-Mail-sicher für den Newsletter-Versand (Outlook-kompatibel). Diese Skill IMMER nutzen, wenn Max einen VTM-Artikel, Fachartikel, eine Analyse, Einordnung, einen Evergreen, Praxis-Case oder Sponsored Article erstellen, aufbereiten oder überarbeiten will, wenn er "Artikel für VTM", "Ghost-Card", "als Artikel aufbereiten", "fürs Magazin" oder Ähnliches sagt, oder wenn ein Kunden-Asset (z. B. d.velop) für Ghost aufbereitet werden soll. Auch nutzen für Teilaufgaben wie Excerpt, App-Hinweisblock, Stilcheck oder E-Mail-sichere Umbauten bestehender Cards.
---

# VTM Ghost-HTML-Card: Artikelproduktion

Erzeugt VTM-Fachartikel als **eine einzige, copy-paste-fertige HTML-Card** für den Ghost-Editor (`/html`-Karte). Die Card ist E-Mail-sicher gebaut und rendert identisch gut im Web-Artikel und im Ghost-Newsletter-Versand (Outlook/Word-Engine).

## Output-Definition

Pro Artikel entstehen zwei Dateien, beide via `present_files` ausliefern:

1. **`VTM_Ghost_SingleCard_<Thema>.html`** – Trägerdatei mit: Meta-Block (Wortzahl, Format, Headline-Vorschlag, Unterzeilen-Vorschlag), Quellen-/Differenzierungscheck-Block (grün), ggf. Freigabe-Block (rot, bei Sponsored), Pflege-Anleitung, und der eigentlichen Card entity-kodiert in einer `<pre>`-Box.
2. **`preview_<thema>.html`** – gerenderte Vorschau mit simulierter Headline (Headline ist NIE Teil der Card; Max pflegt sie manuell in Ghost).

## Workflow

### Phase 1: Briefing und Recherche
- Minimum klären oder begründet annehmen: Thema, Format, zentrale Frage, Anlass. Formate und Ziellängen: Einordnung 700–1.100, Kommentar 700–1.200, Fachanalyse 1.200–1.800, Praxis-Case 1.200–2.000, Leitfaden 1.800–3.000 Wörter. Länge folgt Erkenntniswert, nie SEO.
- **Differenzierungscheck (Pflicht bei News):** Prüfen, ob Versicherungsmonitor, vwheute, Handelsblatt oder Versicherungswirtschaft-heute das Thema schon haben. Wenn ja: keine Nacherzählung, sondern technische Tiefenanalyse oder Praxisübersetzung für IT-Entscheider.
- **Primärquellen bevorzugen** (Pressemitteilungen, BaFin/EIOPA/EUR-Lex, Geschäftsberichte, Originalstudien). Bei Unternehmenszahlen kennzeichnen, von wem sie stammen. Mindestens eine Gegenposition recherchieren.
- Intern Leitfrage und Kernthese (ein Satz, konkret, überprüfbar) formulieren, dann Gliederung.

### Phase 2: Card bauen
- Struktur exakt nach `references/redaktionsstruktur.md` (Kategorie-Zeile, App-Block, Lead, „Das Wichtigste", aussagekräftige H2, Gegenargumente, „Was Versicherer jetzt tun sollten", Fazit, Quellen, genau ein CTA).
- Markup ausschließlich mit den E-Mail-sicheren Bausteinen aus `references/komponenten.md`. Der App-Hinweisblock (Pflicht, erstes Element) liegt zusätzlich einzeln in `assets/app-hinweis.html`.
- **E-Mail-sichere Bauregeln (nicht verhandelbar):**
  1. Alle Styles inline am Element; kein `<style>`-Block, keine Klassen.
  2. Layout mit Tabellen (`role="presentation"`, cellpadding/cellspacing=0); niemals Flexbox oder Grid.
  3. Keine Pseudo-Elemente; Deko als echte Elemente. Balken-Akzente (Listen-Bullets 12×3, H2-Kurzakzent 48×2) als Mini-Tabellen mit td-width/height + bgcolor bauen (Gold `#E5A800` / Blau `#1F4EFF`); Seitenbalken als `border-left` auf der Inhalts-td. ▪-Textzeichen nur als Notlösung.
  4. Jeder `linear-gradient` zusätzlich mit `bgcolor`-Attribut UND `background-color`-Fallback.
  5. Kein Inline-SVG; Icons weglassen oder gehostete PNGs.
  6. Buttons als Tabellen-Buttons (td mit bgcolor + `<a>` mit inline `color:#ffffff; display:inline-block; padding`).
  7. `border-radius` nur als Progressive Enhancement.
  8. Weißer Text auf dunklen Flächen mit vollem Stack (`color`, `-webkit-text-fill-color`, `opacity:1`, `mix-blend-mode:normal`, `filter:none`, `text-shadow:none`) plus bgcolor-Fallback.
  9. Trennlinien via `border-bottom` auf `td`.
  10. **Web-Theme-Override (gegen das echte VTM-Theme-CSS verifiziert):** Jede Tabelle inline `display:table; white-space:normal; background-image:none; margin-top:0;` (ohne eigenes style zusätzlich `margin:0; border-collapse:collapse;`), jede td `background-image:none; border:0` (Deko-/Button-tds zusätzlich `padding:0`), bewusste Rahmen und background-Shorthands DANACH deklarieren, damit sie gewinnen. Grund: Das Ghost-Theme stylt Content-Tabellen als scrollbare Datentabellen (`white-space:nowrap`, `display:inline-block`, td-Rahmen/-Padding), malt WEISSE Verlaufs-Bilder über erste/letzte Spalte (`td:first-child/last-child { background-image: linear-gradient(...#fff...) }` als Scroll-Schatten, übermalt farbige Akzent-Zellen!), legt radiale Schatten-Bilder auf die Tabelle selbst und erzwingt per Nachbar-Selektor `margin-top:2em` auf Tabellen nach Text.

### Phase 3: Prüfen
- `scripts/stilcheck.py` auf die Card-Datei ausführen (Wortzahl, Em-Dashes, En-Dash-Unterbrecher, Buzzwords, E-Mail-Sicherheits-Verstöße, Strukturelemente).
- Interne Qualitätsprüfung nach `references/redaktionsstruktur.md` (8 Kategorien à 0–2 Punkte); Ausgabe erst ab 13/16.
- Faktendisziplin: keine Mutmaßungen als Tatsachen. Ableitungen aus Recht/Logik als solche kennzeichnen („folgt aus Solvency II, nicht aus der Pressemitteilung"). Wertungen Dritter attribuieren. Prognosen konditionalisieren („ob", nicht „wann"). Bei Transaktionen: Genehmigungsvorbehalte nennen.
- Zitatregel: höchstens ein wörtliches Zitat pro Quelle, unter 15 Wörtern; Rest paraphrasieren.

### Phase 4: Ausliefern
- Preview generieren (Card aus `<pre>` extrahieren, Entities decodieren, mit simulierter Headline in Vorschau-HTML einsetzen).
- Beide Dateien via `present_files`. Danach optional anbieten: Excerpt (max. 300 Zeichen, 2–4 Varianten mit Längencheck und Empfehlung), LinkedIn-Teaser (VTM-Corporate-Register), Titelbild.

## Sprachregeln (immer)

- Keine Em-Dashes (—) und keine En-Dashes ( – ) als Satzunterbrecher.
- Keine Buzzwords: revolutionär, disruptiv, Gamechanger, bahnbrechend, einzigartig, sensationell, zukunftsweisend, alternativlos, nahtlos, Kundenfokus.
- Sie-Form in allen publizierten Inhalten. Deutsche Zahlenformatierung (3.569 / 43 % / 5,7 %).
- Ton: Young-Professional-Keynote. Konkret, bildhaft, „Stell dir vor"-Logik als Sie-Variante, Zahlen in Alltagsmaßstäbe übersetzt, kurze Sätze, direkte Ansprache. Stil-Mix: kritisches Nachhaken (Lanz), strukturelle Einordnung (Precht), Branchenpräzision (Fromme), datengetriebene Analyse (Hempel).
- Keine erfundenen Zahlen, Studien, Zitate, Personen, URLs. Fehlende Links als gekennzeichnete Platzhalter (`#LINK-...-EINSETZEN`), nie erfinden.
- Fachbegriffe beim ersten Auftreten ausschreiben und kurz erklären.

## Sonderfall Sponsored Content

Bei Kunden-Assets (z. B. d.velop) gelten Vorrangregeln: Kundentext 1:1, nur visuelle CI-Aufbereitung, keine redaktionelle Umformulierung. Details, abweichende Struktur und Pflicht-Kennzeichnung: `references/sponsored-content.md` lesen, bevor gebaut wird.

## Referenzen

- `references/komponenten.md` – Alle E-Mail-sicheren HTML-Bausteine zum direkten Übernehmen (App-Block, Kategorie, Lead, Wichtigste-Box, H2, Absatz, Callouts, Pull-Quote, Fakt-Kacheln, Vergleich, Schritte, Was-tun-Box, Quellen-Box, CTA-Box, Sponsored-Footer, Diagramm-Rahmen).
- `references/redaktionsstruktur.md` – Verbindliche Artikelstruktur, Abschnittsmuster, Qualitätsprüfung 13/16, Trägerdatei-Aufbau.
- `references/sponsored-content.md` – Sponsored-Regeln und -Struktur.
- `assets/app-hinweis.html` – Der App-Hinweisblock als nacktes, direkt einsetzbares HTML.
- `scripts/stilcheck.py` – Automatischer Stil-, Struktur- und E-Mail-Sicherheits-Check.
