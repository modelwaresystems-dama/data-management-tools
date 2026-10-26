/* wb_hier_test.js — the taxonomy hierarchy is built from the curated Hypernym column
 * (single parent), NOT from the messy is-a SPO layer. Guards the v4.77 fix:
 *   - a term with a Hypernym takes that single parent, even when it also has
 *     conflicting / skip-level is-a SPO assertions;
 *   - a term with no Hypernym falls back to its first is-a SPO;
 *   - the exported-site hierarchy (analyzeCorpus().isa) follows the same rule. */
const { loadApp, Runner } = require('./wb_common.js');

const app = loadApp();
const { isaEdgesFor, analyzeCorpus } = app.wb;
const r = Runner('wb_hier_test');
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

// A glossary reproducing the real defect: Knowledge Area's Hypernym is the correct
// direct parent, but its is-a SPO asserts a skip-level parent FIRST.
const glossary = {
  id: 'g', name: 'test', spo: [
    { Term: 'Knowledge Area', Subject: 'Knowledge Area', Predicate: 'is a', Object: 'Data Management Discipline' },
    { Term: 'Knowledge Area', Subject: 'Knowledge Area', Predicate: 'is a', Object: 'Data Management Subdiscipline' },
    { Term: 'Orphan With SPO', Subject: 'Orphan With SPO', Predicate: 'is a', Object: 'Data Management Discipline' },
  ],
  terms: [
    { Term: 'Knowledge Area', 'Term Type': 'Entity', Hypernym: 'Data Management Subdiscipline', Lifecycle: 'Approved' },
    { Term: 'Data Management Subdiscipline', 'Term Type': 'Entity', Hypernym: 'Data Management Discipline', Lifecycle: 'Approved' },
    { Term: 'Data Management Discipline', 'Term Type': 'Entity', Hypernym: '', Lifecycle: 'Approved' },
    { Term: 'Orphan With SPO', 'Term Type': 'Entity', Hypernym: '', Lifecycle: 'Approved' },
  ],
};

const { parents } = isaEdgesFor(glossary);
const parOf = (t) => (parents[norm(t)] || []).slice();

// 1-2. Hypernym wins, as the SINGLE parent — not the skip-level SPO parent.
r.eq(parOf('Knowledge Area'), ['Data Management Subdiscipline'], 'Knowledge Area parent = Hypernym (Data Management Subdiscipline)');
r.ok(!parOf('Knowledge Area').some((p) => norm(p) === norm('Data Management Discipline')), 'the skip-level SPO parent (Discipline) is NOT in the tree');

// 3. normal chain still holds
r.eq(parOf('Data Management Subdiscipline'), ['Data Management Discipline'], 'Subdiscipline parent = Discipline');

// 4. root term (empty Hypernym, no is-a) has no parent
r.eq(parOf('Data Management Discipline'), [], 'Discipline is a root (no parent)');

// 5. fallback: no Hypernym -> first is-a SPO is used
r.eq(parOf('Orphan With SPO'), ['Data Management Discipline'], 'term without Hypernym falls back to its is-a SPO');

// 6-8. the exported-site hierarchy (analyzeCorpus().isa) follows the Hypernym too
const corpus = glossary.terms.map((t) => ({
  gId: 'g', gName: 'test', areas: [], term: t,
  spo: glossary.spo.filter((s) => norm(s.Term) === norm(t.Term)),
}));
const an = analyzeCorpus(corpus);
const isaOf = (t) => (an.isa.filter((e) => norm(e.term) === norm(t)).map((e) => e.parent_raw));
r.eq(isaOf('Knowledge Area'), ['Data Management Subdiscipline'], 'site hierarchy: Knowledge Area -> Data Management Subdiscipline');
r.ok(!isaOf('Knowledge Area').some((p) => norm(p) === norm('Data Management Discipline')), 'site hierarchy: no skip-level Discipline edge for Knowledge Area');
r.eq(isaOf('Orphan With SPO'), ['Data Management Discipline'], 'site hierarchy: Hypernym-less term falls back to is-a SPO');

const green = r.done();
app.cleanup();
process.exit(green ? 0 : 1);
