import test from'node:test';import assert from'node:assert/strict';
import{BASE02,CATALOG02,auditRows,copy}from'../dist/assets/legality02.mjs';
import{GOLDEN_TREE05,LIFT_TREE05,RESIDUAL_TREE05,EDIT_TREE05,packBstar05,assess05,checkExercise05,TASKS05,EXERCISES05,WITNESSES05,GOLDEN05,LIFT05,RESIDUAL05,EDIT05,WRONG_ORDER05,ENUM05,bstarWalk05,parseTree05}from'../dist/assets/bstar05.mjs';
import{inspect}from'../dist/assets/core.mjs';
import{sceneAt,playbackState,seekState,beginTrial,endTrial,editTrial}from'../dist/assets/interactive-state.mjs';import data from'../dist/lessons/05/teaching/lesson-data.mjs';import{renderScene}from'../dist/lessons/05/teaching/visuals.mjs';
test('golden tree packs to the taught layout with preorder and merged contour',()=>{
 const r=GOLDEN05;assert(r.ok);assert.deepEqual(r.order,['A','B','C','E','D']);
 assert.deepEqual(r.pack,{A:{x:0,y:0,w:3,h:2},B:{x:3,y:0,w:2,h:3},C:{x:5,y:0,w:2,h:2},E:{x:7,y:0,w:2,h:2},D:{x:0,y:2,w:3,h:1}});
 assert(r.check.legal);assert.equal(r.report.bbox.area,27);
 assert.deepEqual(r.contour,[{x1:0,x2:5,h:3},{x1:5,x2:9,h:2}]);
 const last=r.events.at(-1);assert.deepEqual(last.query,[0,3]);assert.deepEqual(last.support,{x1:0,x2:3,h:2});
});
test('right child shares parent x but lands on the highest segment under its footprint',()=>{
 const L=LIFT05;assert.equal(L.pack.D.x,L.pack.C.x);assert.equal(L.pack.D.y,3);
 const last=L.events.at(-1);assert.deepEqual(last.support,{x1:2,x2:4,h:3});
 assert.equal(L.report.bbox.area,36);assert(L.check.legal);
 const E=EDIT05;assert.deepEqual(E.pack.D,{x:5,y:2,w:3,h:1});assert.equal(E.report.bbox.area,27);assert.deepEqual(E.order,['A','B','C','E','D']);
});
test('residual segment is kept and lifts the next block; dropping it would overlap',()=>{
 const R=RESIDUAL05;assert(R.check.legal);assert.deepEqual(R.pack.B,{x:5,y:1,w:2,h:3});
 const afterC=R.events[2].contour;assert(afterC.some(c=>c.x1===5&&c.x2===6&&c.h===1),'residual [5,6)=1 must survive');
});
test('wrong traversal changes the result on the same tree',()=>{
 const w=WRONG_ORDER05;assert.deepEqual(w.order,['C','D','B','A','E']);assert.equal(w.pack.D.y,2);
 assert.equal(inspect(w.pack).bbox.area,54);
 const correct=LIFT05;assert.equal(correct.order.join(','),'C,B,A,E,D');assert.equal(correct.pack.D.y,3);
});
test('structure errors are readable and precede packing',()=>{
 const cases=[['A(F,-)','清单之外'],['A(B,-)','没有出现']];
 for(const[expr,needle]of cases){const r=packBstar05(expr);assert.equal(r.ok,false,expr);assert(r.errors.some(e=>e.includes(needle)),expr+' -> '+r.errors.join(';'));assert.deepEqual(r.rows,[]);}
 assert.throws(()=>parseTree05('A(B(C,-)'),/缺少/);
});
test('three lab tasks accept only witnesses satisfying their own constraints',()=>{
 const assess=(id,tree,e)=>assess05(id,tree,e,true);
 assert(assess('hand-lift','C(B(A(E,-),-),D)',{dx:0,dy:3,area:36}).ok);
 assert(!assess('hand-lift','A(B(C(E,-),-),D)',{dx:0,dy:2,area:27},true).ok);
 assert(assess('fix-contour','C(B(A(E,-),-),D)',{dy:3,area:36}).ok);
 const wrong=assess('fix-contour','C(B(A(E,-),-),D)',{dy:2,area:36},true);assert(!wrong.ok);assert(wrong.errors.some(e=>e.includes('覆盖区间')));
 assert(assess('edit-tree','A(B(C(E,D),-),-)',{area:27,moved:'D'}).ok);
 const noMove=assess('edit-tree','A(B(C(E,-),-),D)',{area:27,moved:'D'},true);assert(!noMove.ok);
 assert(!assess05('hand-lift','C(B(A(E,-),-),D)',{dx:0,dy:3,area:36},false).ok);
});
test('enumeration facts: 5040 total, 4680 fit, min area 24',()=>{
 assert.deepEqual(ENUM05,{total:5040,fit:4680,minArea:24,atMin:8,overflow:360});
 // re-verify quickly by sampling the witness trees
 for(const t of[GOLDEN_TREE05,LIFT_TREE05,RESIDUAL_TREE05,EDIT_TREE05])assert(packBstar05(t).check.legal,t);
});
test('exercises check exact numbers with reasons recorded separately',()=>{
 assert(checkExercise05('right-child',{y1:2,y2:3}));
 assert(!checkExercise05('right-child',{y1:2,y2:2}));
 assert(checkExercise05('residual',{by:1,who:1}));
 assert(checkExercise05('wrong-order',{dy:2,area:54}));
 assert(checkExercise05('enum-bound',{fit:4680,min:24}));
 assert.equal(EXERCISES05.length,4);assert.equal(TASKS05.length,3);
});
test('Lab5 timeline: intro precedes knowledge scenes; boundaries and reused audio cohere',()=>{
 assert.equal(data.scenes.length,20);assert.equal(data.chapters.length,8);
 assert.deepEqual(data.scenes.slice(0,3).map(s=>s.key),['intro-why','intro-task','intro-preview']);
 assert(data.scenes.slice(0,3).every(s=>s.chapter===1&&s.delivery==='reading'&&!s.question));
 assert.equal(data.scenes.filter(s=>s.question).length,1);assert.equal(data.cuts.length,8);assert.equal(data.newSpeech,false);
 let cursor=0;for(const s of data.scenes){assert(Math.abs(s.start-cursor)<1e-5);assert(s.end>s.start);cursor=s.end;}
 assert(Math.abs(cursor-data.duration)<1e-5);
 for(const c of data.captions)if(c.delivery==='reading')assert.deepEqual(c.words,[]);
 for(const s of data.scenes)if(s.voice)assert(['recipe','root','walk','D','predict','lift','score','counterexample'].includes(s.voice),s.key+' voice '+s.voice);
 const predict=data.scenes.find(s=>s.key==='swap-predict');assert.deepEqual(predict.rows.map(r=>r[0]),['A','B','C','D','E']);assert(!predict.rows.some(r=>r[0]==='C'&&r[1]===0),'prediction must not reveal the lifted layout');
});
test('all Lab5 teaching views render finite, non-negative SVG for every authored scene',()=>{
 let checked=0;
 for(const s of data.scenes)for(const p of[0,.35,.75,.999]){
  const svg=renderScene(s,s.start+(s.end-s.start)*p,null,false);
  assert(!/="[^"]*(NaN|undefined)/.test(svg),s.key);
  for(const match of svg.matchAll(/<rect\b[^>]*width="([^"]+)"[^>]*height="([^"]+)"/g)){
   assert(Number.isFinite(Number(match[1]))&&Number(match[1])>=0,s.key);
   assert(Number.isFinite(Number(match[2]))&&Number(match[2])>=0,s.key);checked++;}
 }
 assert(checked>100);
});
test('shared player trial remains isolated on Lab5 scenes',()=>{
 const s=playbackState();seekState(s,60,data.duration);const scene=sceneAt(data.scenes,s.time),before=copy(scene.rows);
 beginTrial(s,scene,0);editTrial(s,rows=>{if(rows[0])rows[0][1]+=1;});assert.equal(s.time,60);
 endTrial(s);assert.equal(s.time,60);assert.equal(s.trial,null);assert.deepEqual(scene.rows,before);
});
