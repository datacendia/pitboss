# Fullstory Pit Boss

A self-contained training platform for teaching **Fullstory** to gaming, gambling and casino clients.

Thirty-seven modules, a 153-entry KPI encyclopedia where every entry carries a build recipe, thirty-five worked client requirements, nine copy-ready deliverable templates, an interactive segment builder with ten marked exercises, a hands-on lab with a sandbox site containing eight planted defects, and a 97-question spaced-repetition drill deck.

Built for an optimisation analyst working with real-money iGaming operators — sportsbook, casino, poker and bingo, lottery, and free-to-play social gaming.

---

## Running it

Live at **https://fullstorypitboss.netlify.app**

Or clone and open `index.html`. That is the whole installation process.

```bash
git clone https://github.com/datacendia/pitboss.git
cd pitboss
```

Then double-click `index.html`, or serve the folder if you prefer a real origin:

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
| **IV — Insight to change** | Thirty-five requirements clients actually voice, each decoded into what it really means, the exact segments and funnels to build, the events to instrument, the KPI it moves, the deliverable, and the trap. Then the experimentation method: falsifiable hypotheses, prioritisation, sample size at gambling funnel baselines, test duration against the fixture calendar, validity checks, and what must never be tested on a licensed site. |
| **V — KPIs** | The nine build patterns every metric reduces to, then 153 KPIs across twelve domains. Each carries its formula, an indicative range with a confidence tag, its pattern, the instrumentation it needs first, numbered build steps, the cuts to segment by, and what goes wrong. |
| **VI — Practice** | A 97-question drill deck in three formats with spaced repetition, an interactive segment builder that marks your logic and explains each mistake, a glossary, a hands-on lab, a scenario coach, and a sources page. |

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

`index.html` and `artifact.html` are **generated**. Do not edit them directly.

```
src/          module sources — one file per group of sections. Edit these.
build.py      regenerates both HTML outputs from src/
netlify.toml  headers and the artifact.html redirect for the deployed site
app.js        navigation, search, progress, filters, quiz, generator, coach
styles.css    all styling, including both light and dark themes
data-req.js       35 client requirements + the onboarding plan generator
data-kpi.js       KPI encyclopedia, glossary, base drill questions
data-kpi-build.js build recipe for every KPI, keyed by name
data-kpi-conf.js  benchmark confidence tiers
data-quiz.js      the expanded drill deck
data-lab.js       the lab sandbox site, as a single downloadable file
data-drill.js     the segment composition drills and their answers
drill.js          the interactive segment builder and its checker
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

`index.html` is a complete HTML document and is the one that gets **served** — by Netlify, by a local server, or by double-clicking it.

`artifact.html` is the same content with no doctype, `<html>`, `<head>` or `<body>`, because it is published as a hosted Artifact and the publishing wrapper supplies those. **Never serve it.** Without a doctype the browser drops into quirks mode, and without a `<meta charset>` it decodes the data files as windows-1252, mangling every dash, arrow and `£`. `netlify.toml` redirects it to the root so it cannot be reached by accident.

Both reference the same sibling CSS, JS and data files, so there is exactly one copy of each.

---

## Where it runs

| | Progress sync | Scenario coach | File downloads |
| --- | --- | --- | --- |
| **Netlify** — https://fullstorypitboss.netlify.app | browser storage | hidden | copy blocks |
| **Local clone** — `index.html` | browser storage | hidden | copy blocks |
| **Hosted Artifact** | across devices | yes | yes |

The Artifact build adds three things a static host cannot do: progress and notes that sync across devices, a scenario coach that role-plays a client, and file downloads for the templates and the lab sandbox. Everywhere else falls back to per-browser storage, hides the coach rather than showing a dead button, and offers the same content as copyable blocks. All 37 modules and every word of content are identical in all three.

Use the hosted Artifact for notes, the Netlify link for sharing and for reading on a phone, and the clone for client sites where guest wifi is locked down and having the KPI encyclopedia offline in a meeting is worth the duplication.

---

## Licence

No licence is granted. This is personal training material, published for convenience rather than reuse.
