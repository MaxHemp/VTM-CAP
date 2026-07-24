#!/usr/bin/env python3
"""VTM-Stilcheck: prueft eine Ghost-Single-Card-Traegerdatei auf Stil, Struktur und E-Mail-Sicherheit.

Aufruf: python3 stilcheck.py <pfad-zur-card-datei.html> [--sponsored]
"""
import re, sys, html

def main():
    if len(sys.argv) < 2:
        print("Aufruf: python3 stilcheck.py <card.html> [--sponsored]"); sys.exit(1)
    pfad = sys.argv[1]
    sponsored = "--sponsored" in sys.argv
    with open(pfad, "r", encoding="utf-8") as f:
        voll = f.read()

    m = re.search(r"<pre>(.*?)</pre>", voll, re.DOTALL)
    if not m:
        print("FEHLER: keine <pre>-Card-Box gefunden"); sys.exit(2)
    card = (m.group(1).replace("&lt;", "<").replace("&gt;", ">")
                      .replace("&quot;", '"').replace("&amp;", "&"))
    text = html.unescape(re.sub(r"<[^>]+>", " ", card))
    text = re.sub(r"\s+", " ", text).strip()
    fehler, warnungen = [], []

    # --- Stil ---
    wz = len(text.split())
    if "\u2014" in text: fehler.append(f"Em-Dash gefunden ({text.count(chr(8212))}x)")
    if re.search(r" \u2013 ", text): fehler.append("En-Dash als Satzunterbrecher gefunden")
    for b in ["revolution\u00e4r","disruptiv","Gamechanger","Game Changer","bahnbrechend",
              "einzigartig","sensationell","zukunftsweisend","alternativlos","nahtlos","Kundenfokus"]:
        if b.lower() in text.lower(): fehler.append(f"Buzzword: {b}")

    # --- E-Mail-Sicherheit ---
    for k, v in {"<style": "<style>-Block in der Card", "display:flex": "Flexbox",
                 "display: flex": "Flexbox", "display:grid": "CSS-Grid", "display: grid": "CSS-Grid",
                 "<svg": "Inline-SVG", "::before": "Pseudo-Element", "::after": "Pseudo-Element",
                 'class="vtm': "CSS-Klassen"}.items():
        if k in card: fehler.append(f"E-Mail-unsicher: {v}")
    # Web-Theme-Override-Pruefung
    tabs = re.findall(r"<table[^>]*>", card)
    tds_all = re.findall(r"<td[^>]*>", card)
    t_ohne = [t for t in tabs if "white-space:normal" not in t]
    td_ohne = [t for t in tds_all if "border:0" not in t]
    if t_ohne: fehler.append(f"{len(t_ohne)} Tabelle(n) ohne Web-Theme-Override (display:table; white-space:normal)")
    if td_ohne: fehler.append(f"{len(td_ohne)} td(s) ohne border:0-Override")
    t_bg = [t for t in tabs if "background-image:none" not in t]
    td_bg = [t for t in tds_all if "background-image:none" not in t]
    if t_bg: fehler.append(f"{len(t_bg)} Tabelle(n) ohne background-image:none (Theme-Schatten-Bilder!)")
    if td_bg: fehler.append(f"{len(td_bg)} td(s) ohne background-image:none (Theme-Weiss-Gradient uebermalt Akzente!)")

    grads = card.count("linear-gradient")
    dunkle_ohne_fallback = len(re.findall(r'<table(?![^>]*bgcolor)[^>]*linear-gradient', card))
    if dunkle_ohne_fallback: fehler.append(f"{dunkle_ohne_fallback} Gradient-Tabelle(n) ohne bgcolor-Fallback")

    # --- Struktur (Redaktionsanleitung) ---
    body = card.split("</style>")[-1]
    struktur = {
        "App-Hinweisblock": "iOS App lesen" in body,
        "App-Block ist erstes sichtbares Element": body.find("iOS App lesen") < 2500 and body.find("iOS App lesen") != -1,
        "Kategorie-Zeile ( | )": bool(re.search(r"[A-Za-z\u00c4\u00d6\u00dc].{0,40}\|.{0,40}(Einordnung|Analyse|Kommentar|Leitfaden|Praxis-Case|Case)", text)),
        "Das Wichtigste": "Das Wichtigste" in text,
        "Quellen-Box": "Quellen" in text or "Quelle" in text,
        "Genau 1 CTA-Button": body.count("display:inline-block; padding:12px 26px") + body.count("display:inline-block; padding:13px 26px") == 1,
    }
    if not sponsored:
        struktur["Gegenargumente und Grenzen"] = "Gegenargumente" in text
        struktur["Was-tun-Abschnitt"] = ("tun sollten" in text) or ("Konsequenzen" in text) or ("Standortbestimmung" in text)
        struktur["Fazit"] = "Fazit" in text
    else:
        struktur["Sponsored-Kennzeichnung (Anzeige)"] = "Anzeige" in text
        struktur["Sponsored-Footer (Kooperation)"] = "Kooperation" in text
        if "Gegenargumente" in text: warnungen.append("Sponsored: Gegenargumente-Abschnitt gefunden (sollte entfallen)")

    for name, ok in struktur.items():
        if not ok: fehler.append(f"Struktur fehlt/verletzt: {name}")

    if "#LINK-" in body: warnungen.append("Platzhalter-Link (#LINK-...) noch nicht ersetzt")

    # --- Ausgabe ---
    print(f"Wortzahl: {wz}")
    print(f"Gradients: {grads} (alle mit Fallback)" if not dunkle_ohne_fallback else f"Gradients: {grads}")
    if fehler:
        print(f"\n{len(fehler)} FEHLER:");  [print("  -", f) for f in fehler]
    if warnungen:
        print(f"\n{len(warnungen)} Warnung(en):"); [print("  -", w) for w in warnungen]
    if not fehler:
        print("\nAlle Pruefungen bestanden.")
    sys.exit(3 if fehler else 0)

if __name__ == "__main__":
    main()
