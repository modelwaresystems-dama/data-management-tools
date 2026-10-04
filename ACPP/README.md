# data-management-tools / ACPP — public app

The public, GitHub-Pages-served front end for the Author-Controlled Proposition-to-Prose pipeline.
It carries the repo versioning standard (`<meta name="version">` + on-screen badge) so the Modelware
Asset Navigator picks it up automatically from this folder's `index.html`.

- **Phase 0 (now):** a static pipeline board showing the eight gates and the pilot (1.2) state.
- **Phase 4:** this becomes the live SPA — it reads/writes the private registers in
  `modelware_app_storage/ACPP` via a fine-grained PAT held only in `sessionStorage`, and runs each
  gate through the `decision-register`.

No data lives here. Nothing Microsoft, no relational DB. Version starts at `1.0.0`.
