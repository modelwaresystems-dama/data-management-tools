# 5W1H Metadata Viewer (public HTML)

`index.html` is the Data Catalog launcher. Each dataset row launches a viewer
(`model.html` / `quality.html` / `dictionary.html`) pointed at a per-dataset JSON held in the
PRIVATE repo, fetched with the console's GitHub token (localStorage `mdaReadiness.ghpat`).

Set that token once (open the MDA console and Save & connect, same browser/origin), then open
index.html. Serve this folder over http (GitHub Pages or a local server); opening by double-click
blocks the fetch.
