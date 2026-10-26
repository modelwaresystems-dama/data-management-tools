/* wb_edge_test.js — Quant Edge import normalization (qeParse / qeJoin).
 * Short names map to full edge names; None / N/A / - / em-dash -> dropped;
 * dedupe; unknown tokens pass through; qeJoin re-emits in canonical order. */
const { loadApp, Runner } = require('./wb_common.js');

const app = loadApp();
const { qeParse, qeJoin, QE_ORDER } = app.wb;
const r = Runner('wb_edge_test');

r.ok(typeof qeParse === 'function' && typeof qeJoin === 'function', 'qeParse / qeJoin are exposed');

// 1. short names -> full edge names, input order preserved
r.eq(qeParse('MEMBER; PART; HAS'), ['IS-MEMBER-HAS', 'IS-PART-HAS', 'IS-HAS'], 'short names map to full edge names');

// 2-3. sentinels -> dropped
r.eq(qeParse('None'), [], '"None" -> no edges');
r.eq(qeParse('N/A'), [], '"N/A" -> no edges');

// 4. dash sentinels (hyphen and em-dash) -> dropped
r.eq(qeParse('-'), [], 'hyphen -> no edges');
r.eq(qeParse('—'), [], 'em-dash -> no edges');

// 5. dedupe across short + full forms of the same edge
r.eq(qeParse('MEMBER; MEMBER; IS-MEMBER-HAS'), ['IS-MEMBER-HAS'], 'duplicates collapse to one');

// 6. full-name passthrough
r.eq(qeParse('IS-PART-HAS'), ['IS-PART-HAS'], 'full name passes through unchanged');

// 7. case-insensitive short names; unknown token passes through verbatim
r.eq(qeParse('member; FOO'), ['IS-MEMBER-HAS', 'FOO'], 'lowercase short maps; unknown token kept as-is');

// 8. qeJoin re-emits selected edges in canonical QE_ORDER
r.eq(qeJoin(new Set(qeParse('PART; HAS'))), 'IS-HAS; IS-PART-HAS', 'qeJoin orders by QE_ORDER');
r.ok(Array.isArray(QE_ORDER) && QE_ORDER[0] === 'IS-HAS', 'QE_ORDER starts at IS-HAS');

const green = r.done();
app.cleanup();
process.exit(green ? 0 : 1);
