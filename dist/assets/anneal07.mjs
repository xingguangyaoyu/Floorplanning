// Lab7: reproducible simulated annealing over sequence pairs. Reuses the reference kernel.
import{CATALOG02,copy,describeError02}from'./legality02.mjs';import{metricsReport}from'./metrics03.mjs';import{anneal,sequencePair,energy,inspect,OUTLINE,MODULES}from'./core.mjs';
export{CATALOG02,copy,describeError02,sequencePair,energy,inspect,anneal};
export const DEFAULT_RUN07={seed:7,steps:120,temperature:12};
export const RUN07=anneal(DEFAULT_RUN07);
export const RUN07_SEED3=anneal({seed:3,steps:120,temperature:12});
export const RUN07_T2={seed7:anneal({seed:7,steps:120,temperature:2}),seed3:anneal({seed:3,steps:120,temperature:2}),seed11:anneal({seed:11,steps:120,temperature:2})};
export const RUN07_T12={seed7:RUN07,seed3:RUN07_SEED3,seed11:anneal({seed:11,steps:120,temperature:12})};
export const FIRST_ACC_UPHILL07=RUN07.events.findIndex(e=>e.delta>0&&e.accepted)+1;
export const FIRST_REJECT07=RUN07.events.findIndex(e=>!e.accepted)+1;
export function summarizeRun(run){const last=run.events.at(-1);return{best:last.bestEnergy,final:last.energy,accepted:run.events.filter(e=>e.accepted).length};}
export const COMPARISON07={seeds:[3,7,11],T12:[25,25,25],T2:[28,25,27],sumT12:75,sumT2:80};
export const TASKS07=[
 {id:'audit-steps',title:'任务一：审计一条真实轨迹',
  prompt:'运行默认轨迹（seed=7、T=12、120步，页面按钮可重放）。找出：第一个"被接受的变差步"的步号与其 ΔE；第一个"被拒绝的步"的步号与其 ΔE。四项都从日志读出，不要凭感觉。',
  outline:[10,8],seed:7,T:12,steps:120,
  fields:[['accStep','第一个被接受的变差步（步号）'],['accDelta','该步的 ΔE'],['rejStep','第一个被拒绝的步（步号）'],['rejDelta','该步的 ΔE']],
  hint:'变差=ΔE>0。日志里每步都有 delta 与 accepted 两列；第2步附近有个大 ΔE 被拒。'},
 {id:'fix-state',title:'任务二：修复"拒绝后当前被修改"的状态机',
  prompt:'默认轨迹的第2步被拒绝（ΔE=96）。一个有bug的实现把这一步之后的当前能量写成了候选能量。提交：正确的第2步之后的当前能量，以及正确实现里第6步（被接受的变差）之后的当前能量。',
  outline:[10,8],seed:7,T:12,steps:120,
  fields:[['curAfter2','第2步后的当前能量（正确值）'],['curAfter6','第6步后的当前能量（正确值）']],
  hint:'被拒绝的候选不进入当前解：当前能量保持原值。被接受的变差才把当前能量换成候选能量。'},
 {id:'equal-budget',title:'任务三：等预算比较两种温度方案',
  prompt:'用相同种子集合 {3,7,11}、相同预算 120 步，分别以 T=12 与 T=2 运行（页面按钮一次性算完）。提交：T=12 三次运行的最好合法面积之和，与 T=2 三次之和。并解释结论为什么需要多种子。',
  outline:[10,8],seed:7,T:12,steps:120,
  fields:[['sumT12','T=12 的三种子最好面积之和'],['sumT2','T=2 的三种子最好面积之和']],
  hint:'三份运行各自固定种子逐个跑；把每次的最好合法面积相加。一次运行说明不了稳定行为。'}
];
const exact=(v,n)=>String(v??'').trim()!==''&&Number.isFinite(Number(v))&&Number(v)===n;
export function assess07(id,e={},attempted=false){
 const errors=[];
 if(!attempted)errors.push('先实际运行/修改，再提交。加载示例不算独立完成。');
 if(id==='audit-steps'){
  if(!exact(e.accStep,FIRST_ACC_UPHILL07)||!exact(e.accDelta,RUN07.events[FIRST_ACC_UPHILL07-1].delta))errors.push('被接受的变差步与日志不一致（从日志逐列核对）。');
  if(!exact(e.rejStep,FIRST_REJECT07)||!exact(e.rejDelta,RUN07.events[FIRST_REJECT07-1].delta))errors.push('被拒绝的步与日志不一致。');
 }
 if(id==='fix-state'){
  const after2=RUN07.events[1].energy,after6=RUN07.events[5].energy;
  if(!exact(e.curAfter2,after2))errors.push('第2步被拒绝：当前能量应保持第1步之后的值（'+after2+'）。');
  if(!exact(e.curAfter6,after6))errors.push('第6步被接受：当前能量应换成候选能量（'+after6+'）。');
  if(Number(e.curAfter2)===RUN07.events[1].candidateEnergy)errors.push('你填的是候选能量——这正是那个bug：拒绝的候选不能进入当前解。');
 }
 if(id==='equal-budget'){
  if(!exact(e.sumT12,COMPARISON07.sumT12)||!exact(e.sumT2,COMPARISON07.sumT2))errors.push('比较结果与等预算运行不一致（三种子逐个跑再求和）。');
  if(Number(e.sumT2)<Number(e.sumT12))errors.push('数值反了：这组数据上 T=2 的三种子之和更大。');
 }
 return{ok:errors.length===0,errors:[...new Set(errors)]};
}
export const EXERCISES07=[
 {id:'penalty',title:'1. 罚项太小会怎样？',prompt:'候选A：盒面积36、宽度超出外框2（能量=36+100×2=236）；候选B：盒面积40、合法。把罚项系数从100改成1后，两个能量各是多少？谁会"看起来更好"？',fields:[['small','罚项=1时候选A的能量',38,0],['legal','候选B的能量',40,0]],rubric:'罚项=1时候选A=36+2=38<40=候选B，越界解反而胜出。罚项必须大到让越界"得不偿失"；100不是通用最佳值，只是本课模型的选择。'},
 {id:'low-temp',title:'2. 低温下的接受概率',prompt:'ΔE=4、T=1：p=exp(−4)。保留两位小数是多少？这说明低温时搜索行为怎样？',fields:[['p','p（两位小数）',0.02,.01]],rubric:'exp(−4)≈0.018，保留两位小数0.02。低温几乎不接受变差：搜索容易停在局部。低温影响的是接受行为；邻域不可达是另一类问题，调温解决不了。'},
 {id:'final-best',title:'3. 最后一步的解一定等于最好解吗？',prompt:'seed=3、T=12、120步的运行：最终当前能量是多少？历史最好合法面积是多少？',fields:[['final','最终当前能量',27,0],['best','历史最好合法面积',25,0]],rubric:'最终27，最好25。接受了一个变差候选后当前解可能变差；最好合法解单独保存、只减不增。报告"算法的结果"时应使用历史最好。'},
 {id:'one-run',title:'4. 一次运行能证明什么？',prompt:'seed=3 时：T=12 的最好合法面积与 T=2 的最好合法面积各是多少？两者相差多少？',fields:[['t12','T=12 的最好合法面积',25,0],['t2','T=2 的最好合法面积',28,0]],rubric:'T=12得25，T=2得28。单次运行的结果受种子与参数影响；结论要用相同种子集合、相同预算的多次运行统计支撑。'}
];
export function checkExercise07(id,v){const q=EXERCISES07.find(q=>q.id===id);return!!q&&q.fields.every(([k,,n,tol=0])=>String(v[k]??'').trim()!==''&&Number.isFinite(Number(v[k]))&&Math.abs(Number(v[k])-n)<=tol);}
export const WITNESSES07={audit:{seed:7,T:12,steps:120}};