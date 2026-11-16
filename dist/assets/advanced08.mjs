import{GOLDEN,BEST,clone,inspect}from'./core.mjs?v=b7d4c6912114';
export const REPACKED={A:{x:0,y:0,w:2,h:3},B:{x:2,y:0,w:2,h:3},C:{x:4,y:0,w:2,h:2},D:{x:4,y:2,w:3,h:1},E:{x:7,y:0,w:2,h:2}};
export const TALL_WITNESS={A:{x:0,y:0,w:2,h:3},B:{x:2,y:0,w:2,h:3},C:{x:0,y:3,w:2,h:2},D:{x:0,y:5,w:3,h:1},E:{x:2,y:3,w:2,h:2}};
export const LAB08_TASKS=[
 {id:'tall',title:'任务一：换一种包围盒，做到4×6',prompt:'保持A=(0,0,2,3)，禁止旋转，在整数网格上重新摆放B—E，得到完整合法的4×6包围盒。讲解中的6×4布局不能直接通过。',seed:{...clone(GOLDEN),A:{x:0,y:0,w:2,h:3}},hint:'两个高为3的模块可以形成下方一层；再考虑两个2×2和3×1如何填上方。'},
 {id:'hard',title:'任务二：固定形状也能达到24吗？',prompt:'保持A=(0,0,3,2)，禁止旋转，找出完整合法的6×4布局。对比任务一，解释为什么两份24不能证明变形一定带来收益。',seed:clone(GOLDEN),hint:'A上方与右侧可以分别留给方块和高模块；D只有1高，适合填低矮区域。'},
 {id:'boundary',title:'任务三：只动E，反驳“必须先变差”',prompt:'从给定包围盒27的布局出发，A/B/C/D全不动，只移动E，使布局合法且包围盒≤24。用这个反例区分“一条路径”与“所有路径”。',seed:clone(REPACKED),hint:'先找C右侧到E左侧之间的空隙。E不一定要放到C上方。'}
];
export function assessLab08(pack,taskId,evidence={}){
 const task=LAB08_TASKS.find(t=>t.id===taskId),s=inspect(pack,undefined,undefined,{soft:true}),errors=[];
 if(!task)return{ok:false,errors:['未知任务']};
 if(!s.legal)errors.push('完整布局仍不合法：'+s.errors.map(e=>e.code+':'+e.ids.join('/')).join('；'));
 if(!Object.values(pack).every(r=>['x','y','w','h'].every(k=>Number.isInteger(r[k]))))errors.push('本任务要求尺寸与坐标均为整数。');
 const a=pack.A;if(!a||a.x!==0||a.y!==0||a.w!==(taskId==='hard'?3:2)||a.h!==(taskId==='hard'?2:3))errors.push('A没有保持本任务规定的位置和形状。');
 if(taskId==='tall'&&(s.bbox.w!==4||s.bbox.h!==6))errors.push('目标是4×6，不能只检查面积24。');
 if(taskId==='hard'&&(s.bbox.w!==6||s.bbox.h!==4))errors.push('目标是保持A原形状的6×4布局。');
 if(taskId==='boundary'){for(const id of['A','B','C','D'])if(JSON.stringify(pack[id])!==JSON.stringify(task.seed[id]))errors.push(id+'应保持原位和尺寸。');if(s.bbox.area>24)errors.push('只动E后仍未压到24或更小。');}
 for(const[k,actual,label,tol]of[['width',s.bbox.w,'包围盒宽',1e-8],['height',s.bbox.h,'包围盒高',1e-8],['density',s.packingDensity==null?NaN:100*s.packingDensity,'包围盒密度（百分数）',.02]])if(evidence[k]===''||!Number.isFinite(Number(evidence[k]))||Math.abs(Number(evidence[k])-actual)>tol)errors.push(label+'的提交值与当前布局不一致。');
 return{ok:errors.length===0,errors,report:s,explanationProvided:String(evidence.explanation||'').trim().length>=40};
}
export const EXERCISES08=[
 {id:'one-move',title:'1. 只动E，能不能直接变紧？',prompt:'从任务三的27布局出发，只动E。提交E的新坐标和最终包围盒，解释为什么它足以反驳“所有压紧路径都必须先变差”。不要把动画中的搬运过程当成已经验证的无碰撞轨迹。',fields:[['x','E的新x',6],['y','E的新y',0],['w','盒宽',8],['h','盒高',3]],rubric:'E=(6,0)，盒8×3=24；与C在x=6接触、与D在y=2接触，没有内部重叠。该编辑端点直接改进，足以否定“所有路径必须先变差”；它没有证明任意连续搬运路径无碰撞。'},
 {id:'translated',title:'2. 整张图移了位置，面积为什么不该变？',prompt:'取任务一4×6的合法布局，整体平移(+2,+1)，仍在10×8框内。分别计算正确盒面积与错误公式max(x+w)·max(y+h)。解释为什么仅测试原点布局发现不了这个错误。',fields:[['actual','正确盒面积',24],['bug','错误公式的结果',42]],rubric:'正确值仍是4×6=24。最大右边缘变6、最大上边缘变7，错误公式得到42；应减最小x=2和最小y=1。平移不变量能排除只在原点偶然正确的程序。'},
 {id:'union',title:'3. 有重叠时，23还能当作实际占地面积吗？',prompt:'只把原布局A改成2×3，其余不动。计算五矩形并集面积与实际占外框的百分比，并解释为何23/27不能作为合法压紧得分。',fields:[['union','矩形并集面积',21],['coverage','并集/外框（%）',26.25]],rubric:'只有A/D重叠2，面积和23需减重叠2，并集为21；21/80=26.25%。23/27把重叠重复计算，且布局未通过约束，不能作为有效优化得分。'},
 {id:'certificate',title:'4. 怎样证明24不能再小？允许小数后呢？',prompt:'分开写出：整数模型的面积下界、排除面积23的理由、达到下界的合法见证。再讨论允许小数坐标后原证明哪一步失效。最后判断软/硬形状两份24分别能证明什么。',fields:[['lower','最终整数下界',24],['witness','达到下界的见证面积',24]],rubric:'无重叠完整性给≥23；整数坐标与尺寸给整数W/H；23质数，只能1×23或23×1，容不下固定C2×2，因此≥24。提交合法24坐标才闭合证明。小数坐标使盒边长可能非整数，原排除法不能直接沿用；这不自动证明连续最优值小于24。两形状都达到24不支持变形优于固定形状最优。'}
];
export function checkExercise08(id,values){const q=EXERCISES08.find(q=>q.id===id);if(!q)return false;return q.fields.every(([key,,expected])=>{const n=Number(values[key]);return values[key]!==''&&Number.isFinite(n)&&(key==='coverage'?Math.abs(n-expected)<.02:Number.isInteger(n)&&n===expected);});}
// Independently checked witnesses used by tests/review; never auto-loaded as student answers.
export const REVIEW_WITNESSES={tall:TALL_WITNESS,hard:BEST,boundary:{...clone(REPACKED),E:{x:6,y:0,w:2,h:2}}};
