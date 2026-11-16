// Lab4: postfix -> slicing tree -> sizes -> coordinates. Reuses Lab2/Lab3 contracts.
import{CATALOG02,auditRows,copy,describeError02}from'./legality02.mjs';
import{metricsReport,BASE03,TRADEOFF03}from'./metrics03.mjs';
export{CATALOG02,BASE03,TRADEOFF03,copy};
export const STANDARD04='A D H B V C V E V';
export const OVERFLOW04='A D V B V C V E V';
export const SWAP04='D A H B V C V E V';
export const PINWHEEL04=[['P',0,0,3,2],['Q',3,0,2,3],['R',2,3,3,2],['S',0,2,2,3],['M',2,2,1,1]];
export const PINWHEEL_OUTLINE04=[5,5];
export const PINWHEEL_CATALOG04={P:[3,2],Q:[2,3],R:[3,2],S:[2,3],M:[1,1]};
export function tokenize04(expression){
 if(typeof expression!=='string')throw Error('表达式必须是字符串');
 const tokens=expression.trim().split(/\s+/).filter(t=>t.length);
 if(!tokens.length)throw Error('表达式为空');
 for(const t of tokens)if(!/^[A-Za-z]$/.test(t)&&t!=='H'&&t!=='V')throw Error('无法识别的符号：'+t+'（只允许单个字母、H、V，用空格分隔）');
 return tokens;
}
function describe04(code){
 const[k,detail]=code.split(':');
 return({underflow:'读到'+detail+'时栈里不足两个区域（前缀下溢）',leftover:'读完后栈里剩'+detail+'个区域，组合没有完成',unknown:'出现清单之外的模块'+detail,duplicate:'模块'+detail+'出现了两次',missing:'模块'+detail+'没有出现',empty:'表达式没有符号'})[k]||code;
}
// Two phases per the lesson: sizes bottom-up while building, then coordinates top-down.
export function decodePostfix(expression,catalog=CATALOG02){
 let tokens;try{tokens=tokenize04(expression);}catch(e){return{ok:false,errors:[e.message],tree:null,size:null,coords:null,rows:[],events:[],tokens:[],failure:{code:'syntax',index:0,token:null,stack:[],reason:e.message}};}
 const errors=[],events=[],stack=[],seen=new Map();let failure=null,index=0;
 const snapshot=()=>stack.map(r=>({ids:collectIds(r.node),w:r.size.w,h:r.size.h,pack:copy(r.pack),node:r.node}));
 for(const token of tokens){
  if(token==='H'||token==='V'){
   if(stack.length<2){failure={code:'underflow',index,next:index+1,token,stack:snapshot(),reason:'读到 '+token+' 时栈里只有 '+stack.length+' 个区域，组合需要 2 个（前缀下溢）'};errors.push('underflow:'+token);break;}
   const b=stack.pop(),a=stack.pop();
   const node={id:token,op:token,left:a.node,right:b.node,size:token==='H'?{w:Math.max(a.size.w,b.size.w),h:a.size.h+b.size.h}:{w:a.size.w+b.size.w,h:Math.max(a.size.h,b.size.h)}};
   const pack={};
   for(const[id,r]of Object.entries(a.pack))pack[id]={...r};
   for(const[id,r]of Object.entries(b.pack))pack[id]={x:r.x+(token==='V'?a.size.w:0),y:r.y+(token==='H'?a.size.h:0),w:r.w,h:r.h};
   stack.push({node,size:node.size,pack});
  }else{
   const key=token.toUpperCase();
   if(!Object.hasOwn(catalog,key)){failure={code:'unknown',index,next:index+1,token,stack:snapshot(),reason:'模块 '+token+' 不在清单里'};errors.push('unknown:'+token);break;}
   if(seen.has(key)){failure={code:'duplicate',index,next:index+1,token,stack:snapshot(),reason:'模块 '+token+' 出现了两次'};errors.push('duplicate:'+token);break;}
   seen.set(key,true);
   const[w,h]=catalog[key];
   stack.push({node:{id:key,size:{w,h}},size:{w,h},pack:{[key]:{x:0,y:0,w,h}}});
  }
  const top=stack[stack.length-1];
  events.push({token,index,stack:snapshot(),pack:copy(top.pack),region:[top.size.w,top.size.h],node:top.node,ok:errors.length===0});
  index++;
 }
 if(errors.length)return{ok:false,errors:errors.map(describe04),tree:null,size:null,coords:null,rows:[],events,tokens,failure};
 const missing=Object.keys(catalog).filter(id=>!seen.has(id));
 if(missing.length)return{ok:false,errors:['缺少模块：'+missing.join('、')+'（每块必须恰好出现一次）'],tree:null,size:null,coords:null,rows:[],events,tokens,failure:{code:'missing',index:tokens.length,next:tokens.length+1,token:null,stack:snapshot(),reason:'读完了，但清单里的 '+missing.join('、')+' 没有出现'}};
 if(stack.length!==1){failure={code:'leftover',index:tokens.length,next:tokens.length+1,token:null,stack:snapshot(),reason:'读完了，栈里还剩 '+stack.length+' 个区域，组合没有完成'};errors.push('leftover:'+stack.length);return{ok:false,errors:[describe04('leftover:'+stack.length)],tree:null,size:null,coords:null,rows:[],events,tokens,failure};}
 const root=stack[0].node,coords={},rows=[];
 (function place(n,x,y){if(!n.op){coords[n.id]={x,y,w:n.size.w,h:n.size.h};rows.push([n.id,x,y,n.size.w,n.size.h]);return;}
  if(n.op==='H'){place(n.left,x,y);place(n.right,x,y+n.left.size.h);}
  else{place(n.left,x,y);place(n.right,x+n.left.size.w,y);}
 })(root,0,0);
 rows.sort((a,b)=>a[0]<b[0]?-1:1);
 return{ok:true,errors:[],tokens,tree:root,size:{...root.size},coords,rows,events,failure:null};
}
// Ordered list of coordinate-propagation steps, used by the stepwise lab bench.
export function coordinateSteps(root){
 const steps=[],placed={};let cursor=0;
 (function visit(n,x,y,from){
  if(!n.op){placed[n.id]={x,y,w:n.size.w,h:n.size.h};steps.push({kind:'leaf',ref:n,nodeId:n.id,label:n.id+' '+n.size.w+'×'+n.size.h,origin:[x,y],from,placed:copy(placed)});return;}
  steps.push({kind:'node',ref:n,nodeId:n.id,label:n.op+' '+n.size.w+'×'+n.size.h,origin:[x,y],from,placed:copy(placed),size:[n.size.w,n.size.h]});
  if(n.op==='H'){visit(n.left,x,y,{parent:n.id,side:'下',offset:[0,0],parentOrigin:[x,y]});visit(n.right,x,y+n.left.size.h,{parent:n.id,side:'上',offset:[0,n.left.size.h],sibling:[n.left.size.w,n.left.size.h],parentOrigin:[x,y]});}
  else{visit(n.left,x,y,{parent:n.id,side:'左',offset:[0,0],parentOrigin:[x,y]});visit(n.right,x+n.left.size.w,y,{parent:n.id,side:'右',offset:[n.left.size.w,0],sibling:[n.left.size.w,n.left.size.h],parentOrigin:[x,y]});}
 })(root,0,0,null);
 return steps;
}
function collectIds(node){return node.op?collectIds(node.left)+collectIds(node.right):node.id;}
export function treeToText(node){return node.op?treeToText(node.left)+' '+treeToText(node.right)+' '+node.op:node.id;}
export function findSubtree(node,pred){if(pred(node))return node;for(const child of[node.left,node.right]){if(child){const hit=findSubtree(child,pred);if(hit)return hit;}}return null;}
export function guillotineCuts(rows,outline){
 const W=outline[0],H=outline[1],vertical=[],horizontal=[];
 const xs=[...new Set(rows.flatMap(r=>[r[1],r[1]+r[3]]))].sort((a,b)=>a-b),ys=[...new Set(rows.flatMap(r=>[r[2],r[2]+r[4]]))].sort((a,b)=>a-b);
 const crosses=(c,vert)=>rows.some(r=>vert?(c>r[1]+1e-9&&c<r[1]+r[3]-1e-9):(c>r[2]+1e-9&&c<r[2]+r[4]-1e-9));
 for(const c of xs)if(c>1e-9&&c<W-1e-9&&!crosses(c,true)&&rows.some(r=>r[1]<c-1e-9)&&rows.some(r=>r[1]+r[3]>c+1e-9))vertical.push(c);
 for(const c of ys)if(c>1e-9&&c<H-1e-9&&!crosses(c,false)&&rows.some(r=>r[2]<c-1e-9)&&rows.some(r=>r[2]+r[4]>c+1e-9))horizontal.push(c);
 return{vertical,horizontal};
}
export function decodeRows04(expression,catalog=CATALOG02,outline=[10,8]){
 const r=decodePostfix(expression,catalog);
 if(!r.ok)return{...r,check:null,report:null};
 const check=auditRows(r.rows,outline,catalog);
 return{...r,check,report:metricsReport(r.rows,outline,catalog)};
}
export const TREE04=decodePostfix(STANDARD04).tree;
export const SWAP_TREE04=decodePostfix(SWAP04).tree;
export const OVERFLOW_ROWS04=decodePostfix(OVERFLOW04).rows;
export const SWAP_ROWS04=decodePostfix(SWAP04).rows;
export const TASKS04=[
 {id:'repair',title:'任务一：修复一条无法完成组合的表达式',
  prompt:'表达式 A D H B V C V E 在最后一步报错。修改它，使五个模块恰好各出现一次、栈里最后只剩一个区域，并且解码结果完整放进10×8外框。任务另有两条公开约定：沿用讲解里的做法，A 在下、D 在上（即解码后 A 的 y=0、D 的 y=2）；其余三块不限。提交修改后的表达式，并写下最后一区域尺寸。',
  broken:'A D H B V C V E',outline:[10,8],expression:'A D H B V C V E',
  fields:[['w','最后区域的宽'],['h','最后区域的高']],
  hint:'读完后栈里剩两个区域，说明还缺一次组合。补上组合符号（或调整符号）后再逐符号检查一遍前缀条件。'},
 {id:'rebuild',title:'任务二：为 7×4 的目标布局写一条表达式',
  prompt:'目标布局固定：A(0,0,3×2)、B(3,0,2×3)、D(0,2,3×1)、C(5,0,2×2)、E(5,2,2×2)，包围盒7×4。写一条后缀表达式，使解码坐标与目标完全一致（逐块相等），并保持完整放进10×8。',
  outline:[10,8],expression:'A D H B V C V E V',
  fields:[['w','包围盒宽'],['h','包围盒高']],
  hint:'先找第一刀：竖线x=5把C、E与其它三块分开。右侧是C在下、E在上（H）；左侧是A、D先合成，再与B做V。'},
 {id:'constrain',title:'任务三：保持 A D H 子树，把盒宽压到 8 以内',
  prompt:'规则：表达式必须包含子树"A 在下、D 在上"（即存在 H 节点，左孩子 A、右孩子 D），其余自由。目标：解码结果完整放进10×8，且包围盒宽≤8。提交表达式与最终盒宽。只交换两个2×2的C、E不算过关（那样盒宽仍是9）。',
  outline:[10,8],expression:'A D H B V C V E V',
  fields:[['w','包围盒宽'],['h','包围盒高']],
  hint:'宽度的瓶颈是E的右边缘。把E放到别的方向试试：E放在A D H区域上方不增加宽度；再接B、C时用V。'}
];
const exact=v=>String(v??'').trim()!==''&&Number.isFinite(Number(v));
export function assess04(id,expression,e={},attempted=false){
 const task=TASKS04.find(t=>t.id===id);if(!task)return{ok:false,errors:['未知任务']};
 const errors=[];
 if(!attempted)errors.push('先修改输入，再提交。加载示例不算独立完成。');
 const r=decodeRows04(expression,task.outline?CATALOG02:CATALOG02,task.outline);
 if(!r.ok){errors.push('表达式无法解码：'+r.errors.join('；'));return{ok:false,errors,report:r.report};}
 if(!r.check.legal)errors.push('解码结果没有通过Lab2检查：'+r.check.errors.map(describeError02).join('，'));
 if(id==='repair'){
  if(expression.trim()===task.broken)errors.push('表达式还没有修改。');
  const need=r.coords?.A&&r.coords?.D&&r.coords.A.y===0&&r.coords.D.y===2;
  if(!need)errors.push('本任务沿用讲解的约定：A 在下、D 在上（A 的 y=0，D 的 y=2）。当前解码不符合。');
  if(!exact(e.w)||Number(e.w)!==r.size.w||!exact(e.h)||Number(e.h)!==r.size.h)errors.push('最后区域尺寸填写与解码结果不一致。');
 }
 if(id==='rebuild'){
  const target=TRADEOFF03;
  if(!r.coords||Object.keys(r.coords).length!==5)errors.push('解码结果必须包含全部五个模块。');
  else{for(const row of target){const got=r.coords[row[0]];if(!got||got.x!==row[1]||got.y!==row[2]||got.w!==row[3]||got.h!==row[4])errors.push('模块'+row[0]+'的坐标与目标不一致：目标 ('+row[1]+','+row[2]+') '+row[3]+'×'+row[4]+'。');}}
  if(!exact(e.w)||Number(e.w)!==r.report?.bbox?.width||!exact(e.h)||Number(e.h)!==r.report?.bbox?.height)errors.push('包围盒宽高填写与解码结果不一致。');
 }
 if(id==='constrain'){
  const adh=findSubtree(r.tree,n=>n.op==='H'&&n.left.id==='A'&&n.right.id==='D');
  if(!adh)errors.push('树里没有找到"左A右D的H子树"——A 和 D 必须先合成一个区域。');
  if(!r.report?.bbox||r.report.bbox.width>8)errors.push('包围盒宽必须≤8；当前是'+(r.report?.bbox?.width??'—')+'。想想E的右边缘在哪里。');
  if(expression.replace(/\s+/g,' ')==='A D H B V E V C V')errors.push('只交换了两个2×2的C、E，盒宽仍是9，不能作为本任务的过关方式。');
  if(!exact(e.w)||Number(e.w)!==r.report?.bbox?.width||!exact(e.h)||Number(e.h)!==r.report?.bbox?.height)errors.push('包围盒宽高填写与解码结果不一致。');
 }
 return{ok:errors.length===0,errors:[...new Set(errors)],report:r.report,size:r.size,coords:r.coords,check:r.check};
}
export const EXERCISES04=[
 {id:'swap-children',title:'1. 交换操作数：尺寸不变，坐标改变',prompt:'表达式 A D H 与 D A H 的组合区域尺寸各是多少？两种解码中 A 的 y 坐标分别是多少？（区域尺寸按"宽,高"填，y 坐标填整数）',fields:[['w1','A D H 的区域宽',3,0],['h1','A D H 的区域高',3,0],['y1','A D H 中 A 的 y',0,0],['y2','D A H 中 A 的 y',1,0]],rubric:'两种组合区域都是3×3（宽取max(3,3)，高2+1或1+2）。A D H 中A在下，y=0；D A H 中A在上（D高1），y=1。尺寸相同但坐标不同：表达式结构相同的一类编辑能改变落点。'},
 {id:'underflow',title:'2. 计数正确，前缀照样下溢',prompt:'表达式 A H D B V C V E V：五个模块 A、B、C、D、E 各出现一次，四个组合符号，字母数正好比运算符多一——总数没有多也没有少。它错在哪里？读到 H（第 2 个记号）时，栈里有几个区域？H 需要几个？',fields:[['have','读 H 时栈里的区域数',1,0],['need','H 需要的区域数',2,0]],rubric:'错在顺序：总数守恒，但读到第 2 个记号 H 时只压入了 A，栈里 1 个区域，组合需要 2 个，当场下溢。把同一批字母换成 A D H B V C V E V，前缀条件就成立、最后正好剩一个区域。数量守恒不等于每一步都合法——前缀条件必须在读符号时检查，不能等读完再数。'},
 {id:'first-cut',title:'3. 标准 9×3 布局有几条合法第一刀？',prompt:'对标准布局 A(0,0)、D(0,2)、B(3,0)、C(5,0)、E(7,0)（10×8外框）做切线扫描：有几条贯穿切线不穿过任何模块内部、且把布局分成两个非空部分？',fields:[['cuts','合法第一刀条数',3,0]],rubric:'3条，全是竖线：x=3（左A、D｜右B、C、E）、x=5、x=7。所有横线候选都会穿过某个模块内部（或一侧为空）。能找到第一刀是切片布局的必要特征。'},
 {id:'pinwheel',title:'4. 为什么风车布局写不出切片表达式？',prompt:'风车布局（5×5）：P(0,0,3×2)、Q(3,0,2×3)、R(2,3,3×2)、S(0,2,2×3)、M(2,2,1×1)。竖线 x=2.5 会穿过几个模块的内部？（提示：逐块检查 2.5 是否落在其开区间内）',fields:[['cross','x=2.5 穿过的模块数',3,0]],rubric:'3个：P（x=0…3）、M（x=2…3）、R（x=2…5）。逐条扫描可验证全部候选切线都被挡住，没有第一刀，因此不存在对应的切片树。注意Lab3的6×4=24紧凑见证同样是这种结构——本课26880份切片编码全部穷举，最小面积只到25，所以那张24布局切片写不出来。'}
];
export function checkExercise04(id,v){const q=EXERCISES04.find(q=>q.id===id);return!!q&&q.fields.every(([k,,n,tol=0])=>String(v[k]??'').trim()!==''&&Number.isFinite(Number(v[k]))&&Math.abs(Number(v[k])-n)<=tol);}
export const WITNESSES04={repair:'A D H B V C V E V',rebuild:'A D H B V C E H V',constrain:'A D H E H B V C V'};
