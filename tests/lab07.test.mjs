import test from'node:test';import assert from'node:assert/strict';
import{BASE02,CATALOG02,copy}from'../dist/assets/legality02.mjs';
import{RUN07,RUN07_SEED3,RUN07_T12,RUN07_T2,COMPARISON07,FIRST_ACC_UPHILL07,FIRST_REJECT07,assess07,checkExercise07,TASKS07,EXERCISES07,DEFAULT_RUN07}from'../dist/assets/anneal07.mjs';
import{anneal}from'../dist/assets/core.mjs';
import{sceneAt,playbackState,seekState,beginTrial,endTrial,editTrial}from'../dist/assets/interactive-state.mjs';import data from'../dist/lessons/07/teaching/lesson-data.mjs';import{renderScene}from'../dist/lessons/07/teaching/visuals.mjs';
test('reference run is deterministic and the state machine is coherent',()=>{
 const a=anneal(DEFAULT_RUN07),b=anneal(DEFAULT_RUN07);
 assert.deepEqual(a.events,b.events);
 const ev=a.events;
 assert.equal(FIRST_ACC_UPHILL07,6);assert.equal(FIRST_REJECT07,2);
 for(const e of ev){
  if(e.accepted&&e.delta>0)assert(e.u<e.probability+1e-9,'uphill acceptance needs u<p');
  if(!e.accepted&&e.delta>0)assert(e.u>=e.probability-1e-9);
 }
 for(let i=1;i<ev.length;i++){const expected=ev[i].accepted?ev[i].candidateEnergy:ev[i-1].energy;assert.equal(ev[i].energy,expected,'current follows accept/reject');}
});
test('best legal area is non-increasing and separated from current',()=>{
 const ev=RUN07.events;let last=Infinity;
 for(const e of ev){if(e.bestEnergy!=null){assert(e.bestEnergy<=last+1e-9);last=e.bestEnergy;}}
 const seed3=RUN07_SEED3.events.at(-1);
 assert.equal(seed3.bestEnergy,25);assert.equal(seed3.energy,27);
 assert.equal(RUN07.events.at(-1).bestEnergy,25);
});
test('equal-budget comparison: T12 dominates T2 on the shared seed set',()=>{
 assert.deepEqual(COMPARISON07,{seeds:[3,7,11],T12:[25,25,25],T2:[28,25,27],sumT12:75,sumT2:80});
 const real=[...RUN07_T12.seeds?[]:[RUN07_T12.seed3,RUN07_T12.seed7,RUN07_T12.seed11].map(r=>r.events.at(-1).bestEnergy)];
 assert.deepEqual(real,COMPARISON07.T12);
 const real2=[RUN07_T2.seed3,RUN07_T2.seed7,RUN07_T2.seed11].map(r=>r.events.at(-1).bestEnergy);
 assert.deepEqual(real2,COMPARISON07.T2);
});
test('three lab tasks accept only witnesses that satisfy their own constraints',()=>{
 assert(assess07('audit-steps',{accStep:6,accDelta:10,rejStep:2,rejDelta:96},true).ok);
 assert(!assess07('audit-steps',{accStep:6,accDelta:10,rejStep:2,rejDelta:87},true).ok);
 assert(assess07('fix-state',{curAfter2:49,curAfter6:45},true).ok);
 assert(!assess07('fix-state',{curAfter2:145,curAfter6:45},true).ok);
 assert(!assess07('fix-state',{curAfter2:RUN07.events[1].candidateEnergy,curAfter6:45},true).ok);
 assert(assess07('equal-budget',{sumT12:75,sumT2:80},true).ok);
 assert(!assess07('equal-budget',{sumT12:75,sumT2:80},false).ok);
});
test('exercises check exact numbers with reasons recorded separately',()=>{
 assert(checkExercise07('penalty',{small:38,legal:40}));
 assert(checkExercise07('low-temp',{p:0.02}));
 assert(checkExercise07('final-best',{final:27,best:25}));
 assert(checkExercise07('one-run',{t12:25,t2:28}));
 assert.equal(EXERCISES07.length,4);assert.equal(TASKS07.length,3);
});
test('Lab7 timeline: intro precedes knowledge scenes; boundaries and reused audio cohere',()=>{
 assert.equal(data.scenes.length,18);assert.equal(data.chapters.length,8);
 assert.deepEqual(data.scenes.slice(0,3).map(s=>s.key),['intro-why','intro-task','intro-preview']);
 assert(data.scenes.slice(0,3).every(s=>s.chapter===1&&s.delivery==='reading'&&!s.question));
 assert.equal(data.scenes.filter(s=>s.question).length,1);assert.equal(data.cuts.length,8);assert.equal(data.newSpeech,false);
 let cursor=0;for(const s of data.scenes){assert(Math.abs(s.start-cursor)<1e-5);assert(s.end>s.start);cursor=s.end;}
 assert(Math.abs(cursor-data.duration)<1e-5);
 for(const c of data.captions)if(c.delivery==='reading')assert.deepEqual(c.words,[]);
 for(const s of data.scenes)if(s.voice)assert(['start','neighbor','delta','probability','predict','accept','reject','best'].includes(s.voice),s.key+' voice '+s.voice);
});
test('all Lab7 teaching views render finite, non-negative SVG for every authored scene',()=>{
 let checked=0;
 for(const s of data.scenes)for(const p of[0,.35,.75,.999]){
  const svg=renderScene(s,s.start+(s.end-s.start)*p,null,false);
  assert(!/="[^"]*(NaN|undefined)/.test(svg),s.key);
  for(const match of svg.matchAll(/<rect\b[^>]*width="([^"]+)"[^>]*height="([^"]+)"/g)){
   assert(Number.isFinite(Number(match[1]))&&Number(match[1])>=0,s.key);
   assert(Number.isFinite(Number(match[2]))&&Number(match[2])>=0,s.key);checked++;}
 }
 assert(checked>60);
});
test('shared player trial remains isolated on Lab7 scenes',()=>{
 const s=playbackState();seekState(s,60,data.duration);const scene=sceneAt(data.scenes,s.time),before=copy(scene.rows);
 beginTrial(s,scene,0);editTrial(s,rows=>{if(rows[0])rows[0][1]+=1;});assert.equal(s.time,60);
 endTrial(s);assert.equal(s.time,60);assert.equal(s.trial,null);assert.deepEqual(scene.rows,before);
});
