/* wb_hier_test.js — the taxonomy hierarchy is built from the curated Hypernym column ONLY.
 * Spec (workbench-isa-fix.md): parent = Hypernym; blank Hypernym = root/orphan (NO SPO or
 * definition fallback); Retired and Deprecated terms are excluded. Guards the v4.79 fix. */
const { loadApp, Runner } = require('./wb_common.js');

const app = loadApp();
const { isaEdgesFor, analyzeCorpus } = app.wb;
const r = Runner('wb_hier_test');
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const glossary = {
  id: 'g', name: 'test',
  spo: [
    // Knowledge Area has a correct Hypernym AND a competing skip-level is-a SPO:
    { Term: 'Knowledge Area', Subject: 'Knowledge Area', Predicate: 'is a', Object: 'Data Management Discipline' },
    // A blank-Hypernym term with an is-a SPO — must NOT be re-parented (blank = root/orphan):
    { Term: 'Orphan With SPO', Subject: 'Orphan With SPO', Predicate: 'is a', Object: 'Abstract Thing' },
  ],
  terms: [
    { Term: 'Knowledge Area', 'Term Type': 'Entity', Hypernym: 'Data Management Subdiscipline', Lifecycle: 'Approved' },
    { Term: 'Data Management Subdiscipline', 'Term Type': 'Entity', Hypernym: 'Data Management Discipline', Lifecycle: 'Approved' },
    { Term: 'Data Management Discipline', 'Term Type': 'Entity', Hypernym: '', Lifecycle: 'Approved' },
    { Term: 'Orphan With SPO', 'Term Type': 'Entity', Hypernym: '', Lifecycle: 'Approved' },
    { Term: 'Dep Term', 'Term Type': 'Entity', Hypernym: 'Data Management Discipline', Lifecycle: 'Deprecated' },
    { Term: 'Ret Term', 'Term Type': 'Entity', Hypernym: 'Data Management Discipline', Lifecycle: 'Retired' },
  ],
};

const { parents } = isaEdgesFor(glossary);
const parOf = (t) => (parents[norm(t)] || []).slice();

// 1-2. Hypernym is the single parent; the skip-level SPO is ignored.
r.eq(parOf('Knowledge Area'), ['Data Management Subdiscipline'], 'Knowledge Area parent = Hypernym (Data Management Subdiscipline)');
r.ok(!parOf('Knowledge Area').some((p) => norm(p) === norm('Data Management Discipline')), 'skip-level SPO parent (Discipline) is NOT in the tree');

// 3-4. chain + roots
r.eq(parOf('Data Management Subdiscipline'), ['Data Management Discipline'], 'Subdiscipline parent = Discipline');
r.eq(parOf('Data Management Discipline'), [], 'Discipline (blank Hypernym) is a root');

// 5. blank Hypernym + is-a SPO -> still NO parent (no fallback). This is the v4.79 correction.
r.eq(parOf('Orphan With SPO'), [], 'blank-Hypernym term is NOT re-parented via its is-a SPO');

// 6-7. Retired / Deprecated excluded from the tree
r.eq(parOf('Dep Term'), [], 'Deprecated term excluded from the is-a tree');
r.eq(parOf('Ret Term'), [], 'Retired term excluded from the is-a tree');

// 8-10. the site/in-app hierarchy (analyzeCorpus().isa) follows the same spec
const corpus = glossary.terms.map((t) => ({
  gId: 'g', gName: 'test', areas: [], term: t,
  spo: glossary.spo.filter((s) => norm(s.Term) === norm(t.Term)),
}));
const an = analyzeCorpus(corpus);
const isaOf = (t) => an.isa.filter((e) => norm(e.term) === norm(t)).map((e) => e.parent_raw);
r.eq(isaOf('Knowledge Area'), ['Data Management Subdiscipline'], 'an.isa: Knowledge Area -> Data Management Subdiscipline');
r.eq(isaOf('Orphan With SPO'), [], 'an.isa: blank-Hypernym term has no edge (root/orphan)');
r.ok(isaOf('Dep Term').length === 0, 'an.isa: Deprecated term excluded');

const green = r.done();
app.cleanup();
process.exit(green ? 0 : 1);
