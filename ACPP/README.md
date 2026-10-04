# data-management-tools / ACPP — public app

The public, GitHub-Pages-served front end for the Author-Controlled Proposition-to-Prose pipeline.
**One pipeline, many projects** — a project selector drives the board. Carries the repo versioning
standard (`<meta name="version">` + on-screen badge) so the Modelware Asset Navigator picks it up from
this folder's `index.html`.

- **Phase 0 (now):** a version-badged board (`v1.1.0`) with a working project selector running on a
  bundled seed that mirrors `projects.json`.
- **Phase 4:** the live SPA — reads `projects.json` and the partitioned registers from the private
  repo `modelware_app_storage/ACPP` via a fine-grained PAT held only in `sessionStorage`, and runs each
  gate through the `decision-register`.

No data lives here. Nothing Microsoft, no relational DB.
