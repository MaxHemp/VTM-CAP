# Verbindliche Artikelstruktur (Redaktionsanleitung v1.0, Ghost-Umsetzung)

Reihenfolge der Elemente in der Card. Hauptüberschrift ist NIE Teil der Card (Max setzt sie in Ghost).

1. **App-Hinweisblock** – erstes Element, vor allem anderen (`assets/app-hinweis.html`). Gilt für reguläre UND Sponsored-Artikel.
2. **Kategorie-Zeile** – `KATEGORIE | FORMAT`, z. B. „InsurTech | Einordnung", „Künstliche Intelligenz | Analyse". Bei Sponsored: „Anzeige · In Kooperation mit <Kunde> | Praxis-Case".
3. **Lead** (80–150 Wörter): konkrete Beobachtung → Widerspruch/Problem → Konsequenz für Versicherer → Leitfrage. Kernaussage zuerst, kein Clickbait, keine Floskel-Einstiege („Die Digitalisierung schreitet voran...").
4. **„Das Wichtigste"** – Box mit genau 3 eigenständigen Kernerkenntnissen (keine Themenlabels, keine Überschriften-Wiederholung). Nach den drei Punkten muss das Grundargument verstanden sein.
5. **Hauptteil**: 3–7 H2-Abschnitte. Zwischenüberschriften enthalten inhaltliche Aussagen („Fehlende Datenverantwortung verhindert die Skalierung", nicht „Herausforderungen"). Wer nur die Überschriften liest, versteht die Argumentation. Jeder Abschnitt: **Aussage → Beleg → Bedeutung → Konsequenz**. Ein Hauptgedanke pro Absatz, 2–4 Sätze.
6. **„Gegenargumente und Grenzen"** – Pflicht bei Analysen/Einordnungen, mindestens eine relevante Einschränkung oder Gegenposition, fachlich geprüft (stärkt die Analyse, relativiert nicht künstlich). Entfällt bei Sponsored Content.
7. **„Was Versicherer jetzt tun sollten"** – konkrete Maßnahmen, Verantwortlichkeiten, Prüffragen; als ▪-Liste in der Was-tun-Box. Mindestens ein Abschnitt des Artikels beantwortet ausdrücklich „Was bedeutet das für Versicherer?" (Prozesse, Rollen, Chancen, Risiken, Voraussetzungen, Entscheidungen).
8. **Fazit** (100–200 Wörter): klare Antwort auf die Leitfrage → wichtigste Konsequenz → redaktionelle Bewertung → konkreter nächster Schritt oder Ausblick. Keine Einleitungs-Wiederholung.
9. **Quellenverzeichnis** – Quellen-Box mit Herausgeber, Titel, Datum, Originallink. Primärquellen zuerst.
10. **Genau ein CTA** – kontextbezogener nächster Schritt in der dunklen CTA-Box (Standard: AI Insurance Briefing abonnieren, Link: https://www.linkedin.com/newsletters/ai-insurance-briefing-7376977231333453824/ – oder passender Fachartikel/Dossier). Nie eine zweite App-Bewerbung (der App-Block oben ist Lese-Hinweis, kein CTA). Keine konkurrierenden CTAs.

## Zahlen- und Faktenregeln

- Zahlen immer mit Bezugsgröße, Zeitraum, Quelle, ggf. Einschränkung. Unternehmensangaben als solche kennzeichnen („nach Unternehmensangaben", „nach eigenen Angaben").
- Korrelation nie als Kausalität ausgeben. Interessenkonflikte von Quellen benennen.
- Rechtliche/logische Ableitungen kennzeichnen (Muster: „folgt aus Solvency II, nicht aus der Pressemitteilung").
- Prognosen als offene Fragen formulieren; laufende Transaktionen mit Genehmigungsvorbehalt kennzeichnen.
- Visual-Vorschläge im Manuskript kennzeichnen: `[Visual-Vorschlag: ...]`.

## Interne Qualitätsprüfung (vor Ausgabe, min. 13/16)

Je Kategorie 0–2 Punkte: A Relevanz (konkrete Prozesse/Rollen/Entscheidungen benannt), B Kernaussage (konkrete, überprüfbare These), C Belege (mehrere Primärquellen, eingeordnet), D Leserführung (Überschriften tragen die Argumentation), E Praxisnutzen (konkrete Maßnahmen/Prüffragen), F Differenzierung (Gegenargumente fachlich geprüft), G Sprache (präzise, aktiv, floskelfrei), H Abschluss (Antwort, Priorität, nächster Schritt). Unter 13: überarbeiten, nicht ausgeben.

## Aufbau der Trägerdatei (Single-Card-HTML)

Eigenes `<style>` NUR für die Trägerdatei selbst (nicht für die Card!). Blöcke in dieser Reihenfolge:
1. `<h1>` Titel „Ghost-Card: <Thema>"
2. `.meta`-Block (gelb): Wortzahl, Format, Cluster, Headline-Vorschlag, Alt-Headline, Unterzeilen-/Excerpt-Vorschlag, ggf. Ghost-Tag.
3. `.factcheck`-Block (grün): Quellen- und Differenzierungscheck (welche Medien haben berichtet, wogegen verifiziert, Kennzeichnungen).
4. Bei Sponsored: `.approval`-Block (rot): Freigabe-Erfordernisse.
5. `.intro`-Block (Pflege-Anleitung: Headline+Excerpt in Ghost anlegen, `/html`, einfügen).
6. `.paste-box` mit Label und `<pre>`: Die komplette Card, entity-kodiert (`&lt; &gt; &quot; &amp;`; Umlaute als `&#228;` etc. sind zulässig und robust).

## Preview-Generierung

Card aus `<pre>` per Regex extrahieren, Entities decodieren (`&lt;`→`<`, `&gt;`→`>`, `&quot;`→`"`, `&amp;`→`&`), in Vorschau-HTML mit simulierter Headline-Zeile (Arial Narrow 900, #0D1C3C, blauer Bottom-Border, Meta-Zeile) einsetzen. Bei Textänderungen an der Card: Python `str.replace()` nutzen (zuverlässiger als str_replace bei Anführungszeichen-Kodierung); Preview danach IMMER neu generieren.
