# Digital Twin server (v0.1, 24 Sep 2026)

Several people on one twin, and shared simulation rooms. Built from Howard's answers in the Open Decisions register of 24 September 2026 (section B):

| Card | Decision |
| --- | --- |
| B1 | People act on the live twin within the decision rights of their roles, and run what-ifs and scenarios in rooms that never touch the live twin. |
| B2 | Howard and up to 10 colleagues or reviewers at a time. |
| B3 | Runs on Howard's machine, reachable on his own network only. There is no tunnel and no HTTPS, so run it only on a network you trust (home or office, not a public Wi-Fi). |
| B4 | Invite links. Howard adds a person; the server gives a one-time link (valid 14 days) that signs them in for 30 days. |
| B5 | Howard assigns roles per organisation, several per person. A request whose decision right none of the person's roles in that organisation holds is refused and raises a Low issue naming the person, on the live twin and in rooms. |
| B6 | A room is a shared copy of the twin: a copy of the live twin now, or a fresh twin set up from a scenario file. Everyone sees every step as it happens. A room's log is kept until it is closed (then archived under `rooms/closed`), and can be saved as a new scenario file. |
| B7 | The server is the record. It exports to the private repo's `twin/` folder on demand (the Export button, admins only) and every night at 02:00. Commit and push the export as you do now. |
| B8 | FastAPI and uvicorn, SQLite with one writer per twin: every request to a twin holds that twin's lock, so no two changes can overwrite each other. |
| B9 | The server serves `twin_viewer.html`. Opened from the server, the viewer reads the live twin or a room, updates as others act, and has a "Send to" button beside Run scenario on the Dashboard. |

## Install once

```
python -m pip install fastapi==0.115.0 uvicorn==0.30.6
```

## Add yourself, then the others

Keep the server's data folder outside both repositories: it holds the working database, the people list and the session hashes. For example `C:\Users\HowardDiesel\twin_server_data`.

```
cd C:\Users\HowardDiesel\Documents\GitHub\data-management-tools\Data_Lifecycle\tools\twin_server
python twin_server.py person add --data C:\Users\HowardDiesel\twin_server_data --name "Howard Diesel" --email howard@modelwaresystems.com --admin --roles "*:ROLE-DGC,ROLE-DO"
```

It prints an invite link path such as `/invite/AbC...`. Once the server runs, open `http://<your machine's address>:8765/invite/AbC...` in your browser. Add everyone else from the People page (`/admin`) in the browser: name, email, and roles one line per organisation, for example

```
aggpsa: ROLE-DO, ROLE-BDS
modelware: ROLE-DO
```

`*` means every organisation. In a room made from a scenario file the scenario's asset belongs to no organisation, so every role the person holds anywhere counts there.

## Run

```
set P=C:\Users\HowardDiesel\Documents\GitHub\modelware_app_storage\Data Lifecycle
python twin_server.py serve --models "%P%\models" --data C:\Users\HowardDiesel\twin_server_data --seed-from "%P%\twin" --export-dir "%P%\twin" --scenarios "%P%\simulations\scenarios" --viewer ..\..\twin_viewer.html
```

The first start copies the twin export into the server's database (`--seed-from`); after that the server's database is the record. Windows will ask whether to let Python accept connections on private networks: allow it, private only. People on your network open `http://<your machine's address>:8765/` (find the address with `ipconfig`, IPv4 Address).

## What the server enforces

* Sign-in on every request; writes only from pages the server itself served.
* Decision rights: the server finds the transition's decision right and its holder; if none of the person's roles in the asset's organisation is the holder, the request is refused before any guard is evaluated and a Low issue names the person (`source.kind: authorisation`).
* The engine: the same `fts_twin_engine.py` as the fleet, with the Knowledge Area couplings enforced (`ENFORCE_COUPLINGS`, on since 24 Sep 2026; `FTS_ENFORCE_COUPLINGS=0` turns it off for a run). The viewer's JavaScript copy only previews; the server's answer is the one recorded.
* Facts and overrides: admins only; an override needs a reason.

## API (for the viewer and for adapters)

`GET /api/whoami`, `/api/models`, `/models/<file>`, `/api/scenarios`, `/api/spaces`, `/api/<space>/twin/<file>.json` (the export files, same shape as the repo copy), `/api/<space>/delta?since=<seq>`, `/api/stream` (Server-Sent Events). `POST /api/<space>/act` `{instanceId, modelId, transition | event, purpose}` for a person's request on an asset, record, instrument version or issue; `/api/<space>/facts`, `/api/<space>/override` (admins); `POST /api/rooms` `{name, scenario}`, `DELETE /api/rooms/<id>`, `POST /api/rooms/<id>/step`, `POST /api/rooms/<id>/save` `{name}`; `GET/POST /api/people`, `POST /api/people/<id>`, `POST /api/people/<id>/invite`, `POST /api/export` (admins). `<space>` is `live` or a room id.

Tested 24 Sep 2026 with two people signed in at once (an admin holding the Data Owner and Council roles everywhere, and a Business Data Steward in AGGPSA only): the Data Owner's Supersede Asset fired and reached the steward's open viewer through the stream within seconds; the steward's Suspend Access on the same asset was refused for want of the decision right and raised a Low issue naming him; a room made from the AGGPSA scenario was stepped from the viewer; invite links work once; the People page refuses a non-admin; a write from another site is refused.
