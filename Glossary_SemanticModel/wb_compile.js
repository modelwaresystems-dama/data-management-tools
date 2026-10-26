/* wb_compile.js — Babel compile check of the app's JSX block. */
const { readBlock, transform } = require('./wb_common.js');
try {
  const out = transform(readBlock());
  console.log('wb_compile: OK (' + out.length + ' chars)');
  process.exit(0);
} catch (e) {
  console.error('wb_compile: FAIL\n' + (e.message || e));
  process.exit(1);
}
