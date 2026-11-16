// Behaviour guards for the 2026-11-16 rework: stepwise decode state, the counting counterexample,
// and the cross-lesson representation-capability statement.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {decodePostfix, decodeRows04, coordinateSteps, EXERCISES04, checkExercise04, TASKS04, assess04, CATALOG02} from '../dist/assets/slicing04.mjs';
import{renderScene as render06}from'../dist/lessons/06/teaching/visuals.mjs';
import LESSON06 from '../dist/lessons/06/teaching/lesson-data.mjs';
import LESSON04 from '../dist/lessons/04/teaching/lesson-data.mjs';

const file = p => readFileSync(new URL(p, import.meta.url), 'utf8');

test('R3: a fresh decode starts at step 1 and step 1 shows only the first module', () => {
  const r = decodePostfix('A D H B V C E H V');
  assert(r.ok);
  assert.deepEqual(r.size, {w: 7, h: 4}, 'the A D H B V C E H V instance must decode to 7×4');
  const first = r.events[0];
  assert.equal(first.token, 'A');
  assert.equal(first.stack.length, 1, 'step 1 must not preview a stacked structure');
  assert.deepEqual(first.stack[0].ids, 'A');
  assert.deepEqual(Object.keys(first.pack), ['A'], 'step 1 must carry only A in its local pack');
  assert.deepEqual([first.region[0], first.region[1]], [3, 2]);
  const last = r.events[r.events.length - 1];
  assert.notEqual(JSON.stringify(first.stack), JSON.stringify(last.stack), 'step 1 and step 9 must differ');
});

test('R4: every step keeps stack snapshots whose packs stay local to each region', () => {
  const r = decodePostfix('A D H B V C E H V');
  for (const ev of r.events) {
    assert(ev.stack.length >= 1);
    for (const cell of ev.stack) {
      const pad = Object.values(cell.pack);
      const w = Math.max(...pad.map(p => p.x + p.w)), h = Math.max(...pad.map(p => p.y + p.h));
      assert.equal(w, cell.w, 'a region pack must fit exactly its own width');
      assert.equal(h, cell.h, 'a region pack must fit exactly its own height');
      assert(Math.min(...pad.map(p => p.x)) >= 0 && Math.min(...pad.map(p => p.y)) >= 0, 'each region restarts at its own local origin');
    }
  }
});

test('R3: failed decodes keep the legal events and report where they stopped', () => {
  const r = decodePostfix('A H');
  assert.equal(r.ok, false);
  assert.equal(r.failure.code, 'underflow');
  assert.equal(r.failure.index, 1, 'the second token is the one that underflows');
  assert.equal(r.failure.next, 2);
  assert.equal(r.failure.stack.length, 1);
  assert.deepEqual(r.failure.stack[0].ids, 'A', 'the pre-error stack must still show A');
  assert.equal(r.events.length, 1, 'the legal steps before the error stay reviewable');
  assert.equal(r.size, null, 'a failed decode must not report a final size');
  assert.equal(r.rows.length, 0, 'a failed decode must not hand back a scoreable layout');
});

test('R2: the counting counterexample is balanced yet underflows at its second token', () => {
  const q = EXERCISES04.find(e => e.id === 'underflow');
  assert.match(q.prompt, /A H D B V C V E V/, 'the prompt must use the balanced five-letter expression');
  assert.doesNotMatch(q.prompt, /三个组合符号/, 'the old wrong operator count must be gone');
  const r = decodePostfix('A H D B V C V E V');
  assert.equal(r.tokens.filter(t => t !== 'H' && t !== 'V').length, 5, 'five letters, each once');
  assert.equal(r.tokens.filter(t => t === 'H' || t === 'V').length, 4, 'four operators: total count is balanced');
  assert.equal(r.failure.code, 'underflow');
  assert.equal(r.failure.index, 1);
  assert.equal(r.failure.stack.length, 1);
  assert.equal(r.failure.stack[0].ids, 'A');
  assert.deepEqual(r.errors.length, 1);
  assert(checkExercise04('underflow', {have: 1, need: 2}), 'the published 1 / 2 answer must still match the actual stack');
  const alt = decodePostfix('A D H B V C V E V');
  assert(alt.ok, 'the same five letters in a valid prefix order must decode');
});

test('R4: task 1 states its extra A/D constraint instead of hiding it', () => {
  const t = TASKS04.find(x => x.id === 'repair');
  assert.match(t.prompt, /A 在下、D 在上/, 'the A.y=0 / D.y=2 rule must be public');
  assert.match(t.prompt, /A 的 y=0、D 的 y=2/);
  const ok = assess04('repair', 'A D H B V E V C V', {w: '9', h: '3'}, true);
  assert.deepEqual(ok.errors, [], 'the hinted expression must satisfy the stated constraint');
  const other = assess04('repair', 'D A H B V C V E V', {w: '9', h: '3'}, true);
  assert.equal(other.ok, false, 'an expression that puts D below A is rejected by the now-public constraint');
  assert.match(other.errors.join(' '), /A 在下、D 在上|A\.y|D\.y/, 'rejection must cite the published rule');
});

test('R3: coordinate propagation is ordered, incremental and complete only at the end', () => {
  const r = decodePostfix('A D H B V C V E V');
  const steps = coordinateSteps(r.tree);
  assert.equal(steps.length, 9, 'five leaves + four internal nodes');
  let placed = 0;
  for (const s of steps) {
    const n = Object.keys(s.placed).length;
    assert(n >= placed, 'placed modules never disappear');
    placed = n;
  }
  assert.equal(placed, 5);
  assert.deepEqual(steps[0].origin, [0, 0], 'the root starts at the origin');
  assert(steps[steps.length - 1].placed.E, 'the last step holds the full layout');
});

test('R1: Lab6 tells three different capability results instead of one shared optimum', () => {
  const scene = LESSON06.scenes.find(s => s.key === 'compare-reps');
  assert(scene, 'compare-reps must exist');
  assert.doesNotMatch(scene.say, /三种表示法都能/, 'the false shared-capability claim must be gone');
  const displayed=scene.say+render06(scene,scene.end-.001,null,true);
  assert.match(displayed, /26880/, 'the slicing enumeration size must be quoted');
  assert.match(displayed, /25/, 'the slicing bound must appear');
  assert.match(displayed, /14400/);
  assert.match(displayed, /5040/);
});

test('R1: Lab4 pinwheel scene passes the area-25 bound forward to Lab5/6', () => {
  const scene = LESSON04.scenes.find(s => s.key === 'pinwheel-proof');
  assert.match(scene.say, /25|二十五/, 'Lab4 must state the slicing bound it implies');
  assert.match(scene.say, /完整搜索空间|完备穷举|全部穷举/, 'the domain-wide bound must use exhaustive evidence');assert.match(scene.say,/单张布局|单个反例/,'distinguish a witness from the domain-wide bound');
});

test('R5: the lesson bootstrap has one branch per lesson id', () => {
  const app = file('../dist/assets/app.mjs');
  assert.doesNotMatch(app, /!\['02','03'\]\.includes\(current\.id\)/, 'the legacy catch-all branch must be gone');
  assert.doesNotMatch(app, /if\(false&&/, 'no dead conditional may mask the branch');
  for (const id of ['02', '03', '04', '05', '06', '07', '08'])
    assert(new RegExp(`current\\.id==='${id}'`).test(app), `lesson ${id} needs its own branch`);
});

test('R8: the finale keeps unique element ids and revokes stale Python passes', () => {
  const src = file('../dist/assets/finale08.mjs');
  const ids = [...src.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
  const dup = ids.filter((v, i) => ids.indexOf(v) !== i);
  assert.deepEqual([...new Set(dup)], [], 'duplicate ids break status updates');
  assert.match(src, /delete progress\.visited\['python-08-shape-v1'\]/, 'editing the shape code must revoke the old pass');
});

test('R1: the fixed five-block catalog still sums to 23 with a 10×8 outline', () => {
  const sum = Object.values(CATALOG02).reduce((n, [w, h]) => n + w * h, 0);
  assert.equal(sum, 23);
  const r = decodeRows04('A D H B V C V E V');
  assert.equal(r.size.w * r.size.h, 27);
});

test('Lab8: task 1 scores its sum field and the checker reads fields from the task', async () => {
  const {assess08B, TASKS08B} = await import('../dist/assets/soft08.mjs');
  const t1 = TASKS08B.find(t => t.id === 'frontier-keep');
  assert.deepEqual(t1.fields.map(f => f[0]), ['sum'], 'task 1 must only ask for the frontier area sum');
  assert.equal(assess08B('frontier-keep', {sum: '49'}, true).ok, true, '49 is the frontier sum and must pass');
  assert.equal(assess08B('frontier-keep', {sum: '48'}, true).ok, false, '48 must be rejected');
  assert.equal(assess08B('frontier-keep', {}, true).ok, false, 'an empty answer must be rejected');
  assert.equal(assess08B('frontier-keep', {sum: '49'}, false).ok, false, 'loading the page is not an attempt');
  const src = file('../dist/assets/finale08.mjs');
  assert.match(src, /for\(const\[key\]of task\.fields\)/, 'the checker must collect fields from the task, not a fixed list');
  assert.doesNotMatch(src, /\['minArea','fitArea'/, 'the hardcoded field list must be gone');
  for (const t of TASKS08B) {
    const keys = t.fields.map(f => f[0]);
    assert(keys.length > 0, `${t.id} must define fields`);
  }
});

test('Lab8: the joint exercise asks a checkable state question instead of a self-answering count', async () => {
  const {EXERCISES08B, checkExercise08B} = await import('../dist/assets/soft08.mjs');
  const q = EXERCISES08B.find(x => x.id === 'joint-meaning');
  assert.doesNotMatch(q.prompt, /候选操作类型数/, 'the fixed "fill 1" phrasing must be gone');
  assert.doesNotMatch(q.rubric, /新增操作：修改某个软模块的形状选择/, 'the reference direction must not be inverted');
  assert.match(q.prompt, /交换序列对元素/, 'the prompt must name the operation students judge');
  assert.deepEqual(q.fields.map(f => [f[0], f[2]]), [['added', 2], ['best', 25]]);
  assert.equal(checkExercise08B('joint-meaning', {added: '2', best: '25'}), true, 'topology edit + 25 must pass');
  assert.equal(checkExercise08B('joint-meaning', {added: '1', best: '25'}), false, 'shape choice is not the added edit');
  assert.equal(checkExercise08B('joint-meaning', {added: '2', best: '24'}), false, '24 is the old instance, not this one');
});

test('Lab8: the shape Python revokes its saved pass on start, stop, timeout and error but keeps it on success', () => {
  const src = file('../dist/assets/finale08.mjs');
  assert.match(src, /function revoke\(\)/, 'revocation must be a named step separate from worker release');
  assert.match(src, /function stop\(message,\{keepPass=false\}=\{\}\)/, 'stop must know whether the pass survives');
  assert.match(src, /stop\(undefined,\{keepPass:all\}\)/, 'a successful run keeps the pass it just earned');
  assert.match(src, /超时|运行超过20秒/, 'the timeout path must exist');
  assert.match(src, /已停止，代码保留。旧通过状态已撤销/, 'manual stop must say the pass was revoked');
  assert.match(src, /if\(worker!==job\)return/, 'stale worker callbacks must not touch the new run');
});

