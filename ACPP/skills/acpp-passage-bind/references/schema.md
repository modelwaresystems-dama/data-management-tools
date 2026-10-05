# Passage-bind — the fields it writes

## evidence_links row (private repo `database/evidence_links*.json`)

A link that this skill completes carries:

| field            | meaning                                                              | who sets it |
|------------------|----------------------------------------------------------------------|-------------|
| `project_id`     | e.g. `dmbok-v3-ch1`                                                   | gate        |
| `link_id`        | `EL-nnnn`                                                            | gate        |
| `p_id`           | the proposition the link evidences (`P-01.01-01`)                    | gate        |
| `src_id`         | the accepted source (`DAMA-DMBOK2-DEF`, `CARLSON-ANDERSON-2007`)      | **Howard**  |
| `support_strength` | how it supports (`qualifies` / `proves` …)                         | Howard      |
| **`passage`**    | **the verbatim sentence/paragraph** — what this skill fills          | **Howard confirms; skill proposes** |
| **`locator`**    | where it is (`p.12`, `"Abstract"`, `"Governance" ¶3`)                | skill proposes, Howard confirms |
| **`passage_status`** | `present` once a confirmed passage + locator exist, else `pending` | skill |
| `human_approved` | author approval — **never set by any skill**                         | Howard only |
| `status`         | `Supported` / `NEEDS-SOURCE`                                         | gate        |

This skill only ever writes `passage`, `locator`, `passage_status` — and only on rows Howard
confirmed. Everything else is left exactly as the evidence gate set it.

## Board ↔ register field names

The in-app G4 review (ACPP board) already separates the three ideas; the names map one-to-one:

| board (app)        | register / Source Manager | meaning                         |
|--------------------|---------------------------|---------------------------------|
| `quote`            | `passage`                 | the verbatim evidence text      |
| `locator`          | `locator`                 | page / heading / paragraph      |
| `supports`         | interpretation note       | one-line "why it supports"      |

So "clean three-field split" is already the live shape — this skill fills `quote`/`passage` and
`locator` where they are empty; it does not rename or migrate the existing interpretation text.

## Source Manager (`sources.json`, schema `acpp.sources/1`)

Each `links[]` entry has `source_id`, `proposition_id`, `section`, `passage`, `locator`,
`support_strength`, `reuse`, `note`. Mirror the confirmed `passage` + `locator` here for the
matching `source_id`/`proposition_id` so the argument-aware reference manager and the pipeline
board agree. Do not merge or re-point committed links — update in place.
