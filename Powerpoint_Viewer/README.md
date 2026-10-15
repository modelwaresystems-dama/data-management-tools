# Modelware PowerPoint Asset Viewer

A GitHub-hosted PowerPoint **content add-in** that embeds your live, interactive
Modelware HTML assets directly onto slides — plus a shareable **asset hub** so the
same assets open in any browser without the add-in.

Built from your reviewed spec on 2026-10-15. The decisions baked in:

| Decision | Choice |
|---|---|
| Who opens the decks | **Both** — live demos *and* shareable decks |
| Vehicle | **Hybrid** — add-in for live demos + video fallback for handouts |
| Multi-asset storage | **Numbered add-in family** (Asset 1–8), each remembers its own asset |
| Asset source | **Live URL** only, assets on GitHub Pages |
| Distribution | **M365 Admin** centralized (with sideload fallback) |
| Hosting | **GitHub Pages** |

---

## Why "numbered add-ins" and not one clever add-in

PowerPoint keys a content add-in's saved settings to the **add-in's manifest Id**,
and that bag is **shared by every copy of that add-in in the document** (there is an
open Office.js bug confirming the cross-instance behaviour, and no per-instance
identifier exists). So a single add-in dropped on five slides would have all five
fight over one storage slot — which is the bug in the original Gemini draft.

The fix that actually survives save/close/reopen with **zero fiddling mid-presentation**
is to ship a small family of add-ins — *Modelware Asset 1* … *Asset 8* — each with its
own manifest Id, hence its own independent settings bag. Use each numbered slot **once
per deck** and every slide keeps its own asset for good.

> Up to 8 distinct live assets per deck. Need more? Add more GUIDs in
> `tools/generate-manifests.mjs` and re-run it.

---

## Repo structure

```
modelware-ppt-viewer/
├─ docs/                     ← GitHub Pages serves this folder
│  ├─ index.html             ← the add-in viewer shell (one file, all slots use it)
│  ├─ assets/                ← icons (MW)
│  └─ hub/
│     ├─ index.html          ← your Asset Hub (edit the ASSETS list here)
│     └─ a/sample-asset.html ← a working example asset — replace with yours
├─ manifests/                ← asset-1.xml … asset-8.xml (install these)
└─ tools/
   ├─ generate-manifests.mjs ← regenerates manifests from your BASE_URL + GUIDs
   └─ (run with: node tools/generate-manifests.mjs)
```

---

## Setup (once)

### 1. Commit inside data-management-tools and turn on Pages
The code lives at `Powerpoint_Viewer/` inside your existing
`modelwaresystems-dama/data-management-tools` repo. From the repo root:
```bash
git add Powerpoint_Viewer
git commit -m "Add Modelware PowerPoint asset viewer"
git push
```
Then in that repo: **Settings → Pages → Build and deployment → Deploy from a branch**,
branch `main`, folder **`/ (root)`** — *not* `/docs`. Pages serves the whole repo and
the viewer sits in a subfolder, so root is correct. After ~60s the viewer is live at:
```
https://modelwaresystems-dama.github.io/data-management-tools/Powerpoint_Viewer/docs/
```

### 2. Manifests are already pointed at your live site — nothing to change
`tools/generate-manifests.mjs` is pre-set to that exact URL and the 8 manifests in
`manifests/` already match it. Only re-run `node tools/generate-manifests.mjs` if you
later move this folder or rename the repo. (The GUIDs are stable — don't change them, or
that slot forgets its saved asset.)

### 3. Install the add-ins — M365 Admin Center (your choice)
For each of the 8 files in `manifests/`:
1. **admin.microsoft.com → Settings → Integrated apps → Add-ins → Deploy Add-in**
2. **Upload custom apps → Upload manifest file (.xml) from device**
3. Pick the file, choose who gets it (you, or you + Veronica, or everyone), **Deploy**.

They then appear in PowerPoint under **Home → Add-ins → Admin Managed**.
(First rollout can take a few minutes to ~24h to propagate.)

<details>
<summary>No tenant admin? Sideload fallback</summary>

**Windows:** put the `manifests/` folder on a network share, then PowerPoint →
**File → Options → Trust Center → Trust Center Settings → Trusted Add-in Catalogs**,
add the share path, tick **Show in Menu**, restart. Insert from
**Home → Add-ins → More Add-ins → Shared Folder**.

**Mac:** copy the `.xml` files into
`~/Library/Containers/com.microsoft.Powerpoint/Data/Documents/wef` (create `wef` if
missing), restart PowerPoint.
</details>

---

## Daily use

1. **Add an asset to the hub** (optional but recommended): drop its HTML under
   `docs/hub/a/`, add an entry to the `ASSETS` list in `docs/hub/index.html`, commit.
2. On a slide: **Home → Add-ins → Modelware Asset 1** (use a different number on each
   slide). Resize the box like a Power BI report.
3. In the add-in, paste the asset's URL (copy it from your hub page) and
   **Load into this slot**. Optionally add a fallback image URL.
4. Present. In full-screen Slide Show the live asset is interactive; the edit chrome
   hides itself.

> **Presenter View note:** interactivity is reliable in full-screen Slide Show on your
> main display. In *Presenter View* specifically, click/keyboard handling is a
> long-standing Microsoft gap — present the live asset on the main screen.

---

## Sharing a deck with someone who doesn't have the add-in (the hybrid part)

A content add-in only renders for people who have it installed. So for decks you email
or hand out, give external viewers something they *can* see:

**Option A — send the hub link.** The hub and every asset under `docs/hub/` are plain
web pages. Anyone with the link opens them live, no install. Great for "here's the
interactive version" follow-ups.

**Option B — bake a video fallback into the slide.** For a self-contained handout:
1. Open the live asset in a browser, screen-record a short interaction (Windows:
   `Win+Alt+R`; Mac: `Shift+Cmd+5`) → save an MP4.
2. In PowerPoint: **Insert → Video → This Device**, place it on (or beside) the
   add-in box.
3. You present the live add-in; recipients without it see the recorded MP4 play.

---

## Known limits (so nothing surprises you)

- **8 distinct assets per deck** by default; reuse a slot number only once per deck
  (two copies of the same numbered add-in in one file would share a slot).
- **Don't duplicate a slide that has an add-in on it** — the copy inherits the same
  manifest Id and shares the original's slot. Insert a fresh numbered add-in instead.
- **Raw-HTML embedding was dropped** on purpose (your "Live URL only" choice): it hits
  PowerPoint's settings size cap. Host the asset and point at it.
- **Only your own hosted assets embed cleanly.** Arbitrary third-party sites (Google,
  etc.) block framing via `X-Frame-Options`; GitHub Pages doesn't set that header, so
  your own assets are fine.

---

## Verify locally before installing

The viewer shell works in a browser for a quick sanity check (Office features no-op
outside PowerPoint):
```bash
cd docs
python3 -m http.server 8080
# open http://localhost:8080/index.html?slot=1&label=Asset%201
# open http://localhost:8080/hub/
```
For real add-in testing you need HTTPS, which GitHub Pages gives you for free once
Pages is on — so test there rather than wrestling local certs.
