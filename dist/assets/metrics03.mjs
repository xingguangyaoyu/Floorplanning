// Metrics use the complete Lab2 validator. Invalid layouts retain only diagnostic geometry.
import{BASE02,CATALOG02,auditRows,copy}from'./legality02.mjs';
import{BEST}from'./core.mjs';
export{BASE02 as BASE03,CATALOG02 as CATALOG03,copy};
export const BEST03=Object.entries(BEST).map(([id,r])=>[id,r.x,r.y,r.w,r.h]);
export const shiftRows=(rows,dx,dy)=>rows.map(([id,x,y,w,h])=>[id,x+dx,y+dy,w,h]);
export function metricsReport(rows,outline=[10,8],catalog=CATALOG02){const check=auditRows(rows,outline,catalog),moduleArea=Object.values(catalog).reduce((n,[w,h])=>n+w*h,0),outlineArea=outline[0]*outline[1];let bbox=null;
 if(rows.length&&rows.every(r=>r.slice(1).every(Number.isFinite)&&r[3]>0&&r[4]>0)){const xmin=Math.min(...rows.map(r=>r[1])),ymin=Math.min(...rows.map(r=>r[2])),xmax=Math.max(...rows.map(r=>r[1]+r[3])),ymax=Math.max(...rows.map(r=>r[2]+r[4]));bbox={xmin,ymin,xmax,ymax,width:xmax-xmin,height:ymax-ymin,area:(xmax-xmin)*(ymax-ymin)};}
 const valid=check.legal&&bbox&&bbox.area>0;return{legal:check.legal,errors:check.errors,module_area:moduleArea,outline_area:outlineArea,bbox,outline_density:valid?moduleArea/outlineArea:null,packing_density:valid?moduleArea/bbox.area:null,outline_dead:valid?outlineArea-moduleArea:null,bbox_dead:valid?bbox.area-moduleArea:null};
}
export const THREE03={P:[3,2],Q:[2,2],R:[1,2]};
export const CANDIDATES03=[
{id:'wide',title:'X：横排',rows:[['P',0,0,3,2],['Q',3,0,2,2],['R',5,0,1,2]]},
{id:'tall',title:'Y：上下组合',rows:[['P',0,0,3,2],['Q',0,2,2,2],['R',2,2,1,2]]},
{id:'overlap',title:'Z：看起来更小',rows:[['P',0,0,3,2],['Q',1,0,2,2],['R',3,0,1,2]]}
];
const eMoved=copy(BASE02);eMoved[4][1]=5;eMoved[4][2]=2;export const TRADEOFF03=eMoved;
export const TASKS03=[
{id:'translation',title:'任务一：给错误的包围盒公式找反例',prompt:'外框换成12×10，使用下面这份6×4布局。将所有模块整体至少右移2格、上移1格，保持合法。提交真包围盒与错误公式max(x+w)×max(y+h)的结果，解释为什么二者不同。',outline:[12,10],catalog:CATALOG02,rows:BEST03,hint:'整体平移改变最大边缘，也改变最小坐标。真正的宽、高都要减去最小值。'},
{id:'selection',title:'任务二：同样面积的方案，谁能进新外框？',prompt:'换成P=3×2、Q=2×2、R=1×2三块，禁止旋转。目标框4×4。从X/Y/Z中选一份完整合法且包围盒面积最小的方案。先按约束过滤，再排名；不要只挑屏幕上最小的盒子。',outline:[4,4],catalog:THREE03,rows:CANDIDATES03[0].rows,hint:'X、Y的包围盒面积相同，但宽高不同。Z更小的原因，先交给Lab2检查器核对。'},
{id:'tradeoff',title:'任务三：宽变小了，面积也一定变小吗？',prompt:'这道题外框换成11×7。A/B/C/D固定，只移动E。要求完整合法、盒宽≤7、盒高≤4。提交当前盒面积、盒内空余和两种密度，并判断盒面积相比起始27有没有改善。',outline:[11,7],catalog:CATALOG02,rows:BASE02,hint:'看看C上方能否放E。宽度缩小以后，高度也可能改变；最后要重新相乘。'}
];
const exact=(v,n)=>String(v??'').trim()!==''&&Number.isFinite(n)&&Number(v)===n;
const percentage=(v,n)=>String(v??'').trim()!==''&&Number.isFinite(n)&&Number.isFinite(Number(v))&&Math.abs(Number(v)-100*n)<=.02;
export function assess03(id,rows,e={}){const task=TASKS03.find(t=>t.id===id);if(!task)return{ok:false,errors:['未知任务']};const r=metricsReport(rows,task.outline,task.catalog),errors=[];
 if(id==='translation'){const dx=rows[0]?.[1]-BEST03[0][1],dy=rows[0]?.[2]-BEST03[0][2];if(!Number.isInteger(dx)||!Number.isInteger(dy)||dx<2||dy<1||!rows.every((a,i)=>a.length===5&&a[0]===BEST03[i]?.[0]&&a[1]===BEST03[i][1]+dx&&a[2]===BEST03[i][2]+dy&&a[3]===BEST03[i][3]&&a[4]===BEST03[i][4])||rows.length!==BEST03.length)errors.push('需要整体至少右移2格、上移1格，不能改单块位置或尺寸。');if(!r.legal)errors.push('平移后仍须完整放进12×10。');for(const[k,n]of[['width',r.bbox?.width],['height',r.bbox?.height],['area',r.bbox?.area],['bad',r.bbox?r.bbox.xmax*r.bbox.ymax:NaN]])if(!exact(e[k],n))errors.push('包围盒或错误公式的提交值与当前布局不一致。');}
 if(id==='selection'){if(e.choice!=='tall'||!r.legal||JSON.stringify(rows)!==JSON.stringify(CANDIDATES03[1].rows))errors.push('还没有选中符合4×4约束的合法方案。');if(!exact(e.wide,12)||!exact(e.tall,12)||!exact(e.fake,8))errors.push('请分别算X、Y和Z的几何包围盒面积；几何面积不等于有效得分。');}
 if(id==='tradeoff'){if(!r.legal)errors.push('布局仍不合法：'+r.errors.join('，'));if(!rows.every(a=>a.slice(1).every(Number.isInteger)))errors.push('本实验位置与尺寸都取整数。');for(const name of['A','B','C','D'])if(JSON.stringify(rows.find(a=>a[0]===name))!==JSON.stringify(BASE02.find(a=>a[0]===name)))errors.push(name+'必须保持原位与尺寸。');if(!r.bbox||r.bbox.width>7||r.bbox.height>4)errors.push('盒宽必须≤7，盒高必须≤4。');if(!exact(e.area,r.bbox?.area)||!exact(e.dead,r.bbox_dead)||!percentage(e.outline,r.outline_density)||!percentage(e.packing,r.packing_density))errors.push('请重新计算盒面积、盒内空余和两个不同分母的百分数。');if(e.improved!=='no')errors.push('再把当前盒面积与起始27比较，别只看宽度。');}
 return{ok:errors.length===0,errors:[...new Set(errors)],report:r};
}
export const EXERCISES03=[
{id:'shift',title:'1. 平移为什么不应改变压紧得分？',prompt:'一份6×4合法布局的最小坐标原为(0,0)。整体平移(+3,+2)，仍在12×10内。算真包围盒面积与错误公式max(x+w)×max(y+h)，说明这个测试能排除什么错误。',fields:[['true','真包围盒面积',24,0],['bad','错误公式结果',54,0]],rubric:'最大右边缘9、最高边缘6，错误公式54。正确宽=9−3=6、高=6−2=4，面积24。只测试原点布局时，漏减最小坐标的程序会偶然正确。'},
{id:'invalid',title:'2. 一个“得分更高”的非法方案，能参加排名吗？',prompt:'原五块中，只把E移到(6,0)，其余不动。它的几何包围盒是多少？有人据此报23/24≈95.83%。说明为什么报告必须拒绝这个优化分数，不必重新推导碰撞公式。',fields:[['area','几何包围盒面积',24,0],['overlap','C/E交叠面积',2,0]],rubric:'几何盒8×3=24，C/E交叠2。Lab2报告非法，两个密度与两种空余不作为有效得分。面积和23重复计入交集，不能把23/24当作合法占用率。'},
{id:'budget',title:'3. 两种“留15%空余”，算出来一样吗？',prompt:'换一个总模块面积40的项目。甲说空余/模块面积=15%；乙说空余/总区域面积=15%。分别算总区域面积，乙保留两位小数。指出哪个量作分母，别把预算等式当成可行布局的证明。',fields:[['a','甲的总区域面积',46,0],['b','乙的总区域面积',40/.85,.01]],rubric:'甲：总区域40×1.15=46，空余6。乙：40/(1−0.15)≈47.06，空余约7.06。分母不同导致预算不同；两式都不直接保证有满足形状/固定外框的摆法。'},
{id:'tradeoff',title:'4. 宽缩小了两格，面积却怎样了？',prompt:'起始盒9×3，修改后盒7×4，模块总面积仍23，使用同一11×7外框。算修改后的盒面积、外框密度和包围盒密度（百分数，两位小数），解释为什么不能只用宽度评价。',fields:[['area','修改后的盒面积',28,0],['outline','外框密度（%）',2300/77,.02],['packing','包围盒密度（%）',2300/28,.02]],rubric:'面积从27升至28；外框密度仍23/77≈29.87%，包围盒密度降至23/28≈82.14%。宽小了，高却从3变4，宽度目标和面积目标不是一回事。'}
];
export function checkExercise03(id,v){const q=EXERCISES03.find(q=>q.id===id);return!!q&&q.fields.every(([k,,n,tol])=>String(v[k]??'').trim()!==''&&Number.isFinite(Number(v[k]))&&Math.abs(Number(v[k])-n)<=tol);}
export const WITNESSES03={translation:shiftRows(BEST03,3,2),tradeoff:TRADEOFF03};
