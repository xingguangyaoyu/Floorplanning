// Lab5: B*-tree packing with skyline. Reuses Lab2/Lab3 contracts and core geometry.
import{MODULES,OUTLINE,COLORS,clone}from'./core.mjs';import{auditRows,describeError02,CATALOG02,copy}from'./legality02.mjs';import{metricsReport,BASE03}from'./metrics03.mjs';
export{MODULES,OUTLINE,COLORS,CATALOG02,copy,describeError02};
export const GOLDEN_TREE05='A(B(C(E,-),-),D)';
export const LIFT_TREE05='C(B(A(E,-),-),D)';
export const RESIDUAL_TREE05='A(D(-,C(B(E,-),-)),-)';
export const EDIT_TREE05='A(B(C(E,D),-),-)';
export const BAD_TREE05='A(B(C(D,-),-),E)';
export function parseTree05(s){
 const tokens=s.match(/[A-Za-z][A-Za-z0-9_]*|[(),-]/g)||[];
 if(tokens.join('')!==s.replace(/\s+/g,''))throw Error('树写法有无法识别的字符（只允许字母、括号、逗号和 -）');
 let p=0;
 function read(){const id=tokens[p++];
  if(id==='-')return null;
  if(!id||/^[(),]$/.test(id))throw Error('括号或逗号位置不对');
  const n={id};
  if(tokens[p]==='('){p++;n.left=read();if(tokens[p++]!==',')throw Error('左孩子后缺少逗号');n.right=read();if(tokens[p++]!==')')throw Error('右孩子后缺少右括号');}
  return n;}
 const tree=read();
 if(p!==tokens.length||!tree)throw Error('树没有读完：检查括号是否配对');
 return tree;
}
// Reference skyline walk with teaching annotations (query interval + supporting segment).
export function bstarWalk05(tree,catalog=CATALOG02){
 if(typeof tree==='string')tree=parseTree05(tree);
 const seen=new Set(),pack={},contour=[],events=[],pre=[];
 (function collect(n){if(!n)return;if(seen.has(n.id))throw Error('duplicate:'+n.id);seen.add(n.id);pre.push(n.id);collect(n.left);collect(n.right);})(tree);
 const unknown=[...seen].filter(id=>!Object.hasOwn(catalog,id));
 if(unknown.length)throw Error('unknown:'+unknown[0]);
 function walk(n,x){
  if(!n)return;
  const[w,h]=catalog[n.id];
  const query=[x,x+w];
  let y=0,bestSeg=null;
  for(const seg of contour)if(seg.x2>x&&seg.x1<x+w&&seg.h>y){y=seg.h;bestSeg={...seg};}
  pack[n.id]={x,y,w,h};
  const next=[];
  for(const seg of contour){
   if(seg.x2<=x||seg.x1>=x+w){next.push(seg);continue;}
   if(seg.x1<x)next.push({x1:seg.x1,x2:x,h:seg.h});
   if(seg.x2>x+w)next.push({x1:x+w,x2:seg.x2,h:seg.h});
  }
  next.push({x1:x,x2:x+w,h:y+h});
  next.sort((a,b)=>a.x1-b.x1);
  const merged=[];
  for(const seg of next){
   if(merged.length&&Math.abs(merged[merged.length-1].x2-seg.x1)<1e-9&&Math.abs(merged[merged.length-1].h-seg.h)<1e-9)merged[merged.length-1]={...merged[merged.length-1],x2:seg.x2};
   else merged.push({...seg});
  }
  contour.splice(0,contour.length,...merged);
  events.push({id:n.id,x,y,w,h,query,support:bestSeg,contour:clone(contour),pack:clone(pack),treePath:pre.indexOf(n.id)});
  walk(n.left,x+w);
  walk(n.right,x);
 }
 walk(tree,0);
 const missing=Object.keys(catalog).filter(id=>!seen.has(id));
 if(missing.length)throw Error('missing:'+missing.join(','));
 return{order:pre,pack,contour:clone(contour),events};
}
export function packBstar05(tree,catalog=CATALOG02,outline=OUTLINE){
 let r;
 try{r=bstarWalk05(tree,catalog);}
 catch(e){
  const[code,detail]=String(e.message).split(':');
  const msg=({duplicate:'模块'+detail+'在树里出现了两次',unknown:'树里有清单之外的模块'+detail,missing:'这些模块没有出现在树里：'+detail})[code]||('树无法解码：'+e.message);
  return{ok:false,errors:[msg],order:[],pack:null,contour:null,events:[],rows:[]};
 }
 const rows=Object.entries(r.pack).map(([id,v])=>[id,v.x,v.y,v.w,v.h]).sort((a,b)=>a[0]<b[0]?-1:1);
 const check=auditRows(rows,outline,catalog);
 return{...r,ok:true,errors:[],rows,check,report:metricsReport(rows,outline,catalog)};
}
export function wrongOrder05(tree,catalog=CATALOG02){
 if(typeof tree==='string')tree=parseTree05(tree);
 const seen=new Set(),pack={},contour=[],events=[];
 function walk(n,x){
  if(!n)return;
  const[w,h]=catalog[n.id];
  if(seen.has(n.id))throw Error('duplicate:'+n.id);seen.add(n.id);
  let y=0;
  for(const seg of contour)if(seg.x2>x+1e-9&&seg.x1<x+w-1e-9&&seg.h>y)y=seg.h;
  pack[n.id]={x,y,w,h};
  const next=[];
  for(const seg of contour){
   if(seg.x2<=x||seg.x1>=x+w){next.push(seg);continue;}
   if(seg.x1<x)next.push({x1:seg.x1,x2:x,h:seg.h});
   if(seg.x2>x+w)next.push({x1:x+w,x2:seg.x2,h:seg.h});
  }
  next.push({x1:x,x2:x+w,h:y+h});next.sort((a,b)=>a.x1-b.x1);
  contour.splice(0,contour.length,...next);
  events.push({id:n.id,x,y,w,h,contour:clone(contour),pack:clone(pack)});
  walk(n.right,x);
  walk(n.left,x+w);
 }
 walk(tree,0);
 return{order:[...seen],pack,events};
}
export const GOLDEN05=packBstar05(GOLDEN_TREE05),LIFT05=packBstar05(LIFT_TREE05),RESIDUAL05=packBstar05(RESIDUAL_TREE05),EDIT05=packBstar05(EDIT_TREE05),BAD05=packBstar05(BAD_TREE05);
export const WRONG_ORDER05=wrongOrder05(LIFT_TREE05);
export const ENUM05={total:5040,fit:4680,minArea:24,atMin:8,overflow:360};
export const TASKS05=[
 {id:'hand-lift',title:'任务一：手算交换名称后的全部落点',
  prompt:'把标准树 A(B(C(E,-),-),D) 的名称 A 与 C 交换，得到 C(B(A(E,-),-),D)。先在纸上按先序逐块摆放并维护轮廓线，再提交 D 的坐标和包围盒面积。注意：D 是根的右孩子，与根同 x，但高度要看整个覆盖区间。',
  outline:[10,8],tree:LIFT_TREE05,startTree:GOLDEN_TREE05,
  fields:[['dx','D 的 x'],['dy','D 的 y'],['area','包围盒面积']],
  hint:'摆放松序是 C、B、A、E、D。D 覆盖 [0,3)：C 的顶部是2，B 的顶部是3，取最大。'},
 {id:'fix-contour',title:'任务二：找出错误轮廓更新',
  prompt:'一份程序在解码 C(B(A(E,-),-),D) 时把 D 的高度写成 2，理由是“D 与根 C 同 x，所以坐在 C 顶上”。这个更新错在哪里？提交 D 的正确 y 和正确包围盒面积。',
  outline:[10,8],tree:LIFT_TREE05,startTree:LIFT_TREE05,
  fields:[['dy','D 的正确 y'],['area','正确包围盒面积']],
  hint:'查询的是 D 整个覆盖区间 [0,3) 的最大值，不是父块的顶边。区间里还有谁？'},
 {id:'edit-tree',title:'任务三：移动 D，解释谁需要重摆',
  prompt:'从标准树 A(B(C(E,-),-),D) 开始，把 D 从“根的右孩子”移到“C 的右孩子”（写成 A(B(C(E,D),-),-)）。解码并提交：新的包围盒面积，以及坐标发生变化的模块名（只填一个字母）。',
  outline:[10,8],tree:EDIT_TREE05,startTree:GOLDEN_TREE05,
  fields:[['area','新包围盒面积'],['moved','坐标变化的模块（一个大写字母）']],
  hint:'右孩子与父块同 x。D 挂到 C 下面后 x 变了，y 由 C 一带的轮廓决定；A、B、C、E 都不受影响。'}
];
const exact=(v,n)=>String(v??'').trim()!==''&&Number.isFinite(Number(v))&&Number(v)===n;
export function assess05(id,treeText,e={},attempted=false){
 const task=TASKS05.find(t=>t.id===id);if(!task)return{ok:false,errors:['未知任务']};
 const errors=[];
 if(!attempted)errors.push('先修改输入，再提交。加载示例不算独立完成。');
 const r=packBstar05(treeText);
 if(!r.ok){errors.push('树无法解码：'+r.errors.join('；'));return{ok:false,errors,report:null};}
 if(!r.check.legal)errors.push('解码结果没有通过Lab2检查：'+r.check.errors.map(describeError02).join('，'));
 if(id==='hand-lift'){
  if(treeText.replace(/\s+/g,'')==='A(B(C(E,-),-),D)')errors.push('还没有交换 A 与 C 的名称。');
  const D=r.pack.D;
  if(!D||!exact(e.dx,D.x)||!exact(e.dy,D.y))errors.push('D 的坐标提交值与解码结果不一致。');
  if(!exact(e.area,r.report.bbox.area))errors.push('包围盒面积与解码结果不一致。');
 }
 if(id==='fix-contour'){
  if(treeText.replace(/\s+/g,'')!==LIFT_TREE05)errors.push('本任务固定使用树 C(B(A(E,-),-),D)，不需要改树。');
  const D=r.pack.D;
  if(!D||!exact(e.dy,D.y))errors.push('D 的正确 y 与解码结果不一致。');
  if(!exact(e.area,r.report.bbox.area))errors.push('正确包围盒面积与解码结果不一致。');
  if(D&&Number(e.dy)===2)errors.push('y=2 是“只看父块顶边”的错误结果：D 的覆盖区间里还有更高的段。');
 }
 if(id==='edit-tree'){
  if(treeText.replace(/\s+/g,'')==='A(B(C(E,-),-),D)')errors.push('还没有把 D 移到 C 的右孩子。');
  const D=r.pack.D;
  if(!D||D.x!==5||D.y!==2)errors.push('移动后的 D 应落在 (5,2)：右孩子与父块同 x，高度由那一带的轮廓决定。');
  if(!exact(e.area,r.report.bbox.area))errors.push('新包围盒面积与解码结果不一致。');
  if(String(e.moved??'').trim().toUpperCase()!=='D')errors.push('只有 D 的坐标变了；A、B、C、E 都不受影响。');
 }
 return{ok:errors.length===0,errors:[...new Set(errors)],report:r.report,pack:r.pack,events:r.events};
}
export const EXERCISES05=[
 {id:'right-child',title:'1. 右孩子一定坐在父块正上方吗？',prompt:'标准树 A(B(C(E,-),-),D) 里，D 是根 A 的右孩子，D 的 y 是多少？把名称 A 与 C 交换后（树 C(B(A(E,-),-),D)），D 仍是右孩子，y 又是多少？',fields:[['y1','标准树中 D 的 y',2,0],['y2','交换名称后 D 的 y',3,0]],rubric:'标准树里 D 恰好落在 A 顶部（y=2），这只是巧合。交换后 D 与根 C 同 x，但它的覆盖区间 [0,3) 跨到了高度3的 B 上，所以 y=3。“右孩子坐在父块上”不是算法，只是标准树里的巧合。'},
 {id:'residual',title:'2. 删掉旧区间整段，会丢掉什么？',prompt:'树 A(D(-,C(B(E,-),-)),-) 中，D 先占 [3,6)。C 放在 D 的右孩子位置（x=3、宽2），只覆盖 [3,5)，留下残段 [5,6) 高1。之后 B（C 的左孩子，x=5、宽2）落在 y=多少？这个残段是谁留下的（填 1=D、2=C、3=A）？',fields:[['by','B 的 y',1,0],['who','残段来自哪块',1,0]],rubric:'B 的查询区间 [5,7) 里最高的是残段 [5,6)=1，所以 y=1。残段是 D 留下的（D 顶=1，C 只覆盖 [3,5)）。若实现把 [3,6) 整段删掉重写，残段丢失，B 会落到 y=0 并与 D 重叠。'},
 {id:'wrong-order',title:'3. 先放右孩子，结果差多少？',prompt:'同一棵树 C(B(A(E,-),-),D)，若错误的实现先把右孩子 D 摆上、再摆左子树：D 的 y 是多少？最终包围盒面积是多少？（错误顺序：C、D、B、A、E）',fields:[['dy','错误顺序下 D 的 y',2,0],['area','错误顺序的包围盒面积',54,0]],rubric:'先放 D 时轮廓里只有 C（高2），D 落在 y=2；随后 B 落在 (2,3)、A 在 (4,0)、E 在 (7,0)，包围盒 9×6=54。正确顺序是 9×4=36。顺序是算法的一部分，不是实现细节。'},
 {id:'enum-bound',title:'4. 穷举数字的适用范围',prompt:'本课五块、固定尺寸、禁止旋转：全部有标号二叉树共 5040 棵，其中完整放进 10×8 的有多少棵？最小包围盒面积是多少？',fields:[['fit','装进 10×8 的树数',4680,0],['min','最小包围盒面积',24,0]],rubric:'42 个形状 × 120 种标号 = 5040；其中 4680 棵合法装进 10×8，360 棵越界但没有一棵内部重叠（轮廓算法保证不重叠）。最小面积 24，只有 8 棵达到。这些数字只属于当前模块清单和外框，换数据要重新枚举。'}
];
export function checkExercise05(id,v){const q=EXERCISES05.find(q=>q.id===id);return!!q&&q.fields.every(([k,,n,tol=0])=>String(v[k]??'').trim()!==''&&Number.isFinite(Number(v[k]))&&Math.abs(Number(v[k])-n)<=tol);}
export const WITNESSES05={'hand-lift':LIFT_TREE05,'fix-contour':LIFT_TREE05,'edit-tree':EDIT_TREE05};
