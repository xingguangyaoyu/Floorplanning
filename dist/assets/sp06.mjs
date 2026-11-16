// Lab6: sequence pair -> constraint graph -> longest-path coordinates. Reuses Lab2/Lab3 contracts.
import{CATALOG02,copy,describeError02}from'./legality02.mjs';import{metricsReport}from'./metrics03.mjs';
export{CATALOG02,copy,describeError02};
export const STD_SP06={pos:'ABCED',neg:'DABCE'};
export const ROW_SP06={pos:'ABCDE',neg:'ABCDE'};
export const MULTI_SP06=[{pos:'ABDCE',neg:'DACEB'},{pos:'ABDCE',neg:'DCAEB'},{pos:'ABDCE',neg:'DCEAB'}];
export function decodeSP06(pos,neg,catalog=CATALOG02){
 const clean=s=>String(s??'').replace(/\s+/g,'').toUpperCase().split('');
 const P=clean(pos),N=clean(neg),errors=[];
 const ids=Object.keys(catalog);
 for(const[label,seq]of[['pos',P],['neg',N]]){
  if(seq.length!==ids.length)errors.push(label+'行的模块数不对（应为'+ids.length+'个）');
  else if(new Set(seq).size!==seq.length)errors.push(label+'行有重复模块');
  else if(seq.some(id=>!Object.hasOwn(catalog,id)))errors.push(label+'行出现清单之外的模块'+seq.filter(id=>!Object.hasOwn(catalog,id)).join('、'));
 }
 if(errors.length)return{ok:false,errors,graph:null,order:[],coords:null,rows:[],events:[]};
 const H=[],V=[];
 for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++)(N.indexOf(P[i])<N.indexOf(P[j])?H:V).push([P[i],P[j]]);
 const coords={},events=[];
 for(const id of P){
  const[w,h]=catalog[id];
  const hPred=H.filter(e=>e[1]===id).map(e=>e[0]),vPred=V.filter(e=>e[1]===id).map(e=>e[0]);
  let x=0,y=0,keyX=null,keyY=null;
  for(const p of hPred){const bound=coords[p].x+coords[p].w;if(bound>x){x=bound;keyX=p;}}
  for(const p of vPred){const bound=coords[p].y+coords[p].h;if(bound>y){y=bound;keyY=p;}}
  coords[id]={x,y,w,h};
  events.push({id,x,y,w,h,hPred,vPred,keyX,keyY,pack:copy(coords)});
 }
 const rows=Object.entries(coords).map(([id,v])=>[id,v.x,v.y,v.w,v.h]).sort((a,b)=>a[0]<b[0]?-1:1);
 const check=metricsReport(rows,[10,8],catalog);
 return{ok:true,errors:[],graph:{H,V},order:[...P],coords,rows,events,check,report:check};
}
export const STD06=decodeSP06(STD_SP06.pos,STD_SP06.neg);
export const ROW06=decodeSP06(ROW_SP06.pos,ROW_SP06.neg);
export const MULTI06=MULTI_SP06.map(e=>decodeSP06(e.pos,e.neg));
export const TASKS06=[
 {id:'decode-eval',title:'任务一：手算一个多前驱节点的坐标',
  prompt:'编码 pos=ABDCE、neg=DACEB。按拓扑序（pos 本身）逐点取最大值，提交：E 的 x、E 的 y，以及 C 的水平前驱个数（不是竖直）。先在纸上建图：每一对模块按两行次序分类。',
  outline:[10,8],pos:'ABDCE',neg:'DACEB',startPos:'ABCED',startNeg:'DABCE',
  fields:[['ex','E 的 x'],['ey','E 的 y'],['ch','C 的水平前驱个数']],
  hint:'先序就是 pos。C 的水平前驱是在两个排列中都排在 C 之前的模块；E 的 x 要越过 C 的右边缘。'},
 {id:'overflow-sp',title:'任务二：构造不重叠但越界的序列对',
  prompt:'10×8 外框不变。给出一对排列，使解码结果互不重叠（序列对保证），但包围盒越过外框。提交该编码的包围盒宽，并回答它能否作为合法布局使用（能填1，不能填0）。',
  outline:[10,8],pos:'ABCDE',neg:'ABCDE',startPos:'ABCED',startNeg:'DABCE',
  fields:[['w','包围盒宽'],['usable','能否直接使用（1/0）']],
  hint:'两个排列完全相同时，所有同序对都是水平约束：全部模块排成一行。'},
 {id:'same-geometry',title:'任务三：两份编码，同一张布局',
  prompt:'布局 A(0,0)、B(3,0)、D(0,3)、C(3,3)、E(5,3) 至少有三个序列对编码。提交两份不同的编码（pos/neg），使它们的解码结果逐块完全一致，且都通过 Lab2 检查。',
  outline:[10,8],pos:'ABDCE',neg:'DACEB',startPos:'ABCED',startNeg:'DABCE',
  fields:[['pos2','第二份编码 pos'],['neg2','第二份编码 neg']],
  hint:'第一份就用 pos=ABDCE、neg=DACEB。第二份只调整 neg 里不影响约束的方向：试试交换 C、E、D 在第二行的相对次序。'}
];
export function assess06(id,inputs={},e={},attempted=false){
 const task=TASKS06.find(t=>t.id===id);if(!task)return{ok:false,errors:['未知任务']};
 const errors=[];
 if(!attempted)errors.push('先修改输入，再提交。加载示例不算独立完成。');
 if(id==='decode-eval'){
  const r=decodeSP06(inputs.pos,inputs.neg);
  if(!r.ok){errors.push('编码无法解码：'+r.errors.join('；'));return{ok:false,errors};}
  if(inputs.pos!==task.pos||inputs.neg!==task.neg)errors.push('本任务固定使用 pos=ABDCE、neg=DACEB。');
  const E=r.coords.E,C=r.coords.C;
  const chCount=r.events.find(ev=>ev.id==='C').hPred.length;
  if(!Number.isFinite(Number(e.ex))||Number(e.ex)!==E.x||!Number.isFinite(Number(e.ey))||Number(e.ey)!==E.y)errors.push('E 的坐标提交值与解码结果不一致（E=('+E.x+','+E.y+')）。');
  if(!Number.isFinite(Number(e.ch))||Number(e.ch)!==chCount)errors.push('C 的水平前驱个数与建图结果不一致（实际'+chCount+'个）。');
 }
 if(id==='overflow-sp'){
  const r=decodeSP06(inputs.pos,inputs.neg);
  if(!r.ok){errors.push('编码无法解码：'+r.errors.join('；'));return{ok:false,errors};}
  if(!r.report.legal&&r.report.errors.some(err=>!err.startsWith('outside')))errors.push('除越界外还有其它错误：'+r.report.errors.join('，'));
  const b=r.report.bbox;
  if(!b||!(b.width>10||b.height>8))errors.push('包围盒还没有越界：需要宽>10 或高>8。');
  if(!Number.isFinite(Number(e.w))||Number(e.w)!==b.width)errors.push('包围盒宽提交值与解码结果不一致。');
  if(Number(e.usable)!==0)errors.push('越界布局不能直接使用：应填0，交给外框检查处理。');
 }
 if(id==='same-geometry'){
  const r1=decodeSP06(task.pos,task.neg),r2=decodeSP06(inputs.pos2,inputs.neg2);
  if(!r1.ok){errors.push('基准编码无法解码。');return{ok:false,errors};}
  if(!r2.ok){errors.push('第二份编码无法解码：'+r2.errors.join('；'));return{ok:false,errors};}
  if(!r2.report.legal)errors.push('第二份编码的布局没有通过Lab2检查。');
  const norm=r=>Object.entries(r.coords).sort((a,b)=>a[0]<b[0]?-1:1).map(([id,v])=>id+':'+v.x+','+v.y+','+v.w+','+v.h).join('|');
  if(norm(r1)!==norm(r2))errors.push('两份编码的解码结果不一致：要逐块坐标完全相同。');
  const same=inputs.pos2.replace(/\s+/g,'').toUpperCase()===task.pos.toUpperCase()&&inputs.neg2.replace(/\s+/g,'').toUpperCase()===task.neg.toUpperCase();
  if(same)errors.push('第二份编码与第一份完全相同——请找一个不同的编码。');
 }
 return{ok:errors.length===0,errors:[...new Set(errors)],report:decodeSP06(inputs.pos||task.pos,inputs.neg||task.neg).ok?decodeSP06(inputs.pos||task.pos,inputs.neg||task.neg).report:null};
}
export const EXERCISES06=[
 {id:'max-not-sum',title:'1. 两个下界，为什么取最大而不是相加？',prompt:'某模块有两个水平前驱：一个要求 x≥3，另一个要求 x≥5。最小可行 x 是多少？两个下界如果相加会得到什么？',fields:[['x','最小可行 x',5,0]],rubric:'x=5。约束是“同时满足所有下界”，取最大；相加得到8是把“越过每块”错当成“距离累加”——前驱之间可能本来就有先后约束，相加会重复计入。'},
 {id:'pred-count',title:'2. 标准编码里，D 有几个竖直前驱？',prompt:'标准编码 pos=ABCED、neg=DABCE 中，D 的竖直前驱是哪些模块？共几个？其中谁真正决定了 D 的 y=3？',fields:[['count','竖直前驱个数',4,0]],rubric:'A、B、C、E 都在 D 下方（4个）。y 取最大：A顶2、B顶3、C顶2、E顶2，B 是关键前驱。前驱多不代表都起作用——这正是最长路径的“关键约束”概念。'},
 {id:'multi-encoding',title:'3. 同一张布局能有几个编码？',prompt:'本课枚举了全部 14400 个编码对：它们解码出 12966 份不同布局，其中 1234 份布局有不止一个编码，最多一份布局对应几个编码？',fields:[['max','一份布局最多的编码数',3,0]],rubric:'最多3个。例如 ABDCE/DACEB、ABDCE/DCAEB、ABDCE/DCEAB 解码出同一张布局。多对一意味着搜索空间有冗余：不同编码可能得到同一布局，比较算法时要意识到这一点。'},
 {id:'fit-boundary',title:'4. 标准编码的包围盒装得进 10×8 吗？',prompt:'标准编码 ABCED/DABCE 的包围盒宽、高各是多少？面积呢？',fields:[['w','包围盒宽',9,0],['h','包围盒高',4,0]],rubric:'9×4=36。宽9≤10、高4≤8，装得下。注意它与Lab5标准树的27不是同一份编码——比较的是“指定编码的解码结果”，不是表示法的优劣。'}
];
export function checkExercise06(id,v){const q=EXERCISES06.find(q=>q.id===id);return!!q&&q.fields.every(([k,,n,tol=0])=>String(v[k]??'').trim()!==''&&Number.isFinite(Number(v[k]))&&Math.abs(Number(v[k])-n)<=tol);}
export const WITNESSES06={'decode-eval':{pos:'ABDCE',neg:'DACEB'},'overflow-sp':{pos:'ABCDE',neg:'ABCDE'},'same-geometry':{pos:'ABDCE',neg:'DCAEB'}};