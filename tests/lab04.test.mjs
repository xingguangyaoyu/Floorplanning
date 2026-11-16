import test from'node:test';import assert from'node:assert/strict';
import{BASE02,CATALOG02,auditRows,copy}from'../dist/assets/legality02.mjs';
import{STANDARD04,OVERFLOW04,SWAP04,decodePostfix,decodeRows04,assess04,checkExercise04,TASKS04,EXERCISES04,WITNESSES04,TREE04,PINWHEEL04,PINWHEEL_OUTLINE04,PINWHEEL_CATALOG04,guillotineCuts,treeToText,findSubtree}from'../dist/assets/slicing04.mjs';
import{sceneAt,playbackState,seekState,beginTrial,endTrial,editTrial}from'../dist/assets/interactive-state.mjs';import data from'../dist/lessons/04/teaching/lesson-data.mjs';import{renderScene}from'../dist/lessons/04/teaching/visuals.mjs';
test('decoder reproduces the taught standard layout and its coordinates',()=>{
 const r=decodePostfix(STANDARD04);assert(r.ok);
 assert.deepEqual(r.size,{w:9,h:3});
 assert.deepEqual(r.coords,{A:{x:0,y:0,w:3,h:2},D:{x:0,y:2,w:3,h:1},B:{x:3,y:0,w:2,h:3},C:{x:5,y:0,w:2,h:2},E:{x:7,y:0,w:2,h:2}});
 assert.deepEqual(r.rows.map(r=>r[0]),['A','B','C','D','E']);
 assert(auditRows(r.rows,[10,8],CATALOG02).legal);
 assert.equal(treeToText(TREE04),'A D H B V C V E V');
 const events=r.events;assert.equal(events.length,9);assert.equal(events[2].stack.length,1);assert.equal(events[2].stack[0].w,3);assert.equal(events[2].stack[0].h,3);assert.equal(events.at(-1).stack.length,1);
 assert.deepEqual(events[1].pack.D,{x:0,y:0,w:3,h:1});
});
test('operand swap keeps size but moves coordinates; overflow stays syntactically valid',()=>{
 const sw=decodePostfix(SWAP04);assert(sw.ok);assert.deepEqual(sw.size,{w:9,h:3});assert.equal(sw.coords.A.y,1);assert.equal(sw.coords.D.y,0);
 const ov=decodePostfix(OVERFLOW04);assert(ov.ok);assert.deepEqual(ov.size,{w:12,h:3});assert.equal(ov.coords.E.x,10);
 assert.equal(auditRows(ov.rows,[10,8],CATALOG02).legal,false);assert(auditRows(ov.rows,[10,8],CATALOG02).errors.includes('outside:E'));
});
test('structural errors are readable and typed: underflow, leftover, duplicate, unknown, missing',()=>{
 const cases=[['A H','下溢'],['A D H B V C V E','剩2个区域'],['A A H','出现了两次'],['A F H','清单之外'],['A D H B V C V','缺少模块']];
 for(const[expr,needle]of cases){const r=decodePostfix(expr);assert.equal(r.ok,false,expr);assert(r.errors.some(e=>e.includes(needle)),expr+' -> '+r.errors.join(';'));}
 const partial=decodePostfix('A H');assert.deepEqual(partial.rows,[]);assert.equal(partial.tree,null);
});
test('three lab tasks accept only witnesses that satisfy their own constraints',()=>{
 const assess=(id,expr,extra={})=>{const r=decodeRows04(expr,CATALOG02,TASKS04.find(t=>t.id===id).outline);const e={w:r.size?.w,h:r.size?.h,...extra};return assess04(id,expr,e,true);};
 for(const[id,expr]of Object.entries(WITNESSES04)){const res=assess(id,expr);assert(res.ok,id+' witness: '+res.errors.join(';'));}
 assert(!assess04('repair','A D H B V C V E',{w:null,h:null},false).ok);
 const ceSwap=assess('constrain','A D H B V E V C V');assert(!ceSwap.ok);assert(ceSwap.errors.some(e=>e.includes('2×2')));
 const badTarget=assess('rebuild','A D H B V C V E V');assert(!badTarget.ok);
 const adh=decodePostfix(WITNESSES04.constrain);assert(findSubtree(adh.tree,n=>n.op==='H'&&n.left.id==='A'&&n.right.id==='D'));
});
test('pinwheel counterexample has no guillotine first cut anywhere',()=>{
 const cuts=guillotineCuts(PINWHEEL04,PINWHEEL_OUTLINE04);assert.deepEqual(cuts,{vertical:[],horizontal:[]});
 for(let c=1;c<5;c++){const crossedV=PINWHEEL04.some(r=>c>r[1]&&c<r[1]+r[3]);assert(crossedV,'vertical '+c+' must cross an interior');const crossedH=PINWHEEL04.some(r=>c>r[2]&&c<r[2]+r[4]);assert(crossedH,'horizontal '+c+' must cross an interior');}
 const pinCheck=auditRows(PINWHEEL04,PINWHEEL_OUTLINE04,PINWHEEL_CATALOG04);assert(pinCheck.legal);
 assert.deepEqual(guillotineCuts(decodePostfix(STANDARD04).rows,[10,8]).vertical,[3,5,7]);
});
test('exercises check exact numbers with reasons recorded separately',()=>{
 assert(checkExercise04('swap-children',{w1:3,h1:3,y1:0,y2:1}));
 assert(!checkExercise04('swap-children',{w1:3,h1:3,y1:1,y2:0}));
 assert(checkExercise04('underflow',{have:1,need:2}));
 assert(checkExercise04('first-cut',{cuts:3}));
 assert(!checkExercise04('first-cut',{cuts:4}));
 assert(checkExercise04('pinwheel',{cross:3}));
 assert.equal(EXERCISES04.length,4);assert.equal(TASKS04.length,3);
});
test('Lab4 timeline: intro precedes knowledge scenes; boundaries and reused audio cohere',()=>{
 assert.equal(data.scenes.length,25);assert.equal(data.chapters.length,8);
 assert.deepEqual(data.scenes.slice(0,3).map(s=>s.key),['intro-context','intro-task','intro-preview']);
 assert(data.scenes.slice(0,3).every(s=>s.chapter===1&&s.delivery===(data.newSpeech?'voice':'reading')&&!s.question));
 assert.equal(data.scenes[3].key,'notation');assert.equal(data.scenes[3].chapter,2);
 assert.equal(data.scenes.filter(s=>s.question).length,4);assert.equal(data.cuts.length,data.newSpeech?0:8);if(data.newSpeech){assert.equal(data.readingSeconds,0);assert.equal(data.utterances.length,data.scenes.length);assert(data.scenes.every(s=>s.wordCues?.length));}
 let cursor=0;for(const s of data.scenes){assert(Math.abs(s.start-cursor)<1e-5);assert(s.end>s.start);cursor=s.end;}
 assert(Math.abs(cursor-data.duration)<1e-5);
 for(const c of data.captions)if(c.delivery==='reading')assert.deepEqual(c.words,[]);
 const voiced=data.captions.filter(c=>c.delivery==='voice');assert.equal(voiced.length,data.newSpeech?data.captions.length:8);
 for(const s of data.scenes)if(s.voice)if(data.newSpeech)assert.equal(s.voice,data.voice);else assert(['encoding','guess','combine','push','full','checks','overflow','try'].includes(s.voice),s.key+' voice '+s.voice);
});
test('all Lab4 teaching views render finite, non-negative SVG for every authored scene',()=>{
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
test('shared player trial remains isolated on Lab4 scenes',()=>{
 const s=playbackState();seekState(s,60,data.duration);const scene=sceneAt(data.scenes,s.time),before=copy(scene.rows);
 beginTrial(s,scene,0);editTrial(s,rows=>{if(rows[0])rows[0][1]+=1;});assert.equal(s.time,60);
 endTrial(s);assert.equal(s.time,60);assert.equal(s.trial,null);assert.deepEqual(scene.rows,before);
});
