# PR: AI Evaluation Control Plane intake + public-shell cleanup

Branch: `task/ai-eval-control-plane-intake` · you review and push (no token entered this session).
Decisions: R1 migrate client data out (both), R2 retire v2.1.0 page, R3 standalone Modelware app.
Private repo: `modelwaresystems-dama/modelware_app_storage` → folder `Business Architecture Spine`.

## Staged in this branch now (safe, additive) ✅
1. **New standalone app** `AI Evaluation Control Plane/index.html` — the generalised Modelware
   AI Evaluation Control Plane (v1.3.0). Sanlam branding + 182 KB of baked Sanlam data removed
   (240 → 66 KB); loads a control-plane workbook via file picker **or** private-repo PAT
   (Contents:Read). Navigator auto-registers it (folder-main `index.html`).
2. **R2 — retire the v2.1.0 Framework** `Business Architecture Spine/AI_Evaluation_Framework.html`
   replaced with a redirect stub (meta-refresh) to the new app, version bumped 2.1.0 → 2.2.0.

## To do in this PR before you merge — the baseline re-point (R1) ⚠️ needs a render check
The public pack's **baseline is Nedbank**: `assets/data.js` defines `window.GENERIC` + `window.PACK_CONFIG`,
`assets/model_all.js` defines `NB_MODEL_SHEETS`. Modelware and AGGPSA are **overlays** on that baseline
(`org_switch.js`). So "public = Modelware only" is not a delete — it is:

- **Promote Modelware to the baseline**: make `modelware_data.js` provide `GENERIC` + `PACK_CONFIG`
  standalone (today it is an `ORG.modelware` overlay), and point the hydrator at `MODELWARE_MODEL_SHEETS`
  by default in `org_switch.js` (`activeOrg = "modelware"`).
- **Remove the Nedbank + AGGPSA client data from public** and move it to the private repo:

  | file | size | move to |
  | --- | --- | --- |
  | `assets/data.js` (Nedbank GENERIC/PACK_CONFIG) | 342 KB | `modelware_app_storage/Business Architecture Spine/nedbank/` |
  | `assets/model_all.js` (NB_MODEL_SHEETS) | 1.78 MB | same |
  | `assets/aggpsa_data.js` | 283 KB | `modelware_app_storage/Business Architecture Spine/aggpsa/` |
  | `assets/aggpsa_model_all.js` | 1.44 MB | same |

- **Drop the `<script src>` lines** for those four files in `index.html` (lines 64–67) and the
  AGGPSA/Nedbank branches in `org_switch.js`.

**Why it is staged, not done blind:** promoting an overlay to a standalone baseline can break the
pack's hydrate/render if `modelware_data.js` does not carry a complete `GENERIC`/`PACK_CONFIG`. I will
make the change and **render-verify** (empty-state + Modelware baseline load) before it goes in the PR,
rather than risk pushing a broken public shell. If `modelware_data.js` is not a complete baseline, the
honest fix is to generate a Modelware baseline from `MODELWARE_MODEL_SHEETS` — I will flag that if so.

## Private repo (`modelware_app_storage`) — what lands there
- The four client-data files above (Nedbank, AGGPSA), under per-org folders.
- The **Sanlam** instance: a Sanlam-branded copy of the Control Plane app + the
  `Sanlam_AI_Eval_ControlPlane_P2.xlsx` workbook it loads (kept entirely private).

## Versioning
Per the repo standard: new app carries `<meta name="version" content="1.3.0">` + on-screen badge;
retired page bumped to 2.2.0. The integrator bumps the global `assets.json`/`index.html` version once
after merge (per the pack NOTES; work stays append-only on shared files).

## How you push
This branch is local to the build session. I will hand you the diff/patch + this summary; you apply it
in your clone of `data-management-tools`, run `build-manifest.mjs`, review, and push the branch + open
the PR. Nothing is pushed from here.
