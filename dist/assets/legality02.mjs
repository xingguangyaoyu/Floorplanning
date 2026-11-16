// Hard-module checking and Lab2 contracts. No DOM or learner state.
export const CATALOG02={A:[3,2],B:[2,3],C:[2,2],D:[3,1],E:[2,2]};
export const BASE02=[['A',0,0,3,2],['B',3,0,2,3],['C',5,0,2,2],['D',0,2,3,1],['E',7,0,2,2]];
export const copy=x=>JSON.parse(JSON.stringify(x));
export function intersection(a,b){const dx=Math.max(0,Math.min(a[1]+a[3],b[1]+b[3])-Math.max(a[1],b[1])),dy=Math.max(0,Math.min(a[2]+a[4],b[2]+b[4])-Math.max(a[2],b[2]));return{dx,dy,area:dx*dy};}
const valid=r=>r.slice(1).every(Number.isFinite)&&r[3]>0&&r[4]>0;
export function auditRows(rows,outline=[10,8],catalog=CATALOG02){const errors=new Set(),seen=new Set(),pairs=[];
 rows.forEach(r=>{const[id,x,y,w,h]=r;if(seen.has(id))errors.add('duplicate:'+id);seen.add(id);if(!Object.hasOwn(catalog,id))errors.add('unknown:'+id);if(!valid(r)){errors.add('number:'+id);return;}if(catalog[id]&&(w!==catalog[id][0]||h!==catalog[id][1]))errors.add('shape:'+id);if(x<0||y<0||x+w>outline[0]||y+h>outline[1])errors.add('outside:'+id);});
 for(const id of Object.keys(catalog))if(!seen.has(id))errors.add('missing:'+id);
 for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++){if(!valid(rows[i])||!valid(rows[j]))continue;const r=intersection(rows[i],rows[j]);if(r.area>0){const ids=[rows[i][0],rows[j][0]].sort();errors.add('overlap:'+ids.join('/'));pairs.push({...r,ids,indices:[i,j]});}}
 return{legal:errors.size===0,errors:[...errors].sort(),pairs};
}
export function cornerOnly(a,b){const contains=(p,r)=>p[0]>=r[1]&&p[0]<=r[1]+r[3]&&p[1]>=r[2]&&p[1]<=r[2]+r[4],corners=r=>[[r[1],r[2]],[r[1]+r[3],r[2]],[r[1],r[2]+r[4]],[r[1]+r[3],r[2]+r[4]]];return corners(a).some(p=>contains(p,b))||corners(b).some(p=>contains(p,a));}
const diagnosed=copy(BASE02);diagnosed[1][0]='A';diagnosed[4][1]=9;
const broken=copy(BASE02);broken[3][1]=2;broken[3][2]=1;broken[4][1]=9;broken[4][2]=1;
export const TASKS02=[
{id:'diagnose',title:'任务一：五块都在，就一定齐全吗？',prompt:'表里仍有五个矩形。请找出全部错误，别只数总数。',rows:diagnosed,outline:[10,8],catalog:CATALOG02,options:['duplicate:A','missing:B','shape:A','outside:E','overlap:C/E','missing:D','shape:C'],hint:'先对照模块清单逐一检查名称，再检查尺寸和四条边。'},
{id:'repair',title:'任务二：只动D和E，把所有冲突修好',prompt:'这次外框改为8×4。A、B、C固定，D和E只能沿整数网格移动。先算起始时D与A、B的交集，以及E的右边缘，再修复整张布局。修好一对后，还要重新检查其他模块。',rows:broken,outline:[8,4],catalog:CATALOG02,movable:['D','E'],hint:'D往右会躲开A/B，却可能碰到C。试着给它找一条只贴边、不重叠的位置。'},
{id:'cross',title:'任务三：没有角点进去，为什么仍然重叠？',prompt:'P固定2×6，Q固定6×2，不能旋转。在8×8内摆出一种交叉：两块有正面积重叠，但任何角点都不落入另一块（含边界）。这是为了让只查角点的错误算法漏报。',rows:[['P',0,0,2,6],['Q',0,6,6,2]],outline:[8,8],catalog:{P:[2,6],Q:[6,2]},movable:['P','Q'],hint:'把一块竖着、一块横着，让它们在各自的中段交叉。'}
];
export function assess02(id,rows,evidence={}){const task=TASKS02.find(t=>t.id===id);if(!task)return{ok:false,errors:['未知任务']};const errors=[],report=auditRows(rows,task.outline,task.catalog);
 if(id==='diagnose'){const selected=[...new Set(evidence.codes||[])].sort(),expected=auditRows(task.rows,task.outline,task.catalog).errors;if(JSON.stringify(selected)!==JSON.stringify(expected))errors.push('还没有找齐，或选入了不存在的错误。请逐项对照名称、尺寸和边界。');}
 else{if(!rows.every(r=>r.slice(1).every(Number.isInteger)))errors.push('请把尺寸和位置都放在整数网格上。');for(const r of rows){const original=task.rows.find(s=>s[0]===r[0]);if(!original||r[3]!==original[3]||r[4]!==original[4])errors.push('模块尺寸不能改变。');if(original&&!task.movable.includes(r[0])&&JSON.stringify(r)!==JSON.stringify(original))errors.push(r[0]+'在本题中固定不动。');}
 if(id==='repair'){if(!report.legal)errors.push('布局仍有问题：'+report.errors.join('，'));for(const[k,n]of[['overlapA',1],['overlapB',2],['rightE',11]])if(String(evidence[k]??'').trim()===''||Number(evidence[k])!==n)errors.push('请重新计算起始布局的交集和右边缘。');}
 if(id==='cross'){const allowed=report.errors.filter(e=>!e.startsWith('overlap:'));if(allowed.length||rows.length!==2||!report.pairs.length||cornerOnly(rows[0],rows[1]))errors.push('还没有构造出目标交叉：要在框内、尺寸正确、确有重叠，而且双方角点都在另一块外面。');const actual=rows.length===2?intersection(rows[0],rows[1]).area:NaN;if(String(evidence.area??'').trim()===''||Number(evidence.area)!==actual)errors.push('提交的交叠面积与当前图形不一致。');}
 }
 return{ok:errors.length===0,errors,report};
}
export const EXERCISES02=[
{id:'boundary',title:'1. 把模块完全放进框里，要检查什么？',prompt:'外框宽10、高8。一个3×2模块左下角在(8,7)。写出右边缘和上边缘，并解释仅检查左下角为什么会漏报。',fields:[['right','右边缘',11],['top','上边缘',9]],rubric:'右边缘8+3=11，上边缘7+2=9，都超过外框。左下角在框内只是必要条件，还要检查x+w≤W、y+h≤H。'},
{id:'cross',title:'2. 一个角点都没进去，交集面积是多少？',prompt:'P=(3,1,2,6)，Q=(1,3,6,2)。分别算交集宽、高和面积，再说明为什么只查角点会失败。',fields:[['dx','交集宽',2],['dy','交集高',2],['area','交集面积',4]],rubric:'P的x为3…5、y为1…7，Q的x为1…7、y为3…5，交集2×2=4。所有角点都在另一块外部，角点法漏报，区间法仍能检查出。'},
{id:'repair',title:'3. D躲开A/B以后，为什么又撞了？',prompt:'保持原A/B/C不动，把D放到(5,1,3,1)。计算它与C=(5,0,2,2)的重叠面积。你会怎样安排每次移动后的检查？',fields:[['area','D/C重叠面积',2]],rubric:'交集x=5…7、y=1…2，面积2。需要检查移动模块与所有其它有效模块，或直接运行完整检查器；不能只复查原来的A/D和B/D。'},
{id:'capacity',title:'4. 面积明明够，为什么还是放不下？',prompt:'4×4框内放A=3×2、B=2×3，禁止旋转。算总面积、并排所需宽、上下叠放所需高，并说明这两类分离为什么排除了所有不重叠摆法。',fields:[['area','模块总面积',12],['width','横向分离所需宽',5],['height','纵向分离所需高',5]],rubric:'12<16只是面积条件。两个轴对齐矩形不重叠，至少沿x或y完全分离；横向需3+2=5>4，纵向需2+3=5>4，两种都不可能。条件是固定尺寸、禁止旋转。'}
];
export function checkExercise02(id,v){const q=EXERCISES02.find(q=>q.id===id);return!!q&&q.fields.every(([k,,n])=>String(v[k]??'').trim()!==''&&Number(v[k])===n);}
const repairedTransfer=copy(BASE02);repairedTransfer[4][1]=5;repairedTransfer[4][2]=2;
export const WITNESSES02={repair:repairedTransfer,cross:[['P',3,1,2,6],['Q',1,3,6,2]]};

export function describeError02(code){const[k,ids]=code.split(':');return({duplicate:ids+'重复',missing:'缺少'+ids,shape:ids+'尺寸与清单不符',outside:ids+'越过外框',overlap:ids?.replace('/','和')+'内部重叠',unknown:'出现未知模块'+ids,number:ids+'含无效数值'})[k]||code;}
