import test from 'node:test';import assert from 'node:assert/strict';
import {SCENES,DURATION,frameAt,check,newSession,enterTrial,leaveTrial,seek,edit}from'../dist/lessons/08/teaching/pilot-model.mjs';
import {questionClock,advanceQuestion}from'../dist/lessons/08/teaching/question-clock.mjs';
import {LAB08_TASKS,assessLab08,REVIEW_WITNESSES,checkExercise08}from'../dist/assets/advanced08.mjs';
test('complete live lesson covers nine chapters and evaluates settled states only',()=>{
 assert.equal(SCENES.length,44);assert.equal(new Set(SCENES.map(s=>s.chapterIndex)).size,11);assert.equal(SCENES.filter(s=>s.question).length,3);assert(DURATION>0);assert.equal(DURATION,SCENES.at(-1).end);
 const intro=SCENES.slice(0,4);assert.deepEqual(intro.map(s=>s.key),['intro-why','intro-course','intro-task','intro-preview']);assert(intro.every(s=>s.chapterIndex===1&&!s.question));assert.equal(SCENES[4].key,'scope');assert.equal(SCENES[4].chapterIndex,2);
 const finale=SCENES.filter(s=>['multi-shapes','frontier-keep','outline-filter','backtrace','joint-search','three-config'].includes(s.key));assert.equal(finale.length,6);assert(finale.every(s=>s.chapterIndex===10&&!s.question));assert.equal(SCENES.find(s=>s.key==='transfer').chapterIndex,11);
 for(let t=0;t<DURATION;t+=.13){const f=frameAt(t);assert(Math.abs(f.pack.A.w*f.pack.A.h-6)<1e-7);if(f.moving||f.illustration)assert.equal(f.report,null);else assert.deepEqual(f.report,check(f.pack));}
 for(const key of['couple-bound','space-path','metric-fixed','metric-box','proof-exclude','proof-witness','proof-continuous','proof-limit','transfer'])assert(SCENES.some(s=>s.key===key));
});
test('trial edits remain isolated and restore exact semantic time',()=>{
 const t=SCENES.find(s=>s.key==='overlap-area').start+2.375,s=newSession();seek(s,t);const before=frameAt(t).pack;enterTrial(s,'D');edit(s,p=>{p.D.x=2;p.D.y=3;});assert(check(s.trial).legal);assert.equal(check(s.trial).bbox.area,36);assert.equal(s.time,t);assert.deepEqual(frameAt(t).pack,before);leaveTrial(s);assert.equal(s.time,t);assert.deepEqual(frameAt(s.time).pack,before);enterTrial(s,'E');seek(s,0);assert.equal(s.trial,null);assert.equal(s.history.length,0);
});
test('unattended questions reveal after ten seconds and resume after four; holds do not expire',()=>{
 const q=questionClock();assert.equal(advanceQuestion(q,9.9),null);assert.equal(advanceQuestion(q,.1),'reveal');assert.equal(advanceQuestion(q,3.9),null);assert.equal(advanceQuestion(q,.2),'continue');const held=questionClock();held.held=true;assert.equal(advanceQuestion(held,100),null);assert.equal(held.left,10);
});
test('new labs require transfer constraints and real metric evidence, not just a legal repair',()=>{
 for(const task of LAB08_TASKS){const p=REVIEW_WITNESSES[task.id],r=check(p),e={width:r.bbox.w,height:r.bbox.h,density:100*r.packingDensity,explanation:'论证证据'.repeat(12)};assert(assessLab08(p,task.id,e).ok,task.id);assert(!assessLab08(p,task.id,{...e,density:28.75}).ok);assert(!assessLab08(task.seed,task.id,e).ok);}
 const p=REVIEW_WITNESSES.boundary;assert(!assessLab08(p,'tall',{width:8,height:3,density:95.83}).ok);assert(checkExercise08('translated',{actual:24,bug:42}));assert(!checkExercise08('translated',{actual:24,bug:24}));assert(!checkExercise08('one-move',{x:6.01,y:.01,w:8.01,h:3.01}));
});
