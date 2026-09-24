#!/usr/bin/env python3
"""
fts_twin_store.py  -  the digital twin's instance store and event log (SQLite working store, JSON export as the record).

Howard's decisions (twin register, 22 Sep 2026): a local service with SQLite as the working store and a JSON export of the
instances and the event log into the private repo's twin/ folder so the repo remains the record; every state change is an
event evaluated by the engine (fired or refused) or an override asserted by a steward with a reason, both logged.

  store = TwinStore("twin.sqlite")
  store.put_instance(asset); store.put_instance(element)
  store.log_event({...verdict..., "instanceId": ..., "at": ..., "actor": ...})
  store.export("twin/")     # instances.json, elements.json, events.json, fleet.json
"""
import json, os, sqlite3, datetime

def now_iso(): return datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=2))).isoformat(timespec="seconds")

class TwinStore:
    def __init__(self, path):
        self.path = path
        self.db = sqlite3.connect(path, check_same_thread=False)
        self.db.execute("create table if not exists instances (id text primary key, kind text, doc text, updatedAt text)")
        self.db.execute("create table if not exists events (seq integer primary key autoincrement, at text, instanceId text, modelId text, transitionId text, eventId text, result text, override integer, actor text, reason text, doc text)")
        self.db.execute("create index if not exists ev_inst on events(instanceId, seq)")
        self.db.commit()

    # ---------------------------------------------------------------- instances
    def put_instance(self, doc):
        self.db.execute("insert or replace into instances (id, kind, doc, updatedAt) values (?,?,?,?)", (doc["id"], doc.get("kind"), json.dumps(doc), doc.get("updatedAt") or now_iso()))
        self.db.commit()

    def get_instance(self, iid):
        r = self.db.execute("select doc from instances where id=?", (iid,)).fetchone()
        return json.loads(r[0]) if r else None

    def instances(self, kind=None):
        q = "select doc from instances" + (" where kind=?" if kind else "") + " order by id"
        return [json.loads(r[0]) for r in self.db.execute(q, (kind,) if kind else ()).fetchall()]

    def elements(self):
        return {e["id"]: e for e in self.instances("element")}

    def count(self, kind=None):
        q = "select count(*) from instances" + (" where kind=?" if kind else "")
        return self.db.execute(q, (kind,) if kind else ()).fetchone()[0]

    # ---------------------------------------------------------------- events
    def log_event(self, rec):
        rec = dict(rec); rec.setdefault("at", now_iso())
        cur = self.db.execute("insert into events (at, instanceId, modelId, transitionId, eventId, result, override, actor, reason, doc) values (?,?,?,?,?,?,?,?,?,?)",
                              (rec["at"], rec.get("instanceId"), rec.get("model"), rec.get("transition"), rec.get("event"), rec.get("result"), 1 if rec.get("override") else 0, rec.get("actor"), rec.get("reason"), json.dumps(rec)))
        self.db.commit(); rec["seq"] = cur.lastrowid
        return rec

    def timeline(self, iid, limit=500):
        return [json.loads(r[0]) | {"seq": r[1]} for r in self.db.execute("select doc, seq from events where instanceId=? order by seq desc limit ?", (iid, limit)).fetchall()][::-1]

    def recent(self, limit=200):
        return [json.loads(r[0]) | {"seq": r[1]} for r in self.db.execute("select doc, seq from events order by seq desc limit ?", (limit,)).fetchall()]

    def event_stats(self):
        rows = self.db.execute("select instanceId, sum(case when result='fired' then 1 else 0 end), sum(case when result like 'blocked%' then 1 else 0 end), sum(override), max(at), max(seq), sum(case when result like 'rejected%' then 1 else 0 end) from events group by instanceId").fetchall()
        return {r[0]: {"fired": r[1] or 0, "refused": r[2] or 0, "overrides": r[3] or 0, "lastAt": r[4], "lastSeq": r[5], "rejected": r[6] or 0} for r in rows}

    def last_event(self, iid):
        r = self.db.execute("select doc from events where instanceId=? order by seq desc limit 1", (iid,)).fetchone()
        return json.loads(r[0]) if r else None

    # ---------------------------------------------------------------- export and import (the repo copy)
    def export(self, out_dir, fleet=None):
        os.makedirs(out_dir, exist_ok=True); stamp = now_iso()
        assets = self.instances("asset"); elements = self.instances("element")
        events = [json.loads(r[0]) | {"seq": r[1]} for r in self.db.execute("select doc, seq from events order by seq").fetchall()]
        json.dump({"exportedAt": stamp, "count": len(assets), "assets": assets}, open(os.path.join(out_dir, "instances.json"), "w", encoding="utf-8"), indent=1)
        json.dump({"exportedAt": stamp, "count": len(elements), "elements": elements}, open(os.path.join(out_dir, "elements.json"), "w", encoding="utf-8"), indent=1)
        records = self.instances("record")
        json.dump({"exportedAt": stamp, "count": len(records), "records": records}, open(os.path.join(out_dir, "records.json"), "w", encoding="utf-8"), indent=1)
        issues = self.instances("issue")
        json.dump({"exportedAt": stamp, "count": len(issues), "issues": issues}, open(os.path.join(out_dir, "issues.json"), "w", encoding="utf-8"), indent=1)
        instruments = self.instances("instrument")
        json.dump({"exportedAt": stamp, "count": len(instruments), "instruments": instruments}, open(os.path.join(out_dir, "instruments.json"), "w", encoding="utf-8"), indent=1)
        json.dump({"exportedAt": stamp, "count": len(events), "events": events}, open(os.path.join(out_dir, "events.json"), "w", encoding="utf-8"), indent=1)
        if fleet is not None: json.dump({"exportedAt": stamp, **fleet}, open(os.path.join(out_dir, "fleet.json"), "w", encoding="utf-8"), indent=1)
        return {"assets": len(assets), "records": len(records), "issues": len(issues), "instruments": len(instruments), "elements": len(elements), "events": len(events), "dir": out_dir}

    def import_dir(self, in_dir):
        n = 0
        for f, key in (("instances.json", "assets"), ("elements.json", "elements"), ("records.json", "records"), ("issues.json", "issues"), ("instruments.json", "instruments")):
            p = os.path.join(in_dir, f)
            if os.path.exists(p):
                for doc in json.load(open(p, encoding="utf-8")).get(key, []): self.put_instance(doc); n += 1
        p = os.path.join(in_dir, "events.json")
        if os.path.exists(p) and self.db.execute("select count(*) from events").fetchone()[0] == 0:
            for rec in json.load(open(p, encoding="utf-8")).get("events", []): self.log_event({k: v for k, v in rec.items() if k != "seq"})
        return n
