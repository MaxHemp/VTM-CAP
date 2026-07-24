# VTM Design System — VersicherungsTech Magazin

**Version 4.2 · „Luminous Editorial Edition" (Arbeitsfassung Master-Next)**

VersicherungsTech Magazin (VTM) ist das digitale B2B-Fachmagazin an der Schnittstelle von Versicherung, Technologie und Transformation. Es übersetzt technologische, regulatorische und organisatorische Veränderungen in belastbare Einordnung für Entscheider der Versicherungswirtschaft (Vorstand/C-Level, Architektur/IT, Fachbereich/Transformation). Claim: **„Technologie verstehen. Versicherung verändern."**

**Brand Principles (verbindlich):** 1. Inhalt vor Dekoration · 2. Evidenz vor Behauptung · 3. Präzision vor Effekt · 4. Zugang vor Exklusivität.

## Sources

- `uploads/VTM-Brand-Design-System-Master-Next.html` — the master brand & design system document (9.7k lines, German). Contains full CSS token set, component specimens, voice & tone, governance, an embedded machine-readable JSON spec (`#vtm-design-system-specification`), and an application matrix. **This is the ground truth**; all values here are copied verbatim from it.
- `uploads/Logo Icon.png` — VTM brand icon, color (1200×1200, transparent). Copied to `assets/logos/vtm-icon-color.png`.
- `uploads/VTM Brand Icon White.png` — brand icon, white (130×134). Copied to `assets/logos/vtm-icon-white.png`.
- Wordmark logos (color + white) are approved brand assets hosted on Ghost CDN (referenced with `referrerpolicy="no-referrer"`):
  - Color: `https://storage.ghost.io/c/16/79/16794837-6459-4f6f-b4c4-2787d5771849/content/images/size/w1000/2026/04/Logo--2-.png`
  - White: `https://storage.ghost.io/c/16/79/16794837-6459-4f6f-b4c4-2787d5771849/content/images/size/w1000/2026/07/versicherungstech_logo_white.png`
  - Local copies were NOT provided; the master mandates local storage under `assets/logos/` for production. **Ask the user for the wordmark PNGs.** Never regenerate or redraw the logo (`data-generation-allowed="false"`).
- Website: www.versicherungstech-magazin.de

## CONTENT FUNDAMENTALS

- **Language: German**, formal register (Sie), journalistic. Everything user-facing is German.
- **Tone: präzise, souverän, technisch fundiert, kritisch, zugänglich, meinungsstark.** Calm authority — no hype, no advertising superlatives, no exclamation marks. Uncertainty is made visible ("Ob sich der Wert übertragen lässt, bleibt offen.").
- Every piece of content must **erklären, einordnen, belegen** oder eine Entscheidung besser machen ("Relevanz ohne Rauschen").
- **Evidence-first**: numbers, timeframes, sources, sample sizes are named. Facts / forecasts / opinions / advertising are strictly distinguished. Sponsored content is labeled "Sponsored Content"/"Anzeige" *before* title and teaser.
- **Style rules**: active short sentences; German date format „10. Juli 2026"; percent as „18 %" (nbsp); abbreviations expanded on first use; people named with Name, Funktion, Organisation; neutral terms („Fachkräfte", „Beschäftigte").
- **NO emoji.** Meta information set in uppercase IBM Plex Mono („VTM RESEARCH / MODERNISIERUNGSINDEX 2026 / N=84 / DATENSTAND 30.06.2026").
- Good vs. bad example: ✔ „Laut der veröffentlichten Studie verkürzt sich die durchschnittliche Bearbeitungszeit um 18 Prozent." ✘ „Die revolutionäre Lösung transformiert die gesamte Branche und garantiert maximale Effizienz."
- Editorial formats are recognizable before opening: Analyse, IT-Praxis, Research, Interview, Meinung — signaled via Tags and mono story-index labels („01 / ANALYSE").

## VISUAL FOUNDATIONS

- **Color philosophy — "Helle Redaktion, elektrische Akzente."** Area balance is a brand rule: 85–92 % neutral (white/paper), 5–10 % Deep Cobalt `#121E39` (authority: nav, footer, dark cards), 2–5 % Signal Electric `#123FA6` (interaction: links, buttons, focus, data), **<1 % Research Brass `#C99B32`** — brass marks ONLY VTM-eigene Research/Evidenz, never general decoration.
- **Type — four roles, one voice**: Plus Jakarta Sans 600–800 (display/H1–H3, tight tracking −0.035…−0.065em); Inter 400–700 (body & UI, 16–18px, lh 1.65–1.75, 60–68ch); Source Serif 4 italic (pull-quotes, essays — never nav/forms); IBM Plex Mono 500–600 (meta, dates, data labels, IDs, uppercase + letterspacing). Fluid scale `--step--1`…`--step-hero`.
- **Backgrounds**: white/paper; light chapters get a faint blue tint-gradient; hero uses the code-native `--gradient-hero-atmosphere` (radial light fields + faint 72px grid + orbits + signal line) — a full brand opener needing NO image/video. Dark surfaces use `--gradient-brand-deep`.
- **Gradients are brand moments, not fill color**: brand gradient for heroes/covers/footers/chapter dividers only; never behind body text, forms, tables.
- **Motion**: purposeful and rare. Durations 160/320/780ms, eases `--ease-standard`/`--ease-signal`; atmosphere 14s+. Three levels: 0 static (letters, offers, email, print), 1 functional (focus/hover/reveal), 2 editorial (Signal Line pass, Research Glint, hero atmosphere). One dominant light moment per viewport. `prefers-reduced-motion` always respected. Never animate the logo.
- **Hover**: cards lift −3px + electric border/glow, top accent line grows; buttons lift −2px, primary darkens to `#0e3387` with a one-time glint sweep; links darken. **Press**: translateY(0), 80ms.
- **Borders**: hairline `--border-soft` (10% cobalt) / `--border-medium` (18%); electric/brass tinted borders for signal states.
- **Shadows**: soft ambient cobalt-tinted (`--shadow-soft`, `--shadow-medium`); `--glow-electric`/`--glow-brass` only for interaction/research meaning. No glassmorphism as universal style.
- **Radii**: small & controlled — 4/6/8px only. No pill/bubble radii (buttons/tags 4px, cards 6px, panels 8px).
- **Cards**: white, 1px soft border, radius 6, soft shadow, 2px gradient accent line top-left, notched top-right corner. Variants: `card-dark` (brand-deep gradient, brass meta), `card-research` (brass border/glow + hover glint).
- **Imagery**: dokumentarisch statt dekorativ — real people/work contexts, natural color, no cyber/neon/hologram clichés, no blue overlay filter, no handshake/puzzle/robot stock. Formats: Hero 16:9|3:2, Porträt 4:5, Social 1:1|4:5, Story 9:16, Research 3:2. Never generate images for real editorial use.
- **Layout**: widths Reading 720 / Content 1200 / Wide 1440 / Full-bleed (openers only); 4/6/12-column responsive grid; spacing scale 4,8,12,16,24,32,48,64,96,128px; min viewport 320px.
- **Numbers/data**: tabular-nums, right-aligned, IBM Plex Mono for IDs; bar charts start at zero, direct value labels, source line mandatory; brass rows only for VTM-own data.

## ICONOGRAPHY

- **Reduced geometric outline icons**: inline SVG, 24×24 viewBox, `stroke-width: 1.5`, round caps/joins, `fill="none"`, `stroke="currentColor"` so icons inherit text/status color. Defined in the master by example (Suche, Weiter, Daten, Tabelle) — no proprietary icon font.
- Nearest CDN match if a full set is needed: **Lucide** (same 24px grid/outline style; use `stroke-width="1.5"`). This is a substitution — flag it when used.
- No 3D, emoji, neon or arbitrary AI icon aesthetics. Unicode chars used sparingly as functional separators („·", „→" in workflow steps, „/" in breadcrumbs). **No emoji anywhere.**
- Standalone icon buttons need `aria-label`; status is never icon/color-only — always with text.
- Brand marks: icon PNGs in `assets/logos/`; wordmark from CDN (see Sources). Logo is never animated, recolored, shadowed or distorted; min width 140 CSS px; clear space = optical height of the "V".

## Index

- `styles.css` — global entry; imports `tokens/*.css` + `components/components.css`
- `tokens/` — colors, typography, layout/spacing, effects (shadows/gradients), base element styles, fonts
- `components/core/` — Button, Tag, StatusBadge, Kicker, Note, SignalLine, BrandRail, Logo
- `components/editorial/` — Card, StoryCard, PullQuote, BarChart
- `components/forms/` — TextField, CheckboxField
- `components/application/` — DataTable, Breadcrumbs, WorkflowSteps, Skeleton, EmptyState, Toast, Dialog
- `ui_kits/magazine/` — Editorial-Website recreation (home + article, interactive)
- `slides/` — sample slide types from chapter 20 (Titel, Kapiteltrenner, Inhalt, Zitat, Daten, Abschluss)
- `guidelines/` — foundation specimen cards (colors, type, spacing, brand)
- `assets/logos/` — brand icon PNGs
- `SKILL.md` — agent skill entry point

## Intentional additions

- `Logo` component (wraps approved CDN wordmark + local icon with correct usage variants) — convenience wrapper, not a new design.
- `.story-visual img` cover-fit rule — the master's story visual is a code-native demo surface; real story cards carry editorial images.

## Application matrix (short)

Editorial/Corporate/Landingpage: images ok, motion ≤2. Webanwendung/Dashboard: Inter UI, cobalt sidebar, motion ≤1, no editorial staging (no hero orbits, story cards, pull quotes). Angebot/Report/Geschäftsbrief/E-Mail: motion 0, no gradients behind text, color logo on white, office fallback fonts (Aptos/Segoe UI/Arial). Full machine-readable matrix: JSON block in the master HTML.

## Caveats

- Webfonts load via Google Fonts `@import` (preview convention of the master). Production requires locally hosted WOFF2 (Plus Jakarta Sans, Inter, Source Serif 4, IBM Plex Mono — all on Google Fonts/OFL). No font binaries were provided.
- Wordmark logo files not provided locally (CDN only, see Sources).
