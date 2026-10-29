# Handover: linking the Zambia Government Operating Model into the MDA Assessment tools

**App:** Zambia Government Operating Model (navigator)
**Version at handover:** v1.2.0 (built 2026-10-29 SAST)
**Repo target:** `data-management-tools`
**Prepared:** 2026-10-29, Modelware Systems
**Project:** Digital Zambia Acceleration (ZM-SZ-466193-CS-QBS)

This document tells whoever owns the `data-management-tools` repo and the MDA assessor console how to include the Zambia Government Operating Model navigator in the main tools. It covers four integration points, in order of effort: Navigator card (zero code), console link (one button), data contract, and catalog theme tie-in. Each point says what is already done and what is left for the repo owner.

## 1. What is being handed over

Two files, as their own folder:

```
ZambiaGovOperatingModel/
  index.html                               the navigator app (self-contained markup/JS)
  zambia_opmodel.json                      the source-of-truth model the app is built from
  figure-international-generic-model.png   Figure 1 from the baseline doc (shown in the app)
  figure-zambia-implementation-view.png    the Zambia implementation figure (shown in the Mapping tab)
```

`index.html` is fully self-contained: the model data and both figures are embedded (the figures as inline WebP data URIs since v1.1.1), so it renders anywhere with no external files (double-click, file://, served, or a Pages deploy). The two PNGs are optional standalone assets; the app does not depend on them. `zambia_opmodel.json` is the same model as a standalone data file, for the catalog and the viewer family to read. No build step, no bundler.

What it shows: the four-level hierarchy (Government Scope to Domain to Subject Area to Information Concept) with the generic-model figure, 14 domains (7 flagged in the current assessment scope), 95 subject areas, 529 concepts, a **Mapping to Zambia** tab (the Zambia implementation figure, the 15 institutional groupings mapped to generic interpretation and treatment, the 14 certified bodies placed by Domain and Subject Area, and the cross-reference side rails plus digital overlay), a certified entity registry with evidence grades, the 17-type taxonomy, the 7 placement rules, and the answered decisions plus a validation backlog.

## 2. Integration point 1: Navigator card (no code)

The app already meets the repo versioning standard, so the Modelware Asset Navigator picks it up automatically:

- `<meta name="version" content="1.0.1">` is in the head, and the on-screen badge reads the number from the meta tag by script (never typed twice). `build-manifest.mjs` reads this for the card; the "updated" date comes from git.
- The app is the main `index.html` of its own folder (`ZambiaGovOperatingModel/`), so it is discovered as a standalone card and any sub-pages would stay hidden.

**To include it:** drop the `ZambiaGovOperatingModel/` folder into the repo at the same level as the other app folders and commit. The card appears on the next Navigator build. If you prefer to curate it by hand, add it in the Navigator's Manage mode instead.

Nothing else is required for the Navigator. Do not rename or remove the meta tag.

## 3. Integration point 2: link from the MDA assessor console (one button)

The assessor console (`MDA_Readiness_Assessment/index.html`) already links its Guide and Methodology sub-pages from header buttons. Add the operating model the same way, as a sibling-folder link.

Mirror the existing Guide/Methodology button markup and add one more. The relative path from the console to the app is:

```html
<a class="btn" href="../ZambiaGovOperatingModel/index.html" target="_blank" rel="noopener">
  Operating Model
</a>
```

A second, lighter-weight placement: add the same link in the console's **Reference** tab, where the metamodel and definitions already live, so an assessor can jump from a requirement to the domain or entity it concerns.

I did not edit the console in this handover: the `data-management-tools` repo is not connected to the session that built this, so I cannot see the exact button classes. Copy the class names and placement from the existing Guide/Methodology buttons so the new one matches. This is a one-line addition, not a redesign.

## 4. Integration point 3: data contract and the `?data=` launch convention

`zambia_opmodel.json` is the single source of truth. Its top-level shape:

```
meta            {title, version, generated (SAST), owner, project, baseline, note}
hierarchy       ["Government Scope","Government Domain","Subject Area","Information Concept"]
decisions       the 9 answered register picks
counts          domains, domains_in_assessment_scope, subject_areas, information_concepts, entities_public, entities_external, grades
domains[]       {num, name, status (E/S/B), boundary, in_assessment_scope,
                 subject_areas[{name, origin, concepts[], provisional?, tor?, concept_families[]}]}
entity_types[]  {type, definition, basis, scope}            (the 17-type taxonomy)
resolution_rules[]                                          (the 7 rules, verbatim)
entities[]      {id, name, aliases[], type, domain, subject_area, instrument, status,
                 ownership, grade (A/B/C/D/R/U), source, cross[], external, note}
validation_backlog[]
```

The entity registry carries the certification state: `grade` is the evidence grade and `source` is where it was confirmed. Eight of the 14 public entities are grade A with the Act and name confirmed against primary sources; five are grade C (corroborated, primary instrument not opened); the externals (CIDRZ, Liquid, ZCAS University) are recorded with `external: true`.

**Deep links (shipped in v1.2.0).** The app now reads the URL fragment and focuses accordingly: `#entity=<id>` opens the Entity Registry, filters to that body and highlights its row (external bodies flip the Show filter to "all" automatically); `#domain=<n>` opens that domain in the Domains tab; a bare tab id (`#mapping`, `#registry`, `#types`, `#rules`, `#decisions`) opens that tab. `<id>` is the model entity id from `zambia_opmodel.json` (`unza`, `zra`, `odpc`, and so on); `public-body-<id>` and a name slug are also accepted. So the catalog and console can link straight to a body with `../ZambiaGovOperatingModel/index.html#entity=<id>`.

**Still embedded-only for data.** The app embeds its model data; it has no `?data=<file>` loader. If you later want the catalog to launch it against a separate model file, add the viewer-family `?data=` bootstrap (a MINOR bump). Not needed for the Navigator card, the console button, or the deep links above.

## 5. Integration point 4: catalog and Subject Area theme tie-in (optional)

Per the catalog spec (`catalog-reference-master-spec.md`), the MDA Data Catalog themes entries by Subject Area. The operating model is the canonical source of that vocabulary:

- The 14 domains and 95 subject areas are the controlled theme taxonomy the catalog's `theme` field should draw from, so catalog themes and the operating model stay aligned.
- The **Public Body Register** (Domain 1, the registry spine in this model) is a master-data domain in the same sense as Party and Location. The 14 certified public bodies can become catalog entries with `kind: Public body`, each themed by its primary Subject Area and carrying its evidence grade, alongside the reference and master-data entries already specified.

This is a content alignment, not a code change, and it is the catalog owner's call when they next rebuild `_global/catalog.json`.

## 6. Open items (not done, carried forward)

- **Viewer-family JSON emit.** The per-viewer shapes (`model.json`, `catalog.json`, `opmodel.json`) that `json-data-model`, `data-catalog-viewer` and `operating-model-viewer` expect were not generated, because those viewer skills were not in the build session's workspace. `zambia_opmodel.json` is self-describing and `json-data-model` can ingest it generically. Generating the exact per-viewer files is the remaining wiring step and closes the console-wiring thread.
- **No `?data=` loader or hash routing yet** in this app (see point 4).
- **Validation backlog** (in the app and the model JSON): re-verify ministry names against the post-election cabinet gazette; confirm the commencement instrument for the Public Service Pensions Act No. 73 of 2026; open primary instruments to lift the five grade-C entities (MoFNP, Infratel, SMART Zambia, ZAMNET, UNZA) and the unresolved SMART Zambia establishing instrument; reconcile against the Yellow Book, PACRA, the Constitution, and the local-authority and traditional registers before the inventory is certified whole.

## 7. Step checklist for the repo owner

1. Copy `ZambiaGovOperatingModel/` into `data-management-tools` and commit. Confirm the Navigator card appears with v1.0.1.
2. Add an "Operating Model" button to `MDA_Readiness_Assessment/index.html` (and the Reference tab), mirroring the Guide/Methodology buttons, pointing at `../ZambiaGovOperatingModel/index.html`.
3. Decide whether to add the `?data=` loader and `#domain=` / `#entity=` focus handler (MINOR bump) for catalog or console launch. Optional.
4. Align the catalog `theme` vocabulary to the operating model's Subject Areas, and consider adding the 14 public bodies as `kind: Public body` catalog entries. Optional, catalog owner's call.
5. Pick up the viewer-family JSON emit and the validation backlog as separate tasks.

Versioning: bump `ZambiaGovOperatingModel/index.html` by editing only its `<meta name="version">` on any change (PATCH for a fix, MINOR for the `?data=` loader, MAJOR for a redesign). The badge and the Navigator card follow the meta tag.
