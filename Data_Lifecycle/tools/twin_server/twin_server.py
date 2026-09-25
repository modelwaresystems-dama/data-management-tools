#!/usr/bin/env python3
"""
twin_server.py v0.2  -  the Digital Twin server: several people on one twin, and shared simulation rooms.

Howard's decisions (Open Decisions register, 24 Sep 2026, section B):
  B1 a  people act on the live twin within the decision rights of their roles, and run what-ifs and scenarios in rooms that never
        touch the live twin;
  B2 a  Howard and up to 10 colleagues or reviewers at a time;
  B3 c  runs on Howard's machine, reachable on his own network only: no tunnel and no HTTPS (so run it only on a network you trust);
  B4 a  invite links: Howard adds a person, the server gives a one-time link, the browser keeps a 30-day session;
  B5 a  Howard assigns roles per organisation, several per person ("a person can play multiple roles"); a request whose decision
        right none of the person's roles in that organisation holds is refused and raises a Low issue naming the person, on the
        live twin and in rooms;
  B6 a  a room is a shared copy of the twin (from the live twin now, or from a scenario file); everyone in it sees every step as it
        happens; its log is kept until it is closed, and can be saved as a new scenario file;
  B7 a  the server is the record: it exports to the private repo's twin/ folder on demand and every night at 02:00;
  B8 a  FastAPI and uvicorn, SQLite with one writer per twin (every request to a twin holds that twin's lock);
  B9 a  the server serves twin_viewer.html, whose server mode reads and writes through this API and updates live.

Also fixed (register "whatever you pick"): export only to the configured folder; errors reply with a short message and are logged
in full; the browser may call this API only from the server's own address (no cross-site access); one engine decides (the Python
engine; the viewer's JavaScript copy only previews).

  pip install fastapi==0.115.0 uvicorn==0.30.6
  python twin_server.py person add --data <data dir> --name "Howard Diesel" --email howard@... --admin --roles "*:ROLE-DGC,ROLE-DO"
  python twin_server.py serve --models <private>/models --data <data dir> --seed-from <private>/twin --export-dir <private>/twin \\
         --scenarios <private>/simulations/scenarios --viewer <public>/twin_viewer.html [--host 0.0.0.0] [--port 8765]

Roles are given per governed scope (modelware, aggpsa, nedbank) or "*" for every scope. In a room made from a scenario file the
scenario's asset belongs to no organisation, so every role the person holds anywhere counts there.
"""
import argparse, asyncio, datetime, hashlib, json, logging, os, secrets, sqlite3, sys, threading, time, traceback

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "fts_designer"))
import fts_twin_engine                                      # noqa: E402
from fts_twin import Twin, ISSUE_MODEL, now_iso             # noqa: E402

VERSION = "0.2"
SESSION_DAYS = 30
INVITE_DAYS = 14
log = logging.getLogger("twin_server")

def sha(x): return hashlib.sha256(x.encode("utf-8")).hexdigest()

# ---------------------------------------------------------------- people, invites and sessions
class People:
    def __init__(self, path):
        self.lock = threading.Lock()
        self.db = sqlite3.connect(path, check_same_thread=False)
        self.db.execute("create table if not exists people (id text primary key, name text, email text, roles text, admin integer, active integer, created text)")
        self.db.execute("create table if not exists invites (hash text primary key, person text, expires text, used integer)")
        self.db.execute("create table if not exists sessions (hash text primary key, person text, expires text)")
        self.db.commit()

    def _row(self, r):
        return {"id": r[0], "name": r[1], "email": r[2], "roles": json.loads(r[3] or "{}"), "admin": bool(r[4]), "active": bool(r[5]), "created": r[6]} if r else None

    def list(self):
        with self.lock: return [self._row(r) for r in self.db.execute("select * from people order by id").fetchall()]

    def get(self, pid):
        with self.lock: return self._row(self.db.execute("select * from people where id=?", (pid,)).fetchone())

    def add(self, name, email, roles, admin=False):
        with self.lock:
            n = self.db.execute("select count(*) from people").fetchone()[0] + 1; pid = f"P-{n:03d}"
            self.db.execute("insert into people values (?,?,?,?,?,?,?)", (pid, name, email, json.dumps(roles), 1 if admin else 0, 1, now_iso())); self.db.commit()
        return self.get(pid)

    def update(self, pid, **kw):
        p = self.get(pid)
        if not p: return None
        p.update({k: v for k, v in kw.items() if v is not None})
        with self.lock:
            self.db.execute("update people set name=?, email=?, roles=?, admin=?, active=? where id=?", (p["name"], p["email"], json.dumps(p["roles"]), 1 if p["admin"] else 0, 1 if p["active"] else 0, pid))
            if not p["active"]: self.db.execute("delete from sessions where person=?", (pid,)); self.db.execute("delete from invites where person=?", (pid,))
            self.db.commit()
        return self.get(pid)

    def invite(self, pid):
        tok = secrets.token_urlsafe(24); exp = (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=INVITE_DAYS)).isoformat()
        with self.lock:
            self.db.execute("delete from invites where person=?", (pid,))
            self.db.execute("insert into invites values (?,?,?,0)", (sha(tok), pid, exp)); self.db.commit()
        return tok

    def redeem(self, tok):
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        with self.lock:
            r = self.db.execute("select person, expires, used from invites where hash=?", (sha(tok),)).fetchone()
            if not r or r[2] or r[1] < now: return None, None
            p = self.db.execute("select active from people where id=?", (r[0],)).fetchone()
            if not p or not p[0]: return None, None
            self.db.execute("update invites set used=1 where hash=?", (sha(tok),))
            st = secrets.token_urlsafe(32); exp = (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=SESSION_DAYS)).isoformat()
            self.db.execute("insert into sessions values (?,?,?)", (sha(st), r[0], exp)); self.db.commit()
        return st, r[0]

    def session(self, st):
        if not st: return None
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        with self.lock: r = self.db.execute("select person, expires from sessions where hash=?", (sha(st),)).fetchone()
        if not r or r[1] < now: return None
        p = self.get(r[0])
        return p if p and p["active"] else None

    def sign_out(self, st):
        with self.lock: self.db.execute("delete from sessions where hash=?", (sha(st),)); self.db.commit()

def parse_roles(text):
    """ 'aggpsa:ROLE-DO,ROLE-BDS; modelware:ROLE-DO; *:ROLE-DGC'  ->  {"aggpsa": [...], "modelware": [...], "*": [...]} """
    out = {}
    for part in (text or "").replace("\n", ";").split(";"):
        if ":" not in part: continue
        scope, roles = part.split(":", 1)
        rs = [r.strip() for r in roles.split(",") if r.strip()]
        if rs: out.setdefault(scope.strip(), []).extend(rs)
    return out

# ---------------------------------------------------------------- the live stream (Server-Sent Events)
class Hub:
    def __init__(self): self.subs = set(); self.loop = None; self.lock = threading.Lock()
    def subscribe(self):
        q = asyncio.Queue(maxsize=200)
        with self.lock: self.subs.add(q)
        return q
    def unsubscribe(self, q):
        with self.lock: self.subs.discard(q)
    def publish(self, msg):
        if not self.loop: return
        with self.lock: subs = list(self.subs)
        for q in subs:
            def put(q=q):
                try: q.put_nowait(msg)
                except asyncio.QueueFull: pass
            self.loop.call_soon_threadsafe(put)

# ---------------------------------------------------------------- a twin space: the live twin or a room
class Space:
    def __init__(self, sid, twin, meta):
        self.id = sid; self.twin = twin; self.meta = meta; self.lock = threading.Lock()

class Server:
    def __init__(self, a):
        self.a = a; os.makedirs(a.data, exist_ok=True); os.makedirs(os.path.join(a.data, "rooms"), exist_ok=True)
        self.people = People(os.path.join(a.data, "people.sqlite"))
        live_db = os.path.join(a.data, "live.sqlite"); fresh = not os.path.exists(live_db)
        self.hub = Hub()
        live = Twin(a.models, live_db)
        if fresh and a.seed_from:
            n = self._import(live, a.seed_from); log.info("seeded the live twin from %s: %s instances", a.seed_from, n)
            live = Twin(a.models, live_db)   # re-open so the scope facts are restored from the instruments just imported
        self.spaces = {"live": Space("live", live, {"id": "live", "name": "Live twin", "kind": "live"})}
        self.rooms_index = os.path.join(a.data, "rooms", "rooms.json")
        for meta in (json.load(open(self.rooms_index, encoding="utf-8")) if os.path.exists(self.rooms_index) else []):
            p = os.path.join(a.data, "rooms", meta["id"] + ".sqlite")
            if os.path.exists(p): self.spaces[meta["id"]] = Space(meta["id"], Twin(a.models, p), meta)

    def _import(self, twin, d):
        db = twin.store.db; db.execute("begin")
        n = 0
        for f, key in (("instances.json", "assets"), ("elements.json", "elements"), ("records.json", "records"), ("issues.json", "issues"), ("instruments.json", "instruments"), ("evidence.json", "evidence"), ("controlsets.json", "controlSets")):
            p = os.path.join(d, f)
            if os.path.exists(p):
                for doc in json.load(open(p, encoding="utf-8")).get(key, []):
                    db.execute("insert or replace into instances (id, kind, doc, updatedAt) values (?,?,?,?)", (doc["id"], doc.get("kind"), json.dumps(doc), doc.get("updatedAt") or now_iso())); n += 1
        p = os.path.join(d, "events.json")
        if os.path.exists(p):
            for rec in json.load(open(p, encoding="utf-8")).get("events", []):
                rec = {k: v for k, v in rec.items() if k != "seq"}
                db.execute("insert into events (at, instanceId, modelId, transitionId, eventId, result, override, actor, reason, doc) values (?,?,?,?,?,?,?,?,?,?)",
                           (rec.get("at"), rec.get("instanceId"), rec.get("model"), rec.get("transition"), rec.get("event"), rec.get("result"), 1 if rec.get("override") else 0, rec.get("actor"), rec.get("reason"), json.dumps(rec)))
        db.commit(); return n

    def save_rooms(self):
        json.dump([s.meta for k, s in self.spaces.items() if k != "live"], open(self.rooms_index, "w", encoding="utf-8"), indent=1)

    def space(self, sid):
        s = self.spaces.get(sid)
        if not s: raise ApiError(404, f"no twin or room {sid}")
        return s

    # ---- who may do what
    def scope_of(self, tw, inst):
        if not inst: return None
        if inst.get("kind") in ("asset", "instrument"): return inst.get("scope")
        par = tw.store.get_instance(inst.get("parentId")) if inst.get("parentId") else None
        return self.scope_of(tw, par)

    def roles_here(self, person, scope):
        r = person.get("roles") or {}
        if scope in (None, "", "scenario") or str(scope).startswith("room-"):
            return sorted({x for v in r.values() for x in v})
        return sorted(set(r.get(scope, [])) | set(r.get("*", [])))

    def act(self, sp, person, body):
        """one request from a person to fire a transition (or raise an event) on one instance of one twin space"""
        tw = sp.twin; iid = body.get("instanceId"); mid = body.get("modelId")
        inst = tw.store.get_instance(iid)
        if not inst: raise ApiError(404, f"no instance {iid}")
        if mid not in tw.fed.models: raise ApiError(400, f"no model {mid}")
        tid = body.get("transition")
        if not tid and body.get("event"):
            if inst.get("kind") != "asset": raise ApiError(400, "an event can be raised on a Data Asset only; name the transition")
            cands = tw.fed.transitions_for_event(inst, mid, body["event"], tw.store.elements())
            if not cands: raise ApiError(400, f"event {body['event']} triggers no transition of {mid}")
            tid = cands[0]
        t = tw.fed.tr[mid].get(tid)
        if not t: raise ApiError(400, f"no transition {tid} in {mid}")
        scope = self.scope_of(tw, inst); mine = self.roles_here(person, scope)
        if not mine: raise ApiError(403, f"you hold no role in {scope or 'this room'}; ask Howard to assign one")
        dr = t.get("decisionRight"); holder = ((tw.fed.dr.get(mid) or {}).get(dr) or {}).get("holder")
        role = holder if holder in mine else (body.get("role") if body.get("role") in mine else mine[0])
        act = body.get("activity") or next((a for a, x in sorted(tw.acts.items()) if x["model"] == mid and tid in x["claims"]), None)
        req = {"activity": act, "role": role, "system": f"twin server: {person['name']} ({person['id']})", "purpose": body.get("purpose")}
        actor = "person:" + person["id"]
        if holder and holder not in mine:
            return tw.refuse_unauthorised(iid, mid, tid, req, {**person, "rolesHere": mine}, dr, holder, scope=scope)
        k = inst.get("kind")
        if k == "asset": return tw.post_event(iid, mid, None, tid, None, actor, None, requester=req)
        if k == "record": return tw.post_record_event(iid, mid, tid, actor=actor, requester=req)
        if k == "instrument": return tw.post_instrument_event(iid, mid, tid, actor=actor, requester=req, reason=body.get("reason"))
        if k == "issue": return tw.post_issue_event(iid, tid, actor=actor, requester=req, reason=body.get("reason"))
        raise ApiError(400, f"cannot act on a {k}")

    # ---- rooms
    def new_room(self, person, name, scenario=None):
        rid = "R-" + datetime.datetime.now().strftime("%m%d-%H%M%S") + "-" + secrets.token_hex(2)
        path = os.path.join(self.a.data, "rooms", rid + ".sqlite")
        live = self.spaces["live"]
        meta = {"id": rid, "name": name or rid, "kind": "room", "owner": person["id"], "ownerName": person["name"], "createdAt": now_iso(), "from": "live"}
        if scenario:
            sp_path = os.path.join(self.a.scenarios, os.path.basename(scenario))
            if not os.path.exists(sp_path): raise ApiError(404, f"no scenario {scenario}")
            sc = json.load(open(sp_path, encoding="utf-8"))
            tw = Twin(self.a.models, path); fed = tw.fed
            scope = "room-" + rid; els = fed.default_elements(scope)
            kv = sc.get("kaVectors") or {}
            for e in els:
                e["scope"] = scope
                st = (kv.get(e["modelId"]) or {}).get(e["regionId"])   # the scenario's state of a shared region lives on the room's element
                if st: e["state"] = st
                tw.store.put_instance(e)
            aid = "SCN-" + str(sc.get("id") or "scenario")
            asset = fed.new_asset(aid, sc.get("name") or aid, facts=sc.get("assetProfile") or {}, refs=fed.default_refs(els))
            asset["scope"] = scope; asset["org"] = "Scenario " + str(sc.get("id"))
            for m, v in (sc.get("kaVectors") or {}).items():
                if m in asset["vectors"]: asset["vectors"][m].update({r: s for r, s in v.items() if r in asset["vectors"][m]})
            tw.store.put_instance(asset)
            meta.update({"from": "scenario", "scenario": os.path.basename(sp_path), "scenarioId": sc.get("id"), "assetId": aid, "script": sc.get("script") or [], "position": 0})
        else:
            with live.lock:
                dst = sqlite3.connect(path); live.twin.store.db.backup(dst); dst.close()
            meta["fromSeq"] = live.twin.store.max_seq()
            tw = Twin(self.a.models, path)
        self.spaces[rid] = Space(rid, tw, meta); self.save_rooms()
        self.hub.publish({"kind": "rooms"}); return meta

    def close_room(self, person, rid):
        sp = self.space(rid)
        if rid == "live": raise ApiError(400, "the live twin cannot be closed")
        if not (person["admin"] or sp.meta.get("owner") == person["id"]): raise ApiError(403, "only the room's owner or an admin closes a room")
        arch = os.path.join(self.a.data, "rooms", "closed"); os.makedirs(arch, exist_ok=True)
        with sp.lock:
            json.dump({"room": sp.meta, "closedAt": now_iso(), "closedBy": person["id"], "events": sp.twin.store.events_since(0, 10 ** 9)}, open(os.path.join(arch, rid + ".json"), "w", encoding="utf-8"), indent=1)
            sp.twin.store.db.close()
        del self.spaces[rid]
        try: os.replace(os.path.join(self.a.data, "rooms", rid + ".sqlite"), os.path.join(arch, rid + ".sqlite"))
        except OSError: pass
        self.save_rooms(); self.hub.publish({"kind": "rooms"}); return {"closed": rid}

    def step_scenario(self, person, rid):
        sp = self.space(rid); m = sp.meta
        if m.get("from") != "scenario": raise ApiError(400, "this room was not made from a scenario")
        if not (person["admin"] or m.get("owner") == person["id"]): raise ApiError(403, "only the room's owner or an admin steps its scenario")
        script = m.get("script") or []; pos = m.get("position", 0)
        if pos >= len(script): return {"done": True, "position": pos, "of": len(script)}
        item = script[pos]; tw = sp.twin
        mid, tid = (item.split(":", 1) if ":" in item else (fts_twin_engine.GLOBAL_ID, item))
        t = tw.fed.tr.get(mid, {}).get(tid) or {}
        holder = ((tw.fed.dr.get(mid) or {}).get(t.get("decisionRight")) or {}).get("holder") or "ROLE-DO"
        act = next((a for a, x in sorted(tw.acts.items()) if x["model"] == mid and tid in x["claims"]), None)
        out = tw.post_event(m["assetId"], mid, None, tid, None, "scenario-runner:" + person["id"], None,
                            requester={"activity": act, "role": holder, "system": f"scenario {m.get('scenarioId')} stepped by {person['name']}", "purpose": f"script step {pos + 1} of {len(script)}"})
        m["position"] = pos + 1; self.save_rooms()
        return {"step": pos + 1, "of": len(script), "item": item, "result": out.get("result") if isinstance(out, dict) else None, "event": out}

    def save_scenario(self, person, rid, name, instance_id=None):
        sp = self.space(rid); tw = sp.twin
        evs = [e for e in tw.store.events_since(0, 10 ** 9) if e.get("transition") and not str(e.get("actor", "")).startswith("twin:")]
        if instance_id: evs = [e for e in evs if e.get("instanceId") == instance_id]
        elif sp.meta.get("assetId"): evs = [e for e in evs if e.get("instanceId") == sp.meta["assetId"]]
        if sp.meta.get("fromSeq"): evs = [e for e in evs if e["seq"] > sp.meta["fromSeq"]]
        script = [(e["transition"] if e.get("model") == fts_twin_engine.GLOBAL_ID else f"{e['model']}:{e['transition']}") for e in evs]
        slug = "".join(ch if ch.isalnum() else "_" for ch in (name or rid)).strip("_").lower() or rid
        sc = {"id": "ROOM-" + rid, "name": name or ("Saved from room " + rid), "subjectType": "Data Asset", "profile": "saved from a twin server room",
              "description": f"Saved by {person['name']} on {now_iso()} from room {sp.meta.get('name')} ({rid}); {len(script)} steps as they were asked for in the room, fired or refused.",
              "assetProfile": {}, "guardOutcomes": {}, "authorizations": {}, "defaultGuardOutcome": True, "kaVectors": {}, "script": script}
        os.makedirs(self.a.scenarios, exist_ok=True); p = os.path.join(self.a.scenarios, f"room_{slug}.sim.json")
        json.dump(sc, open(p, "w", encoding="utf-8"), indent=1)
        return {"file": os.path.basename(p), "steps": len(script)}

    def export(self):
        sp = self.spaces["live"]
        with sp.lock: return sp.twin.export(self.a.export_dir)

class ApiError(Exception):
    def __init__(self, code, msg): self.code = code; self.msg = msg

# ---------------------------------------------------------------- the web app
def make_app(S):
    from fastapi import FastAPI, Request
    from fastapi.responses import JSONResponse, HTMLResponse, FileResponse, RedirectResponse, StreamingResponse, Response
    app = FastAPI(title="Digital Twin server", version=VERSION, docs_url=None, redoc_url=None, openapi_url=None)

    @app.on_event("startup")
    async def _start():
        S.hub.loop = asyncio.get_running_loop()
        threading.Thread(target=nightly, args=(S,), daemon=True).start()

    @app.exception_handler(ApiError)
    async def _api_err(request, ex): return JSONResponse({"error": ex.msg}, status_code=ex.code)

    @app.exception_handler(Exception)
    async def _err(request, ex):
        log.error("error on %s %s\n%s", request.method, request.url.path, traceback.format_exc())
        return JSONResponse({"error": "the server could not complete that; the detail is in its log"}, status_code=500)

    @app.middleware("http")
    async def _same_origin(request, call_next):
        # no cross-site access: a write must come from a page served by this server
        if request.method in ("POST", "PUT", "DELETE"):
            origin = request.headers.get("origin")
            if origin and origin.split("://", 1)[-1] != request.headers.get("host"):
                return JSONResponse({"error": "requests from other sites are not accepted"}, status_code=403)
        resp = await call_next(request)
        resp.headers["Cache-Control"] = "no-store"; resp.headers["X-Content-Type-Options"] = "nosniff"; resp.headers["Referrer-Policy"] = "same-origin"
        return resp

    def who(request, admin=False):
        p = S.people.session(request.cookies.get("twin_session") or request.headers.get("X-Twin-Session"))
        if not p: raise ApiError(401, "sign in with your invite link")
        if admin and not p["admin"]: raise ApiError(403, "this needs an admin")
        return p

    def publish(sid): S.hub.publish({"kind": "events", "space": sid, "seq": S.spaces[sid].twin.store.max_seq()})

    # ---- pages
    @app.get("/")
    def index():
        if not S.a.viewer or not os.path.exists(S.a.viewer): return HTMLResponse("<p>twin_viewer.html is not configured on this server.</p>", 404)
        return FileResponse(S.a.viewer, media_type="text/html")

    @app.get("/invite/{tok}")
    def invite(tok: str):
        st, pid = S.people.redeem(tok)
        if not st: return HTMLResponse("<p>This invite link has been used, has expired, or was revoked. Ask Howard for a new one.</p>", 410)
        r = RedirectResponse("/", status_code=303)
        r.set_cookie("twin_session", st, max_age=SESSION_DAYS * 86400, httponly=True, samesite="strict")
        return r

    @app.post("/api/signout")
    def signout(request: Request):
        st = request.cookies.get("twin_session")
        if st: S.people.sign_out(st)
        r = JSONResponse({"signedOut": True}); r.delete_cookie("twin_session"); return r

    @app.get("/admin")
    def admin_page(request: Request):
        who(request, admin=True); return HTMLResponse(ADMIN_HTML)

    # ---- who and what
    @app.get("/api/whoami")
    def whoami(request: Request):
        p = who(request); return {"person": p, "server": f"twin_server v{VERSION}", "engine": fts_twin_engine.__name__, "couplingsEnforced": fts_twin_engine.ENFORCE_COUPLINGS}

    @app.get("/api/models")
    def models(request: Request):
        who(request); return {"files": sorted(f for f in os.listdir(S.a.models) if f.endswith(".fts.json"))}

    @app.get("/models/{name}")
    def model_file(name: str, request: Request):
        who(request)
        p = os.path.join(S.a.models, os.path.basename(name))
        if not name.endswith(".fts.json") or not os.path.exists(p): raise ApiError(404, "no such model")
        return FileResponse(p, media_type="application/json")

    @app.get("/api/scenarios")
    def scenarios(request: Request):
        who(request); d = S.a.scenarios
        return {"files": sorted(f for f in os.listdir(d) if f.endswith(".sim.json")) if d and os.path.isdir(d) else []}

    @app.get("/api/spaces")
    def spaces(request: Request):
        who(request); return {"spaces": [s.meta | {"seq": s.twin.store.max_seq()} for s in S.spaces.values()]}

    @app.get("/api/{sid}/twin/{name}")
    def twin_file(sid: str, name: str, request: Request):
        who(request); sp = S.space(sid)
        with sp.lock:
            out = sp.twin.store.snapshot(name, sp.twin.fleet() if name == "fleet.json" else None)
        if out is None: raise ApiError(404, "no such twin file")
        return out

    @app.get("/api/{sid}/delta")
    def delta(sid: str, since: int, request: Request):
        who(request); sp = S.space(sid)
        with sp.lock: return {"seq": sp.twin.store.max_seq(), "events": sp.twin.store.events_since(since)}

    @app.post("/api/{sid}/act")
    async def act(sid: str, request: Request):
        p = who(request); body = await request.json(); sp = S.space(sid)
        def run():
            with sp.lock: return S.act(sp, p, body)
        out = await asyncio.get_running_loop().run_in_executor(None, run); publish(sid); return out

    @app.post("/api/{sid}/facts")
    async def facts(sid: str, request: Request):
        p = who(request, admin=True); body = await request.json(); sp = S.space(sid)
        with sp.lock: out = sp.twin.set_facts(body["instanceId"], body.get("facts") or {}, actor="person:" + p["id"])
        publish(sid); return out

    @app.post("/api/{sid}/override")
    async def override(sid: str, request: Request):
        p = who(request, admin=True); body = await request.json(); sp = S.space(sid)
        if not (body.get("reason") or "").strip(): raise ApiError(400, "an override needs a reason")
        with sp.lock: out = sp.twin.override(body["instanceId"], body["modelId"], body["regionId"], body["stateId"], body["reason"], actor="person:" + p["id"])
        publish(sid); return out

    # ---- rooms
    @app.post("/api/rooms")
    async def new_room(request: Request):
        p = who(request); body = await request.json()
        meta = await asyncio.get_running_loop().run_in_executor(None, lambda: S.new_room(p, body.get("name"), body.get("scenario")))
        return meta

    @app.delete("/api/rooms/{rid}")
    def close_room(rid: str, request: Request):
        return S.close_room(who(request), rid)

    @app.post("/api/rooms/{rid}/step")
    def step(rid: str, request: Request):
        p = who(request); sp = S.space(rid)
        with sp.lock: out = S.step_scenario(p, rid)
        publish(rid); return out

    @app.post("/api/rooms/{rid}/save")
    async def save(rid: str, request: Request):
        p = who(request); body = await request.json(); sp = S.space(rid)
        with sp.lock: return S.save_scenario(p, rid, body.get("name"), body.get("instanceId"))

    # ---- admin
    @app.get("/api/people")
    def people(request: Request):
        who(request, admin=True); return {"people": S.people.list(), "roles": sorted(fts_roles(S)), "scopes": sorted({a.get("scope") for a in S.spaces["live"].twin.store.instances("asset") if a.get("scope")})}

    @app.post("/api/people")
    async def add_person(request: Request):
        who(request, admin=True); b = await request.json()
        roles = b.get("roles") if isinstance(b.get("roles"), dict) else parse_roles(b.get("roles") or "")
        bad = [r for v in roles.values() for r in v if r not in fts_roles(S)]
        if bad: raise ApiError(400, "unknown roles: " + ", ".join(bad))
        pr = S.people.add(b.get("name") or "unnamed", b.get("email") or "", roles, bool(b.get("admin")))
        return {"person": pr, "invite": "/invite/" + S.people.invite(pr["id"])}

    @app.post("/api/people/{pid}")
    async def edit_person(pid: str, request: Request):
        who(request, admin=True); b = await request.json()
        roles = None if b.get("roles") is None else (b["roles"] if isinstance(b["roles"], dict) else parse_roles(b["roles"]))
        pr = S.people.update(pid, name=b.get("name"), email=b.get("email"), roles=roles, admin=b.get("admin"), active=b.get("active"))
        if not pr: raise ApiError(404, "no such person")
        return {"person": pr}

    @app.post("/api/people/{pid}/invite")
    def reinvite(pid: str, request: Request):
        who(request, admin=True)
        if not S.people.get(pid): raise ApiError(404, "no such person")
        return {"invite": "/invite/" + S.people.invite(pid)}

    @app.post("/api/export")
    def export(request: Request):
        who(request, admin=True); return S.export()

    # ---- the live stream
    @app.get("/api/stream")
    async def stream(request: Request):
        who(request); q = S.hub.subscribe()
        async def gen():
            try:
                yield "retry: 3000\n\n"
                while True:
                    if await request.is_disconnected(): break
                    try: msg = await asyncio.wait_for(q.get(), timeout=20)
                    except asyncio.TimeoutError: yield ": keep-alive\n\n"; continue
                    yield "data: " + json.dumps(msg) + "\n\n"
            finally: S.hub.unsubscribe(q)
        return StreamingResponse(gen(), media_type="text/event-stream")
    return app

def fts_roles(S):
    return set(S.spaces["live"].twin.roles.keys())

def nightly(S):
    """B7 a: the live twin is exported to the private repo's twin/ folder every night at 02:00 (server time)"""
    last = None
    while True:
        now = datetime.datetime.now()
        if now.hour == 2 and last != now.date():
            try: S.export(); last = now.date(); log.info("nightly export to %s", S.a.export_dir)
            except Exception: log.error("nightly export failed\n%s", traceback.format_exc())
        time.sleep(300)

ADMIN_HTML = """<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Twin server people</title>
<style>body{font:15px/1.5 system-ui,sans-serif;margin:0;padding:16px;background:#f5f7f8;color:#1b2a30}main{max-width:980px;margin:0 auto}h1{font-size:1.3rem}table{border-collapse:collapse;width:100%;font-size:.9rem}
th,td{border-bottom:1px solid #d3dbe0;padding:5px 7px;text-align:left;vertical-align:top}form{background:#fff;border:1px solid #d3dbe0;border-radius:6px;padding:12px;margin:12px 0;display:grid;gap:8px}
input,textarea{font:inherit;padding:5px 7px;border:1px solid #b9c5cc;border-radius:4px}button{font:inherit;padding:5px 12px;border-radius:4px;border:1px solid #0f6b6e;background:#0f6b6e;color:#fff;cursor:pointer}
.link{font-family:ui-monospace,monospace;background:#e3f1f0;padding:6px 8px;border-radius:4px;word-break:break-all}.dim{color:#5f6f78;font-size:.85rem}.tscroll{overflow-x:auto}
@media (prefers-color-scheme:dark){body{background:#14191c;color:#e6ebee}form{background:#1d2428;border-color:#334046}th,td{border-color:#334046}input,textarea{background:#14191c;color:#e6ebee;border-color:#445}.link{background:#1f3a39}}</style></head>
<body><main><h1>People on this twin server</h1><p class="dim">Add a person with their roles per organisation (several each). The server shows a one-time invite link; send it to them. It works once, for 14 days, and signs them in for 30 days. Roles: one line per organisation, for example <code>aggpsa: ROLE-DO, ROLE-BDS</code>; <code>*</code> means every organisation.</p>
<form id="add"><label>Name <input id="n" required></label><label>Email <input id="e" type="email"></label><label>Roles<br><textarea id="r" rows="3" placeholder="aggpsa: ROLE-DO, ROLE-BDS&#10;modelware: ROLE-DO"></textarea></label><label><input type="checkbox" id="a"> admin (manages people and exports)</label><button>Add and make an invite link</button><div id="out"></div></form>
<div class="tscroll"><table><thead><tr><th>Id</th><th>Name</th><th>Roles</th><th>Admin</th><th>Active</th><th></th></tr></thead><tbody id="list"></tbody></table></div>
<p class="dim" id="hint"></p><p><a href="/">Back to the twin</a></p></main>
<script>
const $=s=>document.querySelector(s); const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
async function api(u,o){ const r=await fetch(u,Object.assign({headers:{"Content-Type":"application/json"}},o||{})); const j=await r.json(); if(!r.ok) throw new Error(j.error||r.status); return j; }
function linkHtml(p){ const url=location.origin+p; return '<div class="link">'+esc(url)+'</div><div class="dim">Copy this link and send it; it is shown once.</div>'; }
async function load(){ const d=await api("/api/people"); $("#hint").textContent="Organisations: "+d.scopes.join(", ")+". Roles known: "+d.roles.length+".";
  $("#list").innerHTML=d.people.map(p=>'<tr><td>'+esc(p.id)+'</td><td>'+esc(p.name)+'<div class="dim">'+esc(p.email||"")+'</div></td><td>'+Object.entries(p.roles).map(([s,r])=>'<b>'+esc(s)+'</b>: '+esc(r.join(", "))).join("<br>")+'</td><td>'+(p.admin?"yes":"")+'</td><td>'+(p.active?"yes":"no")+'</td><td><button data-inv="'+esc(p.id)+'">New invite link</button> <button data-off="'+esc(p.id)+'" data-act="'+(p.active?0:1)+'">'+(p.active?"Revoke":"Restore")+'</button><div id="l-'+esc(p.id)+'"></div></td></tr>').join("");
  document.querySelectorAll("[data-inv]").forEach(b=>b.onclick=async()=>{ const j=await api("/api/people/"+b.dataset.inv+"/invite",{method:"POST"}); document.getElementById("l-"+b.dataset.inv).innerHTML=linkHtml(j.invite); });
  document.querySelectorAll("[data-off]").forEach(b=>b.onclick=async()=>{ await api("/api/people/"+b.dataset.off,{method:"POST",body:JSON.stringify({active:b.dataset.act==="1"})}); load(); }); }
$("#add").onsubmit=async ev=>{ ev.preventDefault(); try{ const j=await api("/api/people",{method:"POST",body:JSON.stringify({name:$("#n").value,email:$("#e").value,roles:$("#r").value,admin:$("#a").checked})}); $("#out").innerHTML="Added "+esc(j.person.name)+" as "+esc(j.person.id)+"."+linkHtml(j.invite); load(); }catch(e){ $("#out").textContent=e.message; } };
load().catch(e=>{ $("#hint").textContent=e.message; });
</script></body></html>"""

def main():
    ap = argparse.ArgumentParser(description="the Digital Twin server"); sub = ap.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("serve"); s.add_argument("--models", required=True); s.add_argument("--data", required=True); s.add_argument("--export-dir", required=True)
    s.add_argument("--seed-from"); s.add_argument("--scenarios", default=""); s.add_argument("--viewer", default=""); s.add_argument("--host", default="0.0.0.0"); s.add_argument("--port", type=int, default=8765)
    pa = sub.add_parser("person"); ps = pa.add_subparsers(dest="pcmd", required=True)
    add = ps.add_parser("add"); add.add_argument("--data", required=True); add.add_argument("--name", required=True); add.add_argument("--email", default=""); add.add_argument("--roles", default=""); add.add_argument("--admin", action="store_true")
    inv = ps.add_parser("invite"); inv.add_argument("--data", required=True); inv.add_argument("--id", required=True)
    lst = ps.add_parser("list"); lst.add_argument("--data", required=True)
    a = ap.parse_args()
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    if a.cmd == "person":
        os.makedirs(a.data, exist_ok=True); P = People(os.path.join(a.data, "people.sqlite"))
        if a.pcmd == "add":
            p = P.add(a.name, a.email, parse_roles(a.roles), a.admin); print(json.dumps(p, indent=1)); print("invite link path:", "/invite/" + P.invite(p["id"]))
        elif a.pcmd == "invite": print("invite link path:", "/invite/" + P.invite(a.id))
        else: print(json.dumps(P.list(), indent=1))
        return
    import uvicorn
    S = Server(a); app = make_app(S)
    print(f"twin_server v{VERSION}: live twin with {S.spaces['live'].twin.store.count('asset')} assets, {len(S.spaces) - 1} rooms; couplings enforced: {fts_twin_engine.ENFORCE_COUPLINGS}")
    print(f"open http://<this machine's address on your network>:{a.port}/ with an invite link; people are managed at /admin")
    uvicorn.run(app, host=a.host, port=a.port, log_level="warning")

if __name__ == "__main__":
    main()
