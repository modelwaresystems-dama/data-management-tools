# Nedbank Marketing Data & AI Engagement — HTML Pack

Modelware · Data Management  ·  Client: Nedbank

A set of linked, self-contained web pages — in the Trade Finance Pack tradition — that let Nedbank Marketing **agree and align on its Data & AI business architecture first**, then use that agreed architecture as the spine of a role-based training and adoption engagement.

## Opening the pack
Unzip into a single folder, keep every file together (pages link by relative path), and open **index.html** in a current browser (Chrome, Edge, Firefox). No server, no install, no sign-in. Every page works fully offline.

## The pages
1. **index.html** — Landing: engagement overview, directory, workbooks, publish status.
2. **business_architecture.html** — Centrepiece: capability map coloured by agreed maturity; click any capability to drill into everything it links to along the chain, and sign it off.
3. **customer_journey.html** — Journey-map explorer across the lifecycle backbone, per line of business, with CLV governance and the CXO operating model.
4. **hyperpersonalisation_cdp.html** — The closed-loop personalisation engine and the CDP capability model.
5. **ai_usecases.html** — Value-vs-risk portfolio with live 1–5 driver scoring and CSV round-trip.
6. **training_adoption.html** — Role pathways × four learning phases, Champions as the Responsible-AI engine, feedback loop.
7. **governance_responsible_ai.html** — Layered heatmap (Data Governance · Responsible AI · Change & Adoption) with a success-measure scorecard.
8. **glossary_settings.html** — Point the pack at the Nedbank Glossary Workbench (base URL + link template).

## The architecture spine
Stakeholders → Value Propositions → **Customer Journeys** → Capabilities → Processes → Decision Models, with KPIs/Outcomes measuring value and feeding back. The Customer Journey layer (added for this engagement) sits between the promise and the delivery.

## Content sources
A **source selector** in the nav switches between three content tiers:
- **Generic (baked-in)** — industry-generic Banking Marketing Architecture; ships inside the app, always offline. **Live in this build.**
- **Nedbank Public** — the agreed, cleared architecture for the wider audience. *Wired to the public GitHub layer later.*
- **Nedbank Private** — the live working content the working group edits/votes/signs off via GitHub token. *Wired later.*

## Sign-off & maturity
Every capability and governance cell carries a status (Proposed / Agreed / Needs work), a maturity score (0 Absent · 1 Ad-hoc · 2 Developing · 3 Defined · 4 Managed · 5 Optimising), a vote and a comment. In this build these save to the browser; in the working repo each change is a commit and PR merge is the sign-off gate.

## Assets
- `assets/data.js` — the single source of truth for the Generic content layer.
- `assets/pack.css` — shared house style.
- `assets/pack.js` — shared behaviour (nav, sources, sign-off, panels, deep-links, glossary resolver).

## Deployment
Built for the existing `data-management-tools` public GitHub Pages site (app shell) with Nedbank content in the `nedbank_marketing_business_architecture` private repo. Drop the pack in and it runs.
