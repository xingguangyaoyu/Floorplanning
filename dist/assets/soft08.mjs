// Lab8 finale: multi-soft-module shape frontier and joint search. Reuses slicing/SP kernels.
import{CATALOG02,copy,describeError02}from'./legality02.mjs';import{metricsReport}from'./metrics03.mjs';import{slicing,sequencePair,inspect,seedRandom}from'./core.mjs';
export{CATALOG02,copy,describeError02};
export const FRONTIER_TREE='A B V C H';
export const FRONTIER_OUTLINE=[5,5];
export const SHAPE_CANDIDATES={A:{area:6,shapes:[[2,3],[3,2]]},B:{area:12,shapes:[[3,4],[4,3]]},C:{area:3,shapes:[[3,1]]}};
// Shape combination = index triple into SHAPE_CANDIDATES[m].shapes
export function decodeShapes08(treeText,choice,catalog=SHAPE_CANDIDATES){
 const modules=Object.keys(catalog).map(id=>({id,w:catalog[id].shapes[choice[id]][0],h:catalog[id].shapes[choice[id]][1]}));
 const r=slicing(treeText,modules);
 return{size:[r.w,r.h],area:r.w*r.h,pack:r.pack,shapes:choice};
}
export function shapeFrontier(treeText,catalog=SHAPE_CANDIDATES,outline=FRONTIER_OUTLINE){
 const ids=Object.keys(catalog);
 const combos=[];
 function walk(i,choice){if(i===ids.length){combos.push({...choice});return;}
  for(let s=0;s<catalog[ids[i]].shapes.length;walk(i+1,{...choice,[ids[i]]:s}),s++);}
 walk(0,{});
 const decoded=combos.map(choice=>{const d=decodeShapes08(treeText,choice,catalog);return{choice,size:d.size,area:d.area,pack:d.pack,fit:d.size[0]<=outline[0]&&d.size[1]<=outline[1]};});
 decoded.sort((a,b)=>a.area-b.area||a.size[0]-b.size[0]);
 const frontier=decoded.filter(c=>!decoded.some(o=>o!==c&&o.size[0]<=c.size[0]&&o.size[1]<=c.size[1]&&(o.size[0]<c.size[0]||o.size[1]<c.size[1])));
 return{tree:treeText,outline,candidates:decoded,frontier,fitting:decoded.filter(c=>c.fit)};
}
export const FRONTIER08=shapeFrontier(FRONTIER_TREE);
// Attribution witness: hard A=3×2 + B=2×3 cannot enter 4×3; A soft can take 2×3.
export const ATTRIBUTION08={hardRegion:[5,3],softRegion:[4,3],outline:[4,3],hardFits:false,softFits:true};
// Three-config joint search on the A/B/C instance with a sequence-pair encoding.
const SP_SEED='ABC',SP_SEED_NEG='CAB';
const SP_START={A:1,B:1,C:0};  // 3×2 + 4×3 in ABC/CAB: 7×4, width 7 exceeds 5
const SHAPES08=[{A:[2,3],B:[3,4],C:[3,1]},{A:[2,3],B:[4,3],C:[3,1]},{A:[3,2],B:[3,4],C:[3,1]},{A:[3,2],B:[4,3],C:[3,1]}];
const OUT08=[5,5];
function spEnergy(pair,choice){const m=Object.keys(SHAPE_CANDIDATES).map(id=>({id,w:SHAPE_CANDIDATES[id].shapes[choice[id]][0],h:SHAPE_CANDIDATES[id].shapes[choice[id]][1]}));
 try{const r=sequencePair(pair[0],pair[1],m);const s=inspect(r.pack,OUT08,m);return s.bbox.area+100*(Math.max(0,s.bbox.w-OUT08[0])+Math.max(0,s.bbox.h-OUT08[1]));}catch(e){return 1e9;}}
function spPack(pair,choice){const m=Object.keys(SHAPE_CANDIDATES).map(id=>({id,w:SHAPE_CANDIDATES[id].shapes[choice[id]][0],h:SHAPE_CANDIDATES[id].shapes[choice[id]][1]}));
 try{const r=sequencePair(pair[0],pair[1],m);const s=inspect(r.pack,OUT08,m);return s.legal&&s.bbox.w<=OUT08[0]&&s.bbox.h<=OUT08[1]?{rows:Object.entries(r.pack).map(([id,v])=>[id,v.x,v.y,v.w,v.h]).sort((a,b)=>a[0]<b[0]?-1:1),area:s.bbox.area}:null;}catch(e){return null;}}
function jointSearch(config,seed,budget){
 const rng=seedRandom(seed);const seen=new Set();let best=null,bestE=Infinity,evals=0,feasibleCount=0;
 let pair=[SP_SEED.split(''),SP_SEED_NEG.split('')],choice={...SP_START};
 const snap=()=>JSON.stringify([pair[0].join(''),pair[1].join(''),choice.A,choice.B]);
 const tryEval=()=>{evals++;const key=snap();const isNew=!seen.has(key);seen.add(key);
  const p=spPack(pair,choice);if(p)feasibleCount++;
  const e=spEnergy(pair,choice);if(e<bestE){bestE=e;best=p;}
  return{e,isNew};};
 tryEval();
 if(config==='frozen'){return{config,seed,budget,best,bestE,evals,distinct:seen.size,feasibleCount:best?1:0};}
 for(let k=1;k<budget;k++){
  const mode=config==='shapes'?'shape':(rng()<.5?'pair':'shape');
  const half=SP_SEED.length;const savePair=[...pair[0],...pair[1]],saveChoice={...choice};
  if(mode==='pair'){const seq=rng()<.5?pair[0]:pair[1];const i=Math.floor(rng()*seq.length);let j=Math.floor(rng()*(seq.length-1));if(j>=i)j++;[seq[i],seq[j]]=[seq[j],seq[i]];}
  else{const softs=['A','B'];const m=softs[Math.floor(rng()*softs.length)];choice={...choice,[m]:(choice[m]+1)%SHAPE_CANDIDATES[m].shapes.length};}
  const{e}=tryEval();
  const prev=spEnergy([savePair.slice(0,half),savePair.slice(half)],saveChoice);
  if(e<=prev){/* keep */}
  else{pair=[savePair.slice(0,half),savePair.slice(half)];choice=saveChoice;}
 }
 return{config,seed,budget,best,bestE,evals,distinct:seen.size,feasibleCount};
}
export const JOINT08={budget:30,seeds:[3,7,11],configs:['frozen','shapes','both'],
 run(){return{frozen:[3,7,11].map(s=>jointSearch('frozen',s,30)),shapes:[3,7,11].map(s=>jointSearch('shapes',s,30)),both:[3,7,11].map(s=>jointSearch('both',s,30))};}};
// precomputed deterministic summary (computed by the same kernel, asserted in tests)
export const JOINT_SUMMARY08=JOINT08.run();
export function jointSummary(){
 const s={};
 for(const cfg of['frozen','shapes','both']){
  const runs=JOINT_SUMMARY08[cfg];
  s[cfg]={feasibleSeeds:runs.filter(r=>r.best).length,bestAreas:runs.map(r=>r.best?r.best.area:null),evals:runs.map(r=>r.evals),distinct:runs.map(r=>r.distinct)};
 }
 return s;
}
export const JOINT_TABLE08=jointSummary();
// Second shape-frontier instance for task 2: different tree and outline, same catalog.
export const FRONTIER08B=shapeFrontier('A B H C V',{A:{area:6,shapes:[[2,3],[3,2]]},B:{area:12,shapes:[[3,4],[4,3]]},C:{area:3,shapes:[[3,1]]}},[6,6]);
export const TASKS08B=[
 {id:'frontier-keep',title:'收官一：为新树保留正确的形状前沿',
  prompt:'树 A B V C H。A 面积6（整数形状 2×3、3×2），B 面积12（3×4、4×3），C 固定 3×1。列出四个组合的 (宽,高)，删去被支配的候选，提交前沿中两个候选的面积之和。',
  outline:[5,5],fields:[['sum','前沿两候选面积之和']],
  hint:'(6,5)与(7,4)都被(6,4)支配：宽不更大且高不更大、至少一维严格更小。'},
 {id:'outline-filter',title:'收官二：换一棵树，按面积贪心还灵吗',
  prompt:'换一个实例：树 A B H C V（H 在前），A 面积6（2×3、3×2），B 面积12（3×4、4×3），C 固定 3×1，外框 6×6。页面前沿表只针对 A B V C H，不能照抄。请自己枚举四个形状组合、按 H 再 V 合并、删去被支配的候选，提交：前沿里面积最小的候选面积，以及唯一能放进 6×6 的前沿候选面积。',
  outline:[6,6],fields:[['minArea','前沿里面积最小的候选面积'],['fitArea','能放进 6×6 的前沿候选面积']],
  hint:'H 先把 A、B 上下叠（宽取max、高相加），再与 C 做 V（宽相加、高取max）。面积最小那份宽度超过 6。'},
 {id:'three-config',title:'收官三：三配置等预算对照',
  prompt:'运行页面按钮：同一解码器、同一初始编码（含一个放不进 5×5 的形状组合）、同一候选形状全集、同一外框，种子{3,7,11}×最多30次评估。冻结基线只评估初始布局一次（不为它凑预算）。提交：三种子里"能找到可行布局"的种子数（冻结/只搜形状/形状+拓扑）。哪个变量带来收益，结论只针对哪个实例？',
  outline:[5,5],fields:[['frozen','冻结配置找到可行的种子数'],['shapes','只搜形状找到可行的种子数'],['both','形状+拓扑找到可行的种子数']],
  hint:'初始形状组合在 ABC/CAB 下是 7×4，宽7超过外框5；只搜形状能换到 2×3 与 3×4 的组合。'}
];
const exact=(v,n)=>String(v??'').trim()!==''&&Number.isFinite(Number(v))&&Number(v)===n;
export function assess08B(id,e={},attempted=false){
 const errors=[];
 if(!attempted)errors.push('先运行/计算，再提交。加载示例不算独立完成。');
 if(id==='frontier-keep'){
  const sum=FRONTIER08.frontier.reduce((n,c)=>n+c.area,0);
  if(!exact(e.sum,sum))errors.push('前沿两候选面积之和应为'+sum+'（'+FRONTIER08.frontier.map(c=>c.size[0]+'×'+c.size[1]+'='+c.area).join(' 与 ')+'）。');
 }
 if(id==='outline-filter'){
  const b=FRONTIER08B;
  if(!b.frontier.length){errors.push('第二个实例没有任何前沿候选——与核验结果不符，请重新计算。');}
  else{
   const min=Math.min(...b.frontier.map(c=>c.area));
   if(!exact(e.minArea,min))errors.push('前沿里面积最小的是 '+min+'（'+b.frontier.filter(c=>c.area===min).map(c=>c.size[0]+'×'+c.size[1]).join('、')+'）。');
   if(!b.fitting.length)errors.push('没有候选能进 6×6——与核验结果不符。');
   else if(!exact(e.fitArea,b.fitting[0].area))errors.push('能放进 6×6 的候选面积应为 '+b.fitting[0].area+'（'+b.fitting[0].size[0]+'×'+b.fitting[0].size[1]+'）：面积最小的那份宽度是 '+b.frontier.filter(c=>c.area===min)[0].size[0]+'，超过外框。');
  }
 }
 if(id==='three-config'){
  const s=JOINT_TABLE08;
  if(!exact(e.frozen,s.frozen.feasibleSeeds)||!exact(e.shapes,s.shapes.feasibleSeeds)||!exact(e.both,s.both.feasibleSeeds))errors.push('可行种子数与页面运行结果不一致（冻结'+s.frozen.feasibleSeeds+'、只搜形状'+s.shapes.feasibleSeeds+'、形状+拓扑'+s.both.feasibleSeeds+'）。');
 }
 return{ok:errors.length===0,errors:[...new Set(errors)]};
}
export const EXERCISES08B=[
 {id:'greedy-fail',title:'1. 只留最小面积为什么会错？',prompt:'前沿里两个候选的面积各是多少？若实现只保留面积最小的候选、再按 5×5 外框过滤，结果是什么？',fields:[['min','最小面积候选',24,0],['kept','只留最小后能进框的候选数',0,0]],rubric:'最小24（6×4）宽6超框，被过滤后什么都不剩。正确做法：前沿同时保留(6,4)与(5,5)，过滤后才有一份可用。'},
 {id:'dominance',title:'2. 支配删除的适用条件',prompt:'(6,5) 被 (6,4) 支配。删除被支配候选的理由里，"另一个候选宽和高都不更大、至少一维严格更小"之外还需要什么前提？（本题目标只看宽高）',fields:[['cond','若目标还包含别的指标，能否仍这样删？（能1/不能0）',0,0]],rubric:'仅在本课"目标只含宽高、组合单调"的模型下可删。若加入引脚、位置或其它目标，被支配的宽高候选可能胜出，删除规则不再适用——填0。'},
 {id:'attribution',title:'3. 硬软各 24 能证明变形有收益吗？',prompt:'五块算例里 A 硬 3×2 与 A 软 2×3 都能达到 24；另一个构造例：A 硬 3×2、B 硬 2×3 在 4×3 框不可行，A 允许 2×3 后区域变为 4×3 可行。前者能证明收益吗？后者说明什么？',fields:[['first','前者能证明（1/0）',0,0]],rubric:'不能（填0）：24 是"硬软都有"的见证，不能归因于变形。构造例才是收益证据：硬时区域 5×3 放不进 4×3，软时 4×3 恰好可行。两例都禁旋转，不能混用数据。'},
 {id:'joint-meaning',title:'4. 形状+拓扑联合搜索改变了什么？',prompt:'沿用页面按钮的同一初始编码 ABC/CAB（A=3×2、B=4×3、C 固定 3×1）、同一外框 5×5、同一种子 {3,7,11} 与 30 次评估。三配置为：冻结（只评初始一次）、只搜形状（拓扑固定）、形状+拓扑。请按页面输出判断两件事：(a) 从"只搜形状"到"形状+拓扑"，新增的是哪一类编辑（选一个编号：1=改软模块的形状选择，2=交换序列对元素即改拓扑，3=改外框）？(b) 形状+拓扑三个种子的最好面积是多少？',fields:[['added','新增编辑编号（1=改软模块形状选择，2=交换序列对元素即改拓扑，3=改外框）',2,0],['best','形状+拓扑三个种子的最好面积',25,0]],rubric:'(a) 填 2：只搜形状已经允许改 A/B 的形状选择，"形状+拓扑"多出来的是交换序列对元素、也就是改拓扑；反方向比较（从"只搜拓扑"到联合）新增的才是形状选择，别弄反。(b) 填 25：页面输出三种子最好面积 25/25/25，与"只搜形状"的 25/25/25 在面积上持平——本次面积收益为零，差别体现在去重候选数（4 对 12–17）与可探索的编码空间，不能把"能搜更多"当作"面积一定更好"的证据。每次编辑都要重新解码与评分。'}
];
export function checkExercise08B(id,v){const q=EXERCISES08B.find(q=>q.id===id);return!!q&&q.fields.every(([k,,n,tol=0])=>String(v[k]??'').trim()!==''&&Number.isFinite(Number(v[k]))&&Math.abs(Number(v[k])-n)<=tol);}