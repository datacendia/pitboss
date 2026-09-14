# Fullstory Pit Boss

A self-contained training platform for teaching **Fullstory** to gaming, gambling and casino clients.

Thirty-five modules, a 153-entry KPI encyclopedia where every entry carries a build recipe, thirty-five worked client requirements, nine copy-ready deliverable templates, a hands-on lab with a sandbox site containing eight planted defects, and an 88-question spaced-repetition drill deck.

Built for an optimisation analyst working with real-money iGaming operators — sportsbook, casino, poker and bingo, lottery, and free-to-play social gaming.

---

## Running it

Clone and open `standalone.html`. That is the whole installation process.

```bash
git clone https://github.com/datacendia/pitboss.git
cd pitboss
```

Then double-click `standalone.html`, or serve the folder if you prefer a real origin:

```bash
python -m http.server 8080
```

No build step, no dependencies, no package manager. Works offline apart from the web fonts, which fall back to system faces.

---

## What is in it

| Part | Contents |
| --- | --- |
| **I — The Product** | Eleven modules on Fullstory itself: the capture architecture, installation across snippet / npm / GTM / CDP, identity and the pseudonymous `uid`, the event data model, privacy and masking, replay craft, segments, funnels and journeys, frustration signals, the warehouse sync and APIs, and multi-brand administration. |
| **II — The Client's Data** | Six modules on what a gambling operator actually measures: the five verticals and their different economics, money mechanics (GGR, NGR, hold, RTP, wagering requirements), the twelve-stage player lifecycle with failure modes, the vendor stack behind every brand, a full event taxonomy per vertical, and the regulatory lines. |
| **III — Onboarding** | A six-phase 90-day framework, six client archetypes worked through week by week, a 35-question discovery script, a role-by-role training curriculum, an account health check, nine deliverable templates, and a plan generator that assembles a programme from a client profile — and flags where that profile contradicts itself. |
| **IV — Requirements** | Thirty-five requirements clients actually voice, each decoded into what it really means, the exact segments and funnels to build, the events to instrument, the KPI it moves, the deliverable, and the trap. |
| **V — KPIs** | The nine build patterns every metric reduces to, then 153 KPIs across twelve domains. Each carries its formula, an indicative range with a confidence tag, its pattern, the instrumentation it needs first, numbered build steps, the cuts to segment by, and what goes wrong. |
| **VI — Practice** | An 88-question drill deck in three formats with spaced repetition, a glossary, a hands-on lab, a scenario coach, and a sources page. |

---

## Honesty about the content

Product facts were checked against Fullstory's live help centre and developer documentation on **13 September 2026**. The *Sources & confidence* module lists every verified claim with its source link, and — more usefully — states plainly what is **not** verified: the specific UI steps inside the build recipes, plan-dependent limits, and vendor lists.

Benchmark ranges carry one of five confidence tags, visible on every KPI:

| Tag | Meaning |
| --- | --- |
| `published` | A citable standard — a web performance threshold or a card-scheme rule. |
| `industry` | Widely reported across the industry. Offer as context, never as a target. |
| `requirement` | Not a benchmark — a regulatory or operational requirement. |
| `client only` | No honest external comparison exists. Use the client's own baseline. |
| `estimate` | **The default.** A smell test for whether a figure is roughly normal. Never quote it to a client as a benchmark. |

Eighty-three of the 153 ranges are estimates. Tagging them is honesty, not a fix; replacing them with real figures is the most valuable contribution anyone with access to live operator data can make.

Nothing here is legal advice. The regulatory module is oriented correctly and is not a substitute for a client's compliance team.

---

## Editing it

`index.html` and `standalone.html` are **generated**. Do not edit them directly.

```
src/          module sources — one file per group of sections. Edit these.
build.py      regenerates both HTML outputs from src/
app.js        navigation, search, progress, filters, quiz, generator, coach
styles.css    all styling, including both light and dark themes
data-req.js       35 client requirements + the onboarding plan generator
data-kpi.js       KPI encyclopedia, glossary, base drill questions
data-kpi-build.js build recipe for every KPI, keyed by name
data-kpi-conf.js  benchmark confidence tiers
data-quiz.js      the expanded drill deck
data-lab.js       the lab sandbox site, as a single downloadable file
```

After any change:

```bash
python build.py
```

Common edits:

- **Add a KPI** — append to the array in `data-kpi.js`, then add a matching entry keyed by the same name in `data-kpi-build.js`. Category chips and counts update themselves.
- **Add a requirement** — append to the array in `data-req.js`, keeping `theme` to an existing filter value.
- **Change the generator's judgement** — `BUILDER.run()` at the bottom of `data-req.js`. The risk and conflict lists are plain `if` statements, one per client attribute. They encode a starting position, not a finding; rewrite them as real experience accumulates.
- **Add a module** — create a file in `src/` containing a `<section class="view" id="…" data-part="…" data-nav="…">`, add its filename to `ORDER` in `build.py`, and rebuild. Do not put a number in `data-nav` — module numbers are generated from document order at runtime, so reordering `ORDER` renumbers the whole curriculum.

### Why there are two HTML outputs

`index.html` carries no doctype, `<html>`, `<head>` or `<body>`, because it is published as a hosted Artifact and the publishing wrapper supplies those. Opened directly from disk it falls into quirks mode and the browser decodes the data files as windows-1252, which mangles every dash, arrow and `£`. `standalone.html` is the same content with a real doctype and charset. Both reference the same sibling CSS, JS and data files, so there is exactly one copy of each.

---

## Hosted version

The same content is published as a private Artifact, which adds three things the local copy cannot do: progress and notes that sync across devices, a scenario coach that role-plays a client, and file downloads for the templates and the lab sandbox. The local copy falls back to browser storage, hides the coach, and offers the same content as copyable blocks.

Use the hosted version for notes; keep the clone for client sites, where guest wifi is frequently locked down and having the KPI encyclopedia available offline in a meeting is worth the duplication.

---

## Licence

No licence is granted. This is personal training material, published for convenience rather than reuse.
