import{TASKS04,EXERCISES04,decodeRows04,assess04,checkExercise04,treeToText,coordinateSteps,CATALOG02}from'./slicing04.mjs';import{metricsReport}from'./metrics03.mjs';import{describeError02}from'./legality02.mjs';import{board}from'../lessons/02/teaching/visuals.mjs';
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const st={task:null,expr:'',result:null,events:[],coord:[],failure:null,stage:'build',step:0,stale:false,hint:false,evidence:{},explanation:''};
export function lab04Page({code,task}){return`<main id="main" class="wrap focused-lesson"><header class="focused-hero"><div class="breadcrumbs"><a href="../../index.html">课程</a> / Lab 04</div><h1>九个符号，还原一张布局</h1><p class="lead">把后缀表达式一步步解码成切片树、尺寸和坐标，并说清三个边界。</p><nav class="focused-nav" aria-label="本课学习路径"><a href="#video">01 互动教学</a><a href="#lab">02 综合 Lab · Python</a><a href="#quiz">03 课后习题</a></nav></header>
<section id="video" class="focused-section"><span id="film"></span><span class="eyebrow">01 / LEARN</span><h2>互动讲解</h2><p class="small">先看一遍，也可以随时暂停；栈、树和布局会按推理切换。</p><iframe id="interactive-teaching-frame" title="Lab4互动教学" src="teaching/?embed=1&v=slicing-1" allow="autoplay; fullscreen" scrolling="no" style="width:100%;height:850px;border:0;display:block"></iframe></section>
<section id="lab" class="focused-section"><span class="eyebrow">02 / DECODE · REPAIR · CONSTRAIN</span><h2>表达式实验台</h2><p>三项任务分别修复语法、按目标重建表达式、在固定子树约束下压紧盒宽。实验台分两段：第一段逐符号看栈、局部区域和正在长出来的树，第二段才把坐标从根传下去。代数只看这一步，不提前给最终得分。</p><label>选择任务 <select id="lab04-task">${TASKS04.map(t=>`<option value="${t.id}">${esc(t.title)}</option>`).join('')}</select></label><p id="lab04-prompt"></p><button id="lab04-reset">重置当前任务</button>
<div class="lab04-console"><label>后缀表达式（空格分隔，字母或 H/V） <input id="lab04-expression" class="wide-input" spellcheck="false"></label><button id="lab04-decode" class="primary">解码并从头步进</button><button id="lab04-final" disabled>直接看结果</button><p id="lab04-parse" role="status"></p></div>
<div id="lab04-stale" role="status"></div><div id="lab04-error" role="status"></div>
<div id="lab04-stage" class="lab04-stage" role="group" aria-label="解码阶段"><button type="button" data-stage="build" aria-pressed="true">① 建树与尺寸</button><button type="button" data-stage="coords" aria-pressed="false">② 坐标传播</button></div>
<div id="lab04-board" class="lab02-board"></div><div class="lab04-side"><div id="lab04-stack"></div><div id="lab04-tree"></div></div><div id="lab04-metrics"></div><div id="lab04-controls"><label id="lab04-step-label">查看第 <select id="lab04-step"></select> 步</label><button id="lab04-prev" type="button">上一步</button><button id="lab04-next" type="button">下一步</button></div>
<div id="lab04-evidence"></div><label>写下你的推理（改动思路、为什么满足约束）<textarea id="lab04-explanation" rows="3" style="display:block;width:100%"></textarea></label><button id="lab04-check" class="primary">检查并保存</button> <button id="lab04-hint">需要一点提示</button><p id="lab04-result" role="status" style="white-space:pre-line"></p>
<article id="python" class="python-integrated"><h3>Python Lab：实现完整解码器 decode_postfix</h3><p>${esc(task.prompt.zh)}</p><details><summary>接口合同与错误码</summary><p>tokens 是符号列表（如 ['A','D','H','B','V','C','V','E','V']）；catalog 形如 {'A':(宽,高)}。约定：H 第一区域在下、第二区域在上；V 第一区域在左、第二区域在右；先弹出的是第二区域。返回 {'ok','errors','tree','size','coords','rows'}；coords 形如 {id:(x,y,w,h)}，rows 按 id 排序。错误码：underflow:X、leftover:N、unknown:X、duplicate:X、missing:清单。</p><p>已提供 combine 与 Lab2 的 validate_layout。解码成功的 rows 必须能通过 validate_layout；解码与几何是两道独立检查。${task.tests.length}项检查只是基线，请再写一个自己的测试并说明它能排除哪种错误实现。</p></details><textarea id="python-source" class="python-editor" aria-label="Python source code" spellcheck="false">${esc(code)}</textarea><div class="python-toolbar"><button id="python-run" class="primary">运行综合检查</button><button id="python-stop" disabled>停止</button><button id="python-reset">恢复模板</button></div><pre id="python-output" class="python-output" role="status">尚未检查。修改代码后，需要重新运行。</pre></article></section>
<section id="quiz" class="focused-section"><span class="eyebrow">03 / TRANSFER · COUNTEREXAMPLE · BOUNDARY</span><h2>课后练习：把边界说清楚</h2><p>除了数值，也写出推理。做完后可以对照参考要点检查。</p>${EXERCISES04.map(q=>`<article class="extended-exercise" data-exercise04="${q.id}"><h3>${esc(q.title)}</h3><p>${esc(q.prompt)}</p><div class="exercise-fields">${q.fields.map(([key,label])=>`<label>${esc(label)} <input type="number" step="any" data-field="${key}"></label>`).join('')}</div><label>你的推理<textarea data-explain rows="3"></textarea></label><button data-check>检查并保存</button> <button data-reveal>查看参考要点</button><p data-result role="status"></p><p data-rubric hidden>${esc(q.rubric)}</p></article>`).join('')}</section></main>`;}

function treeExpr(n){return n?(n.op?n.op+'('+treeExpr(n.left)+','+treeExpr(n.right)+')':n.id):'';}
function rowsOfPack(pack){return Object.entries(pack||{}).map(([id,r])=>[id,r.x,r.y,r.w,r.h]).sort((a,b)=>a[0]<b[0]?-1:1);}
function localRegion(entry,index,count,x0,colW,height){const[w,h]=[entry.w,entry.h];const u=Math.min((colW-70)/w,(height-150)/h);const ox=x0+(colW-w*u)/2,oy=70;let s=`<rect x="${ox}" y="${oy}" width="${w*u}" height="${h*u}" fill="#f7faf2" stroke="#8caa95"/>`;
 for(let i=1;i<w;i++)s+=`<path d="M${ox+i*u} ${oy}v${h*u}" stroke="#dce6d8"/>`;for(let i=1;i<h;i++)s+=`<path d="M${ox} ${oy+i*u}h${w*u}" stroke="#dce6d8"/>`;
 rowsOfPack(entry.pack).forEach((r,i)=>{const c=['#437ba5','#c08a42','#8f76b5','#5f8f6a','#a5704f'][i%5];const px=ox+r[1]*u,py=oy+(h-r[2]-r[4])*u;s+=`<rect x="${px}" y="${py}" width="${r[3]*u}" height="${r[4]*u}" rx="2" fill="${c}" stroke="#fff"/>`+`<text x="${px+r[3]*u/2}" y="${py+r[4]*u/2+5}" font-size="${Math.min(22,u*.7)}" fill="#fff" text-anchor="middle">${esc(r[0])}</text>`;if(r[3]*u>=48&&r[4]*u>=40)s+=`<text x="${px+r[3]*u/2}" y="${py+r[4]*u/2+24}" font-size="13" fill="#ffe8d2" text-anchor="middle">${r[3]}×${r[4]}</text>`;});
 s+=`<text x="${ox}" y="${oy+h*u+22}" font-size="14" fill="#678270">0</text><text x="${ox+w*u}" y="${oy+h*u+22}" font-size="14" fill="#678270" text-anchor="end">${w}</text><text x="${ox-10}" y="${oy+8}" font-size="14" fill="#678270" text-anchor="end">${h}</text><text x="${ox-10}" y="${oy+h*u}" font-size="14" fill="#678270" text-anchor="end">0</text>`;
 s+=`<text x="${x0+colW/2}" y="30" font-size="18" fill="#234e40" text-anchor="middle">区域 ${index+1}${index===count-1?'（栈顶）':index===0&&count>1?'（栈底）':''} · 局部坐标 ${w}×${h}</text>`;return s;}
function forestSvg(roots,{hl=null,origins=null}={}){const width=900,height=310,pad=34,top=40;let s=`<svg viewBox="0 0 ${width} ${height}" role="group" aria-label="当前的树结构">`;const slot=width/Math.max(1,roots.length);
 roots.forEach((root,ri)=>{const acc={nodes:[],leaves:0};const place=(n,d)=>{if(!n||!n.op){const x=acc.leaves++;acc.nodes.push({n,x,d});return x;}const lx=place(n.left,d+1),rx=place(n.right,d+1),x=(lx+rx)/2;acc.nodes.push({n,x,d});return x;};place(root,0);
  const maxD=Math.max(...acc.nodes.map(o=>o.d)),scale=(slot-2*pad)/Math.max(1,acc.leaves),yStep=maxD?Math.min((height-top-70)/maxD,66):0;
  const pos=new Map(acc.nodes.map(o=>[o.n,{x:ri*slot+pad+(o.x+.5)*scale,y:top+o.d*yStep,d:o.d}]));
  const boxW=Math.min(150,Math.max(86,scale*1.5));
  for(const[n,p]of pos){for(const child of[n.left,n.right]){if(!child)continue;const q=pos.get(child);if(q)s+=`<path d="M${p.x} ${p.y}L${q.x} ${q.y}" stroke="#9db3a0" fill="none"/>`;}}
  for(const[n,p]of pos){const on=n===hl;const label=(n.op?n.op+' '+(n.size?n.size.w+'×'+n.size.h:''):n.id+' '+(n.size?n.size.w+'×'+n.size.h:''));const org=origins&&origins.get(n);
   s+=`<rect x="${p.x-boxW/2}" y="${p.y-21}" width="${boxW}" height="${org?46:42}" rx="4" fill="${on?'#f6ead9':n.op?'#e3efdd':'#f4f7ef'}" stroke="${on?'#c9a06d':'#72997e'}" stroke-width="${on?2.5:1}"/><text x="${p.x}" y="${p.y+5}" font-size="17" fill="${on?'#8a5a26':'#355d49'}" text-anchor="middle">${esc(label)}</text>`;
   if(org)s+=`<text x="${p.x}" y="${p.y+22}" font-size="12" fill="#8a5a26" text-anchor="middle">(${org[0]},${org[1]})</text>`;}
  if(roots.length>1)s+=`<text x="${ri*slot+slot/2}" y="${height-12}" font-size="14" fill="#6b8373" text-anchor="middle">${ri===roots.length-1?'当前栈顶的树':'栈中的第 '+(ri+1)+' 棵树'}</text>`;
 });
 return s+'</svg>';}

export function bindLab04({progress,save}){const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
 progress.lab04Submissions=progress.lab04Submissions||{};progress.exercises04=progress.exercises04||{};
 const savedOf=id=>progress.lab04Submissions[id]||{};
 function tokenLabel(t){return t==='H'||t==='V'?t+'（组合）':'压入 '+t;}
 function buildEvidence(){const task=st.task;$('#lab04-evidence').innerHTML=`<div class="exercise-fields">${task.fields.map(([key,label])=>`<label>${esc(label)} <input id="lab04-${key}" type="number" step="any"></label>`).join('')}</div>`;for(const[key]of task.fields)$('#lab04-'+key).value=st.evidence[key]??'';}
 function readEvidence(){for(const[key]of st.task.fields)st.evidence[key]=$('#lab04-'+key)?.value??'';}
 function noteStale(){st.stale=st.events.length>0&&$('#lab04-expression').value.trim()!==st.expr.trim();}
 function renderStageButtons(){$$('#lab04-stage [data-stage]').forEach(b=>{const on=b.dataset.stage===st.stage;b.setAttribute('aria-pressed',String(on));b.classList.toggle('active',on);b.disabled=b.dataset.stage==='coords'&&!st.result?.ok;});}
 function renderBoard(){const host=$('#lab04-board');
  if(st.stage==='build'){
   const ev=st.events[st.step-1];
   if(!ev){host.innerHTML=`<p class="small" style="padding:18px">在第 ① 段里，读完一个符号就记一帧：字母进栈，H/V 弹出两个、合成一个。先解码再步进。</p>`;return;}
   const entries=ev.stack,n=entries.length,colW=900/n;
   host.innerHTML=`<svg viewBox="0 0 900 330" role="group" aria-label="第${st.step}步的栈区域">${entries.map((e,i)=>localRegion(e,i,n,i*colW,colW,330)).join('')}${n>1?`<text x="450" y="322" font-size="14" fill="#a05f30" text-anchor="middle">两个区域还没有组合：每个区域用自己的局部原点，不能叠在原点当完整布局评分。</text>`:`<text x="450" y="322" font-size="14" fill="#6b8373" text-anchor="middle">这一步只有一个区域；它的坐标仍只在局部有效。</text>`}</svg>`;
  }else{
   const cs=st.coord[st.step-1];if(!cs){host.innerHTML=`<p class="small" style="padding:18px">先完成建树与尺寸，才能进入坐标传播。</p>`;return;}
   const rows=Object.entries(cs.placed).map(([id,r])=>[id,r.x,r.y,r.w,r.h]).sort((a,b)=>a[0]<b[0]?-1:1);
   const focus=cs.kind==='leaf'?[cs.nodeId]:[];
   host.innerHTML=`<svg viewBox="0 0 960 430" role="group" aria-label="坐标传播第${st.step}步">${board(rows,st.task.outline,{x:60,y:55,w:820,h:330,interactive:false,showPairs:false,focus})}</svg>`;
  }}
 function renderStack(){const host=$('#lab04-stack');
  if(st.stage==='build'){const ev=st.events[st.step-1];
   if(!ev){host.innerHTML='<h3>栈快照</h3><p>尚无解码记录。</p>';return;}
   host.innerHTML=`<h3>第 ${st.step} / ${st.events.length} 步：${esc(tokenLabel(ev.token))}</h3><table style="width:100%"><thead><tr><th>栈底 → 栈顶</th><th>尺寸</th></tr></thead><tbody>${ev.stack.map((c,i)=>`<tr><td>${esc(c.ids)}${i===ev.stack.length-1?'（栈顶）':''}</td><td>${c.w}×${c.h}</td></tr>`).join('')}</tbody></table><p class="small">${ev.token==='H'||ev.token==='V'?'弹出两个、按 H/V 规则合成一个再压回。':'字母：压入该模块，尺寸就是清单里的宽高。'}</p>`;
  }else{const cs=st.coord[st.step-1];if(!cs){host.innerHTML='<h3>坐标传播</h3><p>尚未进入。</p>';return;}
   const from=cs.from;host.innerHTML=`<h3>坐标传播 第 ${st.step} / ${st.coord.length} 步：${esc(cs.label)}</h3><table style="width:100%"><tbody><tr><td>当前节点</td><td>${esc(cs.nodeId)}${cs.kind==='leaf'?'（叶子模块）':''}</td></tr><tr><td>父原点</td><td>${from?`(${from.parentOrigin[0]},${from.parentOrigin[1]})`:'(0,0) 根从这里开始'}</td></tr><tr><td>兄弟偏移</td><td>${from?`${from.side}孩子 → (${from.offset[0]},${from.offset[1]})${from.sibling?'，兄弟 '+from.sibling[0]+'×'+from.sibling[1]:''}`:'—'}</td></tr><tr><td>得到新原点</td><td>(${cs.origin[0]},${cs.origin[1]})</td></tr></tbody></table>`;
  }}
 function renderTree(){const host=$('#lab04-tree');
  if(st.stage==='build'){const ev=st.events[st.step-1];if(!ev){host.innerHTML='<h3>切片树</h3><p>读完第一个符号后，树才开始长出来。</p>';return;}host.innerHTML='<h3>切片树（每步只画此刻已经建成的节点）</h3>'+forestSvg(ev.stack.map(e=>e.node),{hl:ev.stack[ev.stack.length-1].node});}
  else{const cs=st.coord[st.step-1];if(!cs||!st.result?.tree){host.innerHTML='<h3>切片树</h3><p>尚未进入。</p>';return;}const origins=new Map();for(let i=0;i<st.step;i++)origins.set(st.coord[i].ref,st.coord[i].origin);host.innerHTML='<h3>切片树（括号里是这一步传到的原点）</h3>'+forestSvg([st.result.tree],{hl:cs.ref,origins});}
 }
 function renderMetrics(){const host=$('#lab04-metrics');
  if(st.stage==='build'){const ev=st.events[st.step-1];if(!ev){host.innerHTML='<p class="metric-line">没有可评价的布局。</p>';return;}
   host.innerHTML=`<div class="metric-line"><span>已读符号</span><b>${st.step} / ${st.events.length}</b></div><div class="metric-line"><span>当前栈深</span><b>${ev.stack.length}</b></div><div class="metric-line"><span>栈顶区域</span><b>${ev.region[0]}×${ev.region[1]}</b></div><div class="metric-line"><span>本段检查</span><b>${st.failure?'在下溢/出错处停下':'前缀条件逐步成立'}</b></div><p class="small">这一段的数字都只描述结构；完整布局的合法性、包围盒与得分要等第 ② 段坐标传完。</p>`;
  }else{const cs=st.coord[st.step-1];if(!cs){host.innerHTML='<p class="metric-line">尚未进入坐标阶段。</p>';return;}
   const placed=Object.keys(cs.placed).length,complete=placed===Object.keys(CATALOG02).length;
   let extra='';if(complete&&st.result?.ok){const r=metricsReport(st.result.rows,st.task.outline);extra=`<div class="metric-line"><span>合法性</span><b>${r.legal?'通过 Lab2 检查':'未通过：'+r.errors.map(describeError02).join('，')}</b></div><div class="metric-line"><span>包围盒</span><b>${r.bbox.width}×${r.bbox.height}=${r.bbox.area}</b></div><div class="metric-line"><span>盒内空余</span><b>${r.bbox_dead}</b></div>`;}
   host.innerHTML=`<div class="metric-line"><span>已放置模块</span><b>${placed} / 5</b></div>${extra}<p class="small">${complete?'坐标已全部传完，现在才是可以评分的完整布局。':'还在传坐标：此时既不是最终布局，也不打分。'}</p>`;}
 }
 function renderStepControls(){const sel=$('#lab04-step');const n=st.stage==='build'?st.events.length:st.coord.length;
  sel.innerHTML=st.stage==='build'?st.events.map((e,i)=>`<option value="${i+1}" ${i+1===st.step?'selected':''}>第 ${i+1} 步：${esc(tokenLabel(e.token))}</option>`).join(''):st.coord.map((c,i)=>`<option value="${i+1}" ${i+1===st.step?'selected':''}>第 ${i+1} 步：${esc(c.label)}</option>`).join('');
  sel.disabled=!n;$('#lab04-prev').disabled=!(n&&st.step>1);$('#lab04-next').disabled=!(n&&st.step<n);$('#lab04-final').disabled=!st.result?.ok;}
 function render(){const task=st.task;
  $('#lab04-prompt').textContent=task.prompt;
  $('#lab04-parse').textContent=st.result?(st.result.ok?`解码成功：最终区域 ${st.result.size.w}×${st.result.size.h}，树为 ${treeExpr(st.result.tree)}`:'解码失败：'+st.result.errors.join('；')):'点击"解码并从头步进"开始。';
  $('#lab04-stale').innerHTML=st.stale?`<div class="status-note">表达式已经改过，下面显示的仍是上一次解码的过程，已经过期。点「解码并从头步进」按当前表达式重算；提交时用的是输入框里的表达式。</div>`:'';
  $('#lab04-error').innerHTML=st.failure?`<div class="status-note"><b>在第 ${st.failure.next} 个记号「${esc(st.failure.token||'（结尾）')}」停下：</b>${esc(st.failure.reason)}。${st.events.length?`上面能回看出错之前合法的 ${st.events.length} 步。`:''}解码失败时不给完整布局，也不给得分。</div>`:'';
  renderStageButtons();renderBoard();renderStack();renderTree();renderMetrics();renderStepControls();
 }
 function decode(){st.expr=$('#lab04-expression').value;const r=decodeRows04(st.expr,CATALOG02,st.task.outline);
  st.result=r;st.events=r.events||[];st.failure=r.failure||null;st.coord=r.ok?coordinateSteps(r.tree):[];st.stage='build';st.step=st.events.length?(r.ok?1:st.events.length):0;st.stale=false;render();}
 function goFinal(){if(!st.result?.ok)return;st.stage='coords';st.step=st.coord.length;render();}
 function setStage(name){if(name==='coords'&&!st.result?.ok)return;st.stage=name;st.step=(name==='build'?st.events.length:st.coord.length)?1:0;render();}
 function load(id){const task=TASKS04.find(t=>t.id===id);const saved=savedOf(id);const expr=typeof saved.expression==='string'&&saved.expression.trim()?saved.expression:task.expression;st.task=task;st.expr=expr;st.result=null;st.events=[];st.coord=[];st.failure=null;st.stage='build';st.step=0;st.stale=false;st.hint=!!saved.hintUsed;st.evidence={...(saved.evidence||{})};st.explanation=saved.explanation||'';
  $('#lab04-expression').value=expr;$('#lab04-explanation').value=st.explanation;$('#lab04-result').textContent='';buildEvidence();render();}
 $('#lab04-expression').addEventListener('input',()=>{noteStale();render();});
 $('#lab04-task').onchange=e=>load(e.target.value);
 $('#lab04-reset').onclick=()=>{const task=TASKS04.find(t=>t.id===st.task.id);st.result=null;st.events=[];st.coord=[];st.failure=null;st.stage='build';st.step=0;st.stale=false;st.evidence={};st.explanation='';st.expr=task.expression;$('#lab04-expression').value=task.expression;$('#lab04-explanation').value='';delete progress.lab04Submissions[st.task.id];save();$('#lab04-result').textContent='当前任务已重置：解码过程、尺寸与说明都清空，只留下示例表达式；这一任务的已保存提交也已撤销。';buildEvidence();render();};
 $('#lab04-decode').onclick=decode;
 $('#lab04-final').onclick=goFinal;
 $$('#lab04-stage [data-stage]').forEach(b=>b.onclick=()=>setStage(b.dataset.stage));
 $('#lab04-step').onchange=e=>{st.step=Number(e.target.value);render();};
 $('#lab04-prev').onclick=()=>{if(st.step>1){st.step--;render();}};
 $('#lab04-next').onclick=()=>{const n=st.stage==='build'?st.events.length:st.coord.length;if(st.step<n){st.step++;render();}};
 $('#lab04-evidence').addEventListener('input',()=>readEvidence());
 $('#lab04-explanation').addEventListener('input',()=>{st.explanation=$('#lab04-explanation').value;});
 $('#lab04-hint').onclick=()=>{st.hint=true;progress.lab04Submissions[st.task.id]={...(savedOf(st.task.id)),hintUsed:true};save();$('#lab04-result').textContent=st.task.hint;};
 $('#lab04-check').onclick=()=>{readEvidence();const expr=$('#lab04-expression').value,attempt=expr.trim()!==TASKS04.find(x=>x.id===st.task.id).expression.trim();const res=assess04(st.task.id,expr,st.evidence,attempt);if(!attempt)res.errors.unshift('先修改表达式，再提交。加载示例不算独立完成。');
  const explanation=$('#lab04-explanation').value;
  progress.lab04Submissions[st.task.id]={version:1,expression:expr,evidence:{...st.evidence},numericPassed:res.ok,explanation,hintUsed:st.hint,explanationStatus:'submitted-not-graded'};save();
  $('#lab04-result').textContent=res.errors.length?res.errors.join('\n'):explanation.trim().length<30?'数值与表达式通过，请再写清楚修改思路和约束判断。解释的文字内容不会被自动判分。':'数值通过，解释已保存（文字不自动判分，请按上面列出的约束自查）。';};
 for(const article of document.querySelectorAll('[data-exercise04]')){const id=article.dataset.exercise04,saved=progress.exercises04[id]||{};for(const input of article.querySelectorAll('[data-field]'))input.value=saved.values?.[input.dataset.field]??'';article.querySelector('[data-explain]').value=saved.explanation||'';let revealed=!!saved.revealed;
  article.querySelector('[data-check]').onclick=()=>{const values=Object.fromEntries([...article.querySelectorAll('[data-field]')].map(e=>[e.dataset.field,e.value])),explanation=article.querySelector('[data-explain]').value,ok=checkExercise04(id,values);progress.exercises04[id]={values,explanation,numericPassed:ok,revealed,explanationStatus:'submitted-not-graded'};save();article.querySelector('[data-result]').textContent=!ok?'数值还不对，请核对区域尺寸、栈深或切线扫描。':explanation.trim().length<30?'数值通过，请补上你的推理。':'数值通过，解释已保存。请按参考要点检查依据。'+(revealed?'（已查看参考）':'');};
  article.querySelector('[data-reveal]').onclick=()=>{revealed=true;article.querySelector('[data-rubric]').hidden=false;progress.exercises04[id]={...(progress.exercises04[id]||{}),revealed:true};save();article.querySelector('[data-result]').textContent='参考要点已显示，不计作独立完成的证明。';};}
 load(TASKS04[0].id);
}
