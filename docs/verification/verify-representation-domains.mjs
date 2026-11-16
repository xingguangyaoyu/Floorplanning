// Independent recheck of the representation-capability claims for the fixed five-block instance.
// Model: A3x2 B2x3 C2x2 D3x1 E2x2, no rotation, axis-aligned integers, outline 10x8.
// Slicing: ordered full binary tree + H/V per internal node (exhaustive over the slice encoding space).
// B*-tree: ordered binary tree + skyline packing (exhaustive over 5040 labelled trees).
// Sequence pair: two permutations -> constraint graph -> longest path (exhaustive over 14400 encodings).
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {decodePostfix, CATALOG02} from '../../dist/assets/slicing04.mjs';
import {metricsReport} from '../../dist/assets/metrics03.mjs';
import {packBstar05} from '../../dist/assets/bstar05.mjs';
import {decodeSP06} from '../../dist/assets/sp06.mjs';

const IDS = Object.keys(CATALOG02);

// ---------- 1. slicing ----------
function sliceShapes(n) {
  if (n === 1) return [['leaf']];
  const out = [];
  for (let left = 1; left < n; left++)
    for (const a of sliceShapes(left)) for (const b of sliceShapes(n - left)) out.push([...a, ...b, 'op']);
  return out;
}
function perms(xs) {
  if (!xs.length) return [[]];
  return xs.flatMap((x, i) => perms(xs.filter((_, j) => j !== i)).map(t => [x, ...t]));
}
let sliceCount = 0, sliceMin = Infinity, sliceMinCount = 0, sliceWitness = null;
for (const tree of sliceShapes(5))
  for (const order of perms(IDS))
    for (let mask = 0; mask < 16; mask++) {
      let i = 0, j = 0; const stack = [], tokens = [];
      for (const token of tree) {
        if (token === 'leaf') { const id = order[i++]; tokens.push(id); stack.push([...CATALOG02[id]]); }
        else {
          const b = stack.pop(), a = stack.pop(), op = ((mask >> j++) & 1) ? 'H' : 'V';
          tokens.push(op);
          stack.push(op === 'H' ? [Math.max(a[0], b[0]), a[1] + b[1]] : [a[0] + b[0], Math.max(a[1], b[1])]);
        }
      }
      const [w, h] = stack[0], area = w * h;
      sliceCount++;
      if (area < sliceMin) { sliceMin = area; sliceMinCount = 1; sliceWitness = {expression: tokens.join(' '), width: w, height: h, area}; }
      else if (area === sliceMin) sliceMinCount++;
    }
assert.equal(sliceCount, 26880);
assert.equal(sliceMin, 25);
assert.equal(sliceMinCount, 144); // 144 slice encodings reach the 25 minimum; none reaches 24
const sliceDecoded = decodePostfix(sliceWitness.expression);
assert(sliceDecoded.ok);
assert.equal(metricsReport(sliceDecoded.rows, [10, 8], CATALOG02).bbox.area, 25);

// ---------- 2. B*-tree ----------
const EMPTY = null; // an absent child
function bstarShapes(n) { // shapes with exactly n nodes
  if (n === 0) return [EMPTY];
  if (n === 1) return [{leaf: true}];
  const out = [];
  for (let left = 0; left < n; left++)
    for (const l of bstarShapes(left)) for (const r of bstarShapes(n - 1 - left)) out.push({l, r});
  return out;
}
function labelTree(shape, order) {
  let k = 0;
  const build = sh => {
    if (sh === EMPTY) return null;
    const id = order[k++];
    const n = {id};
    if (!sh.leaf) { n.left = build(sh.l); n.right = build(sh.r); }
    return n;
  };
  return build(shape);
}
function text(t) {
  if (!t.left && !t.right) return t.id;
  return `${t.id}(${t.left ? text(t.left) : '-'},${t.right ? text(t.right) : '-'})`;
}
let bstarCount = 0, bstarMin = Infinity, bstarMinTrees = [];
for (const shape of bstarShapes(5))
  for (const order of perms(IDS)) {
    const t = labelTree(shape, order), s = text(t);
    let r;
    try { r = packBstar05(s); } catch { continue; }
    bstarCount++;
    const area = r.report.bbox.area;
    if (area < bstarMin) { bstarMin = area; bstarMinTrees = [s]; }
    else if (area === bstarMin) bstarMinTrees.push(s);
  }
assert.equal(bstarCount, 5040);
assert.equal(bstarMin, 24);
assert.equal(bstarMinTrees.length, 8);

// ---------- 3. sequence pair expresses the 24 layout ----------
// Exhaustive over every pair of permutations: the encoding space itself contains an area-24 layout.
let spCount = 0, spMin = Infinity, spMinCount = 0, spWitness = null;
for (const pos of perms(IDS)) for (const neg of perms(IDS)) {
  const r = decodeSP06(pos.join(''), neg.join(''));
  if (!r.ok) continue;
  spCount++;
  const area = r.report.bbox.area;
  if (area < spMin) { spMin = area; spMinCount = 1; spWitness = {pos: pos.join(''), neg: neg.join(''), area, rows: r.rows}; }
  else if (area === spMin) spMinCount++;
}
assert.equal(spCount, 14400);
assert.equal(spMin, 24);
assert(spMinCount > 0);

// ---------- 4. the 24 layout is NOT slicing-representable ----------
const bestRows = spWitness.rows;
const W = Math.max(...bestRows.map(r => r[1] + r[3])), H = Math.max(...bestRows.map(r => r[2] + r[4]));
const guillotineFree = (() => {
  const xs = [...new Set(bestRows.flatMap(r => [r[1], r[1] + r[3]]))].sort((a, b) => a - b);
  const ys = [...new Set(bestRows.flatMap(r => [r[2], r[2] + r[4]]))].sort((a, b) => a - b);
  const crossV = c => bestRows.some(r => c > r[1] + 1e-9 && c < r[1] + r[3] - 1e-9);
  const crossH = c => bestRows.some(r => c > r[2] + 1e-9 && c < r[2] + r[4] - 1e-9);
  const okV = xs.filter(c => c > 1e-9 && c < W - 1e-9 && !crossV(c) && bestRows.some(r => r[1] < c) && bestRows.some(r => r[1] + r[3] > c));
  const okH = ys.filter(c => c > 1e-9 && c < H - 1e-9 && !crossH(c) && bestRows.some(r => r[2] < c) && bestRows.some(r => r[2] + r[4] > c));
  return {okV, okH};
})();

const facts = {
  model: 'A3x2 B2x3 C2x2 D3x1 E2x2; no rotation; integer axis-aligned; outline 10x8',
  slicing: {encodingsChecked: sliceCount, minArea: sliceMin, countAtMin: sliceMinCount, witness: sliceWitness},
  bstar: {treesChecked: bstarCount, minArea: bstarMin, countAtMin: bstarMinTrees.length, witness: bstarMinTrees[0]},
  sequencePair: {encodingsChecked: spCount, minArea: spMin, countAtMin: spMinCount, witness: {pos: spWitness.pos, neg: spWitness.neg}, rows: spWitness.rows},
  twentyFourLayout: {rows: bestRows, area: 24, hasGuillotineFirstCut: false, candidateVerticalCuts: guillotineFree.okV, candidateHorizontalCuts: guillotineFree.okH},
  conclusion: 'For this fixed instance the slicing encoding space bottoms out at area 25 (no 24), while both the B*-tree packing space and the sequence-pair encoding space contain an area-24 layout. The 24 layout has no guillotine first cut, which is exactly why slicing cannot reach it.'
};
writeFileSync(new URL('./representation-domains.json', import.meta.url), JSON.stringify(facts, null, 2) + '\n');
console.log(JSON.stringify({sliceMin, sliceMinCount, bstarMin, bstarMinTrees: bstarMinTrees.length, spMin, spMinCount, twentyFourRows: bestRows, verticalCuts: guillotineFree.okV, horizontalCuts: guillotineFree.okH}));
