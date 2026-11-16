import test from'node:test';import assert from'node:assert/strict';
import{BASE02,CATALOG02,copy}from'../dist/assets/legality02.mjs';
import{STD_SP06,ROW_SP06,MULTI_SP06,STD06,ROW06,MULTI06,decodeSP06,assess06,checkExercise06,TASKS06,EXERCISES06,WITNESSES06}from'../dist/assets/sp06.mjs';
import{sequencePair}from'../dist/assets/core.mjs';
import{sceneAt,playbackState,seekState,beginTrial,endTrial,editTrial}from'../dist/assets/interactive-state.mjs';import data from'../dist/lessons/06/teaching/lesson-data.mjs';import{renderScene}from'../dist/lessons/06/teaching/visuals.mjs';
test('decoder matches the reference kernel and gives D y=3 from B',()=>{
 const r=STD06;assert(r.ok);
 assert.deepEqual(JSON.parse(JSON.stringify(r.coords)),JSON.parse(JSON.stringify(sequencePair(STD_SP06.pos,STD_SP06.neg).pack)));
 assert.equal(r.coords.D.y,3);assert.equal(r.events.find(e=>e.id==='D').keyY,'B');
 assert.equal(r.graph.H.length,6);assert.equal(r.graph.V.length,4);
 assert.equal(r.report.bbox.area,36);assert(r.report.legal);
});
test('all ten pairs classified exactly once; pos is a topological order',()=>{
 const r=STD06;assert.equal(r.graph.H.length+r.graph.V.length,10);
 for(const[a,b]of[...r.graph.H,...r.graph.V])assert(r.order.indexOf(a)<r.order.indexOf(b),'edge must follow pos order');
 assert.deepEqual(r.order,['A','B','C','E','D']);
});
test('identical permutations overflow: 12 wide, still non-overlapping',()=>{
 const r=ROW06;assert(r.ok);assert.equal(r.coords.E.x,10);assert.equal(r.report.bbox.width,12);
 assert.equal(r.report.legal,false);assert(r.report.errors.some(e=>e.startsWith('outside')));
 for(let i=0;i<r.rows.length;i++)for(let j=i+1;j<r.rows.length;j++)assert(!(r.rows[i][1]<r.rows[j][1]+r.rows[j][3]&&r.rows[j][1]<r.rows[i][1]+r.rows[i][3]&&r.rows[i][2]<r.rows[j][2]+r.rows[j][4]&&r.rows[j][2]<r.rows[i][2]+r.rows[i][4]));
});
test('permutation errors are typed before any decoding',()=>{
 for(const[pos,neg,needle]of[['ABCED','DABC','模块数'],['ABCED','DABCC','重复'],['ABCED','DABCF','清单之外']]){
  const r=decodeSP06(pos,neg);assert.equal(r.ok,false);assert(r.errors.some(e=>e.includes(needle)),pos+'/'+neg+' -> '+r.errors.join(';'));assert.deepEqual(r.rows,[]);}
});
test('three encodings decode to the same layout',()=>{
 const packs=MULTI_SP06.map(e=>JSON.stringify(decodeSP06(e.pos,e.neg).coords));
 assert.deepEqual(packs[0],packs[1]);assert.deepEqual(packs[1],packs[2]);
 const r=decodeSP06('ABDCE','DACEB');assert(r.report.legal);assert.equal(r.coords.C.x,3);assert.equal(r.coords.E.x,5);
});
test('three lab tasks accept only witnesses satisfying their own constraints',()=>{
 assert(assess06('decode-eval',{pos:'ABDCE',neg:'DACEB'},{ex:5,ey:3,ch:2},true).ok);
 assert(!assess06('decode-eval',{pos:'ABDCE',neg:'DACEB'},{ex:5,ey:3,ch:1},true).ok);
 assert(!assess06('decode-eval',{pos:'ABCED',neg:'DABCE'},{ex:7,ey:2,ch:2},true).ok);
 assert(assess06('overflow-sp',{pos:'ABCDE',neg:'ABCDE'},{w:12,usable:0},true).ok);
 assert(!assess06('overflow-sp',{pos:'ABCDE',neg:'ABCDE'},{w:12,usable:1},true).ok);
 assert(!assess06('overflow-sp',{pos:'ABCED',neg:'DABCE'},{w:9,usable:0},true).ok);
 assert(assess06('same-geometry',{pos2:'ABDCE',neg2:'DCAEB'},{},true).ok);
 assert(!assess06('same-geometry',{pos2:'ABDCE',neg2:'DACEB'},{},true).ok);
 assert(!assess06('same-geometry',{pos2:'ABCDE',neg2:'ABCDE'},{},true).ok);
 assert(!assess06('overflow-sp',{pos:'ABCDE',neg:'ABCDE'},{w:12,usable:0},false).ok);
});
test('exercises check exact numbers with reasons recorded separately',()=>{
 assert(checkExercise06('max-not-sum',{x:5}));
 assert(!checkExercise06('max-not-sum',{x:8}));
 assert(checkExercise06('pred-count',{count:4}));
 assert(checkExercise06('multi-encoding',{max:3}));
 assert(checkExercise06('fit-boundary',{w:9,h:4}));
 assert.equal(EXERCISES06.length,4);assert.equal(TASKS06.length,3);
});
test('Lab6 timeline: intro precedes knowledge scenes; boundaries and reused audio cohere',()=>{
 assert.equal(data.scenes.length,18);assert.equal(data.chapters.length,8);
 assert.deepEqual(data.scenes.slice(0,3).map(s=>s.key),['intro-why','intro-task','intro-preview']);
 assert(data.scenes.slice(0,3).every(s=>s.chapter===1&&s.delivery==='reading'&&!s.question));
 assert.equal(data.scenes.filter(s=>s.question).length,2);assert.equal(data.cuts.length,8);assert.equal(data.newSpeech,false);
 let cursor=0;for(const s of data.scenes){assert(Math.abs(s.start-cursor)<1e-5);assert(s.end>s.start);cursor=s.end;}
 assert(Math.abs(cursor-data.duration)<1e-5);
 for(const c of data.captions)if(c.delivery==='reading')assert.deepEqual(c.words,[]);
 for(const s of data.scenes)if(s.voice)assert(['two','same','reverse','maximum','predict','result','row','code'].includes(s.voice),s.key+' voice '+s.voice);
 const predict=data.scenes.find(s=>s.key==='std-result');
});
test('all Lab6 teaching views render finite, non-negative SVG for every authored scene',()=>{
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
test('shared player trial remains isolated on Lab6 scenes',()=>{
 const s=playbackState();seekState(s,60,data.duration);const scene=sceneAt(data.scenes,s.time),before=copy(scene.rows);
 beginTrial(s,scene,0);editTrial(s,rows=>{if(rows[0])rows[0][1]+=1;});assert.equal(s.time,60);
 endTrial(s);assert.equal(s.time,60);assert.equal(s.trial,null);assert.deepEqual(scene.rows,before);
});
