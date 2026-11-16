// Lab8 finale section: shape frontier explorer, three-config comparison, tasks and exercises.
import{FRONTIER08,TASKS08B,assess08B,checkExercise08B,EXERCISES08B,JOINT_TABLE08,shapeFrontier}from'./soft08.mjs';
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function finaleSection({progress,shapeTask}){return`<section id="finale" class="focused-section"><span class="eyebrow">FINALE / SHAPE FRONTIER · JOINT SEARCH</span><h2>收官挑战：多软模块形状前沿</h2><p>新实例：A 面积6（形状 2×3、3×2）、B 面积12（3×4、4×3）、C 固定 3×1；树 A B V C H；外框 5×5。三项任务：保留正确前沿、面积贪心失败演示、三配置等预算对照。</p><div class="lab04-console"><label>树（后缀） <input id="finale-tree" class="wide-input" value="A B V C H" spellcheck="false"></label><label>外框宽 <input id="finale-w" type="number" value="5" min="1" style="width:70px"></label><label>外框高 <input id="finale-h" type="number" value="5" min="1" style="width:70px"></label><button id="finale-run" class="primary">枚举形状组合并列前沿</button></div><div id="finale-result" role="status"></div><div id="finale-frontier"></div>
<label>选择任务 <select id="finale-task">${TASKS08B.map(tt=>`<option value="${tt.id}">${esc(tt.title)}</option>`).join('')}</select></label><p id="finale-prompt"></p><button id="finale-reset">重置当前任务</button>
<div id="finale-evidence"></div><label>写下你的推理（支配理由、贪心失败在哪一步、收益归因）<textarea id="finale-explanation" rows="3" style="display:block;width:100%"></textarea></label><button id="finale-check" class="primary">检查并保存</button> <button id="finale-hint">需要一点提示</button><p id="finale-check-msg" role="status" style="white-space:pre-line"></p>
<button id="finale-joint">三配置对照：同解码器/初始编码/外框，种子{3,7,11}×≤30次评估（一次性）</button><p id="finale-joint-result" role="status"></p>
<article id="python-shape" class="python-integrated"><h3>Python Lab：实现形状前沿 shape_frontier</h3><p>${esc(shapeTask.prompt.zh)}</p><details><summary>接口合同</summary><p>tree 是后缀符号列表；candidates 形如 {'A':[[2,3],[3,2]],'B':[[3,4],[4,3]],'C':[[3,1]]}。用已提供的 Lab4 解码器把每个组合变成具体 rows（来源指针 choice=每个模块的形状序号），测 (宽,高)，做支配删除（宽和高都不更大、至少一维严格更小），返回 {'candidates','frontier','fitting'}。${shapeTask.tests.length}项检查只是基线；审计器 audit_layout 仍是守门模块，不是新算法的全部验收。</p></details><textarea id="python-source-shape" class="python-editor" aria-label="Python source code" spellcheck="false">${esc(progress.code['08-shape-v1']??shapeTask.starter)}</textarea><div class="python-toolbar"><button id="python-shape-run" class="primary">运行综合检查</button><button id="python-shape-stop" disabled>停止</button><button id="python-shape-reset">恢复模板</button></div><pre id="python-output-shape" class="python-output" role="status">尚未检查。修改代码后，旧通过状态会失效。</pre>${EXERCISES08B.map(q=>`<article class="extended-exercise" data-exercise08b="${q.id}"><h3>${esc(q.title)}</h3><p>${esc(q.prompt)}</p><div class="exercise-fields">${q.fields.map(([key,label])=>`<label>${esc(label)} <input type="number" step="any" data-field="${key}"></label>`).join('')}</div><label>你的推理<textarea data-explain rows="3"></textarea></label><button data-check>检查并保存</button> <button data-reveal>查看参考要点</button><p data-result role="status"></p><p data-rubric hidden>${esc(q.rubric)}</p></article>`).join('')}</article></section>`;}
export function bindFinale08({progress,save}){
 progress.finale08Submissions=progress.finale08Submissions||{};progress.exercises08B=progress.exercises08B||{};
 const $=s=>document.querySelector(s);let task=TASKS08B[0],hint=false;
 function render(){$('#finale-prompt').textContent=task.prompt;
  $('#finale-evidence').innerHTML=`<div class="exercise-fields">${task.fields.map(([k,l])=>`<label>${esc(l)} <input id="finale-${k}" type="number" step="any"></label>`).join('')}</div>`;
  const saved=progress.finale08Submissions[task.id]?.evidence||{};
  for(const[key]of task.fields)if(saved[key]!==undefined&&$('#finale-'+key))$('#finale-'+key).value=saved[key];}
 $('#finale-run').onclick=()=>{const tree=$('#finale-tree').value.trim(),W=Number($('#finale-w').value),H=Number($('#finale-h').value);
  if(tree!=='A B V C H'&&tree!=='A B H C V'){$('#finale-result').textContent='这里只提供两棵实例树：A B V C H（外框 5×5）与 A B H C V（外框 6×6）。';return;}
  const cat={A:{area:6,shapes:[[2,3],[3,2]]},B:{area:12,shapes:[[3,4],[4,3]]},C:{area:3,shapes:[[3,1]]}};
  const out=(FRONTIER08.frontier.length&&W===5&&H===5)?FRONTIER08:shapeFrontier(tree,cat,[W,H]);
  $('#finale-result').textContent=`候选 ${out.candidates.length} 份；前沿：${out.frontier.map(c=>c.size[0]+'×'+c.size[1]+'='+c.area).join('、')}；能进 ${W}×${H} 的：${out.fitting.map(c=>c.area).join('、')||'无'}`;
  $('#finale-frontier').innerHTML=`<table style="width:100%"><thead><tr><th>组合</th><th>尺寸</th><th>面积</th><th>进框</th><th>前沿</th></tr></thead><tbody>${out.candidates.map(c=>`<tr><td>${c.choice.A?'A=3×2':'A=2×3'} / ${c.choice.B?'B=4×3':'B=3×4'}</td><td>${c.size[0]}×${c.size[1]}</td><td>${c.area}</td><td>${c.fit?'是':'否'}</td><td>${out.frontier.includes(c)?'是':'否'}</td></tr>`).join('')}</tbody></table>`;
 };
 $('#finale-joint').onclick=()=>{if($('#finale-joint-result').textContent)return;const s=JOINT_TABLE08;
  $('#finale-joint-result').textContent=`冻结基线（只评初始1次）：可行种子 ${s.frozen.feasibleSeeds}/3；只搜形状：${s.shapes.feasibleSeeds}/3，最好面积 ${s.shapes.bestAreas.join('/')}；形状+拓扑：${s.both.feasibleSeeds}/3，最好面积 ${s.both.bestAreas.join('/')}。去重候选数：形状 ${s.shapes.distinct.join('/')}，形状+拓扑 ${s.both.distinct.join('/')}。结论只针对 A/B/C 这组数据。`;};
 $('#finale-task').onchange=e=>{task=TASKS08B.find(x=>x.id===e.target.value);hint=!!progress.finale08Submissions[task.id]?.hintUsed;$('#finale-check-msg').textContent='';$('#finale-explanation').value='';render();};
 $('#finale-reset').onclick=()=>{task=TASKS08B.find(x=>x.id===$('#finale-task').value);hint=false;$('#finale-check-msg').textContent='';$('#finale-explanation').value='';render();};
 $('#finale-hint').onclick=()=>{hint=true;progress.finale08Submissions[task.id]={...(progress.finale08Submissions[task.id]||{}),hintUsed:true};save();$('#finale-check-msg').textContent=task.hint;};
 $('#finale-check').onclick=()=>{const e={};for(const[key]of task.fields)e[key]=$('#finale-'+key)?.value;
  const attempted=Object.values(e).some(v=>String(v??'').trim()!=='');
  const res=assess08B(task.id,e,attempted);
  const explanation=$('#finale-explanation').value;
  progress.finale08Submissions[task.id]={version:1,evidence:e,numericPassed:res.ok,explanation,hintUsed:hint,explanationStatus:'submitted-not-graded'};save();
  $('#finale-check-msg').textContent=res.errors.length?res.errors.join('\n'):explanation.trim().length<30?'数值通过，请再写清楚支配理由或收益归因。':'数值通过，解释已保存。请确认结论只针对本实例。';};
 for(const article of document.querySelectorAll('[data-exercise08b]')){const id=article.dataset.exercise08b,saved=progress.exercises08B[id]||{};for(const input of article.querySelectorAll('[data-field]'))input.value=saved.values?.[input.dataset.field]??'';article.querySelector('[data-explain]').value=saved.explanation||'';let revealed=!!saved.revealed;
  article.querySelector('[data-check]').onclick=()=>{const values=Object.fromEntries([...article.querySelectorAll('[data-field]')].map(e=>[e.dataset.field,e.value])),explanation=article.querySelector('[data-explain]').value,ok=checkExercise08B(id,values);progress.exercises08B[id]={values,explanation,numericPassed:ok,revealed,explanationStatus:'submitted-not-graded'};save();article.querySelector('[data-result]').textContent=!ok?'数值还不对，请核对支配删除、贪心失败或归因结论。':explanation.trim().length<30?'数值通过，请补上你的推理。':'数值通过，解释已保存。'+(revealed?'（已查看参考）':'');};
  article.querySelector('[data-reveal]').onclick=()=>{revealed=true;article.querySelector('[data-rubric]').hidden=false;progress.exercises08B[id]={...(progress.exercises08B[id]||{}),revealed:true};save();article.querySelector('[data-result]').textContent='参考要点已显示，不计作独立完成的证明。';};}
 render();
}
export function bindShapePython({progress,save}){
 const source=document.querySelector('#python-source-shape'),output=document.querySelector('#python-output-shape'),task=shapeTaskRef;let worker=null,timer=0;
 const BASE=document.body.dataset.base||'../';
 function revoke(){if(progress.visited['python-08-shape-v1']){delete progress.visited['python-08-shape-v1'];save();}}
 function stop(message,{keepPass=false}={}){worker?.terminate();worker=null;clearTimeout(timer);document.querySelector('#python-shape-run').disabled=false;document.querySelector('#python-shape-stop').disabled=true;if(!keepPass)revoke();if(message)output.textContent=message;}
 source.oninput=()=>{stop('代码已修改，请重新运行检查。');progress.code['08-shape-v1']=source.value;save();};
 document.querySelector('#python-shape-reset').onclick=()=>{source.value=shapeTaskRef.starter;source.oninput();};
 document.querySelector('#python-shape-stop').onclick=()=>stop('已停止，代码保留。旧通过状态已撤销，需重新运行才能恢复。');
 document.querySelector('#python-shape-run').onclick=()=>{stop();const submitted=source.value;document.querySelector('#python-shape-run').disabled=true;document.querySelector('#python-shape-stop').disabled=false;output.textContent='正在加载本地 Python 并运行…';
  const job=new Worker(BASE+'assets/python-worker.mjs',{type:'module'});worker=job;timer=setTimeout(()=>{if(worker===job)stop('运行超过20秒，已停止。旧通过状态已撤销。');},20000);
  job.onmessage=({data})=>{if(worker!==job)return;if(data.type==='status')output.textContent='正在加载本地 Python…';if(data.type==='error'){stop(data.text+'（旧通过状态已撤销）');return;}if(data.type==='result'){const all=data.checks.length===shapeTaskRef.tests.length&&data.checks.every(c=>c.status==='PASS')&&source.value===submitted;output.textContent=data.checks.map(c=>`${c.status.padEnd(10)} ${c.name}${c.error?' — '+c.error:''}`).join('\n')+'\n\n'+(all?'当前代码通过全部检查。测试覆盖不等于完整正确性证明。':'尚未全部通过，请修改后重新检查。');if(all)progress.visited['python-08-shape-v1']=true;else delete progress.visited['python-08-shape-v1'];save();stop(undefined,{keepPass:all});}};
  job.onerror=e=>{if(worker===job)stop(e.message+'（旧通过状态已撤销）');};
  job.postMessage({source:submitted,tests:shapeTaskRef.tests});
 };
}
let shapeTaskRef=null;
export function setShapeTask(task){shapeTaskRef=task;}