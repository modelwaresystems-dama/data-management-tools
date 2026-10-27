# 5W1H Metadata Viewer (public HTML)

`index.html` is the Data Catalog launcher. Each dataset row launches a viewer
(`model.html` / `quality.html` / `dictionary.html` / `lineage.html` /
`provenance.html` / `glossary.html`) pointed at a JSON file held in the PRIVATE
repo `modelwaresystems-dama/modelware_app_storage` under `5W1H_Metadata_Viewer/`.

The viewers fetch that private JSON with your GitHub token, read from the browser
key `mdaReadiness.ghpat` (the same key the MDA console uses).

To make them work:
1. Serve this folder over http on the SAME site as the MDA console (GitHub Pages).
2. Open the MDA console, click the GitHub button, and save a token that can read
   the private repo (classic token with `repo` scope, or a fine-grained token with
   Contents: read on that repo).
3. Open `index.html` from the Pages URL and reload.

Opening these by double-click (file://) will not work: the browser does not share
the saved token with a local file, and you will see a "no token" banner.

The DM Artefact Metamodel (5W1H) is the property of Modelware Systems.
