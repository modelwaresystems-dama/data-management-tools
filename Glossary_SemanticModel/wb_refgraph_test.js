/* wb_refgraph_test.js — the reference graph (edges, missing, orphans) is built from the
 * governed SPO sheet, not parsed Definition prose (27 Oct handover). Guards v4.80:
 *   - an SPO Object that resolves to a defined term is an edge, not "missing";
 *   - an SPO Object that does not resolve is a genuinely-missing referenced term;
 *   - a term referenced only as an SPO object is connected (not an orphan);
 *   - Draft / Deprecated / Retired terms are excluded from orphans;
 *   - Rejected SPO rows are skipped. */
const { loadApp, Runner } = require('./wb_common.js');

const app = loadApp();
const { analyzeCorpus } = app.wb;
const r = Runner('wb_refgraph_test');
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const terms = [
  { Term: 'Data Governance', 'Term Type': 'Entity', Hypernym: 'Core Knowledge Area', Lifecycle: 'Approved', Definition: '' },
  { Term: 'Knowledge Area', 'Term Type': 'Entity', Hypernym: 'Data Management Subdiscipline', Lifecycle: 'Approved', Definition: '' },
  { Term: 'Semantic Scope', 'Term Type': 'Entity', Hypernym: '', Lifecycle: 'In Review', Definition: '' },   // referenced only as an object
  { Term: 'Lonely Approved', 'Term Type': 'Entity', Hypernym: '', Lifecycle: 'Approved', Definition: '' },    // no SPO at all -> orphan
  { Term: 'Draft Stub', 'Term Type': 'Entity', Hypernym: '', Lifecycle: 'Draft', Definition: '' },            // Draft -> excluded from orphans
  { Term: 'Data Consumer', 'Term Type': 'Entity', Hypernym: '', Lifecycle: 'Approved', Definition: '' },      // "Consumer" short-name resolves here
  { Term: 'First Party', 'Term Type': 'Entity', Hypernym: '', Lifecycle: 'Draft', Definition: '' },           // two "… Party" -> "Party" ambiguous
  { Term: 'Second Party', 'Term Type': 'Entity', Hypernym: '', Lifecycle: 'Draft', Definition: '' },
];
const spo = [
  { Term: 'Data Governance', Subject: 'Data Governance', Predicate: 'governs', Object: 'Data Asset', 'Sign-off': 'Approved' },   // Data Asset undefined -> missing
  { Term: 'Data Governance', Subject: 'Data Governance', Predicate: 'delimits', Object: 'Semantic Scope', 'Sign-off': 'Approved' },
  { Term: 'Knowledge Area', Subject: 'Knowledge Area', Predicate: 'relates to', Object: 'Semantic Scope', 'Sign-off': 'Approved' },
  { Term: 'Data Governance', Subject: 'Data Governance', Predicate: 'serves', Object: 'Consumer', 'Sign-off': 'Approved' },       // short-name -> Data Consumer
  { Term: 'Data Governance', Subject: 'Data Governance', Predicate: 'involves', Object: 'Party', 'Sign-off': 'Approved' },        // ambiguous -> stays missing
  { Term: 'Data Governance', Subject: 'Data Governance', Predicate: 'references', Object: 'Rejected Thing', 'Sign-off': 'Rejected' }, // skipped
];
const corpus = terms.map((t) => ({
  gId: 'g', gName: 'test', areas: [], term: t,
  spo: spo.filter((s) => norm(s.Term) === norm(t.Term)),
}));
const an = analyzeCorpus(corpus);
const missN = (t) => an.missing.some((m) => norm(m.term) === norm(t));
const orphN = (t) => an.orphans.some((o) => norm(o.term) === norm(t));

r.ok(missN('Data Asset'), 'unresolved SPO object (Data Asset) is reported missing');
r.ok(!missN('Semantic Scope'), 'a defined SPO object (Semantic Scope) is NOT missing');
r.ok(!missN('Rejected Thing'), 'object of a Rejected SPO row is skipped');
r.ok(!orphN('Semantic Scope'), 'a term referenced only as an SPO object is connected (not an orphan)');
r.ok(orphN('Lonely Approved'), 'an Approved term with no SPO edge is an orphan');
r.ok(!orphN('Draft Stub'), 'a Draft term is excluded from orphans');
r.ok(!missN('Consumer') && !orphN('Data Consumer'), 'unique short-name (Consumer -> Data Consumer) resolves, not missing');
r.ok(missN('Party'), 'ambiguous short-name (Party -> two candidates) stays missing');
r.ok(an.summary.edges >= 2, 'reference edges are built from SPO (>=2 resolved edges)');
r.ok(an.graph.links.some((l) => norm(l.source) === norm('Data Governance') && norm(l.target) === norm('Semantic Scope') && /delimit/i.test(l.pred || '')),
  'graph link carries the SPO predicate (Data Governance --delimits--> Semantic Scope)');

const green = r.done();
app.cleanup();
process.exit(green ? 0 : 1);
