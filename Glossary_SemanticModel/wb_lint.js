/* wb_lint.js — duplicate-key lint.
 * Parses the app's JSX source and fails the build if any object literal has a
 * duplicated (non-computed) key — a silent-overwrite bug JS would not otherwise
 * flag. Also sanity-checks the hand-maintained Quant Edge maps. */
const { readBlock, loadApp, Runner } = require('./wb_common.js');
const parser = require('@babel/parser');

const code = readBlock();
const ast = parser.parse(code, { sourceType: 'script', plugins: ['jsx'] });

function keyName(k, computed) {
  if (computed) return null;
  if (!k) return null;
  if (k.type === 'Identifier') return k.name;
  if (k.type === 'StringLiteral') return k.value;
  if (k.type === 'NumericLiteral') return String(k.value);
  return null;
}

const dups = [];
const seen = new Set();
const stack = [ast];
while (stack.length) {
  const node = stack.pop();
  if (!node || typeof node !== 'object') continue;
  if (Array.isArray(node)) { for (const c of node) stack.push(c); continue; }
  if (node.type === 'ObjectExpression') {
    const here = new Map();
    for (const p of node.properties) {
      if (p.type !== 'ObjectProperty' && p.type !== 'ObjectMethod') continue;
      const name = keyName(p.key, p.computed);
      if (name == null) continue;
      if (here.has(name)) {
        const line = (p.loc && p.loc.start.line) || '?';
        const first = here.get(name);
        dups.push({ name, line, firstLine: first });
      } else { here.set(name, (p.loc && p.loc.start.line) || '?'); }
    }
  }
  for (const key in node) {
    if (key === 'loc' || key === 'start' || key === 'end' || key === 'leadingComments' || key === 'trailingComments') continue;
    const v = node[key];
    if (v && typeof v === 'object') stack.push(v);
  }
}

const r = Runner('wb_lint');
if (dups.length) {
  console.log('  ✗ duplicate object keys found:');
  dups.forEach((d) => console.log('      "' + d.name + '" at line ' + d.line + ' (first seen line ' + d.firstLine + ')'));
}
r.ok(dups.length === 0, 'no duplicated keys in any object literal (' + dups.length + ' found)');

// Hand-maintained Quant Edge maps — semantic uniqueness
const app = loadApp();
const { QUANT_EDGES, QE_SHORT, QE_FROM_SHORT } = app.wb;
const edgeKeys = QUANT_EDGES.map((e) => e[0]);
r.ok(new Set(edgeKeys).size === edgeKeys.length, 'QUANT_EDGES keys are unique');
const shortVals = Object.values(QE_SHORT);
r.ok(new Set(shortVals).size === shortVals.length, 'QE_SHORT short names are unique');
r.ok(Object.keys(QE_SHORT).every((full) => QE_FROM_SHORT[QE_SHORT[full]] === full), 'QE_FROM_SHORT inverts QE_SHORT exactly');
app.cleanup();

const green = r.done();
process.exit(green ? 0 : 1);
