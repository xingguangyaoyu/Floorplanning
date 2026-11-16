import{localizeTeaching}from'../../../assets/teaching-ui.mjs';
import{bindSeek}from'../../../assets/seek-controller.mjs';
import {renderVisual}from'./visuals.mjs';
import {COLORS,clone}from'../../../assets/core.mjs';
import {BASE,SCENES,DURATION,frameAt,sceneAt,check,overlaps,newSession,enterTrial,leaveTrial,seek,edit}from'./pilot-model.mjs?v=voice-20261116';
import{DATA as NARRATION}from'./pilot-model.mjs?v=voice-20261116';import{lessonSuffix,language,installLanguageChoice,restoreScene}from'../../../assets/teaching-language.mjs';
import {questionClock,advanceQuestion,revealQuestion}from'./question-clock.mjs';
const $=s=>document.querySelector(s),NS='http://www.w3.org/2000/svg',session=newSession(),world=$('#world'),stage=$('#stage'),motion=matchMedia('(prefers-reduced-motion: reduce)'),asked=new Set(),answers=new Map();
let playing=false,raf=0,last=0,lastQuestion=undefined,drag=null,captionOn=true,trialFromMoving=false,questionTimer=0,questionState=null,questionKey=null,questionLast=0,playEpoch=0,seekController=null;
const narration=new Audio(new URL('./narration'+lessonSuffix+'.m4a?v='+NARRATION.audioSha256.slice(0,12),import.meta.url).href);narration.preload='metadata';narration.volume=1;
narration.id='interactive-audio';narration.hidden=true;$('.player').append(narration);
$('#seek').max=DURATION;const timerText=document.createElement('p');timerText.className='question-countdown';timerText.setAttribute('role','timer');$('#answer').before(timerText);
const holdButton=document.createElement('button');holdButton.textContent='留在本题';holdButton.onclick=()=>{holdQuestion();pause();};$('#continue').after(holdButton);
const soundButton=document.createElement('button');soundButton.textContent='静音';soundButton.setAttribute('aria-label','静音配音');soundButton.onclick=()=>{narration.muted=!narration.muted;soundButton.textContent=narration.muted?'开启声音':'静音';soundButton.setAttribute('aria-label',narration.muted?'开启配音':'静音配音');};$('#cc').before(soundButton);
const tools=document.createElement('details'),toolsTitle=document.createElement('summary'),below=$('.below');tools.id='video-tools';tools.className='video-tools';toolsTitle.textContent='章节与尝试工具（可选）';below.before(tools);tools.append(toolsTitle,below);
function stopQuestion(){clearInterval(questionTimer);questionTimer=0;}
function holdQuestion(){stopQuestion();if(questionState)questionState.held=true;timerText.textContent='已暂停自动继续。可自由尝试，或点击继续。';updateText($('#play'),'播放');$('#play').setAttribute('aria-label','播放讲解');}
function continueQuestion(){stopQuestion();questionState=null;questionKey=null;const s=sceneAt(session.time);if(s.question){asked.add(s.key);seek(session,s.end);narration.currentTime=session.time;}play();}
function startQuestion(scene){stopQuestion();questionKey=scene.key;questionState=questionClock();questionLast=performance.now();updateQuestionTimer();questionTimer=setInterval(updateQuestionTimer,200);render();}
function updateQuestionTimer(){
 if(!questionState||questionState.held||document.hidden||session.trial)return;
 const now=performance.now(),action=advanceQuestion(questionState,(now-questionLast)/1000);questionLast=now;
 if(action==='reveal'){const s=SCENES.find(s=>s.key===questionKey);answers.set(s.key,s.question.answer);lastQuestion=null;render();$('#answer').textContent='思考时间到。'+s.question.replies[s.question.answer];}
 if(action==='continue'){continueQuestion();return;}
 timerText.textContent=questionState.phase==='thinking'?`${Math.ceil(questionState.left)} 秒后公布答案并继续；开始操作可暂停。`:`答案已公布，${Math.ceil(questionState.left)} 秒后继续。`;
}
function node(tag,attrs={},text){const el=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))el.setAttribute(k,v);if(text!=null)el.textContent=text;return el;}
function updateText(el,text){if(el.textContent!==text)el.textContent=text;}
const outline=node('rect',{x:0,y:0,width:10,height:8,fill:'#f9faf5',stroke:'#8b9b8e','stroke-width':'.035','stroke-dasharray':'.16 .12'});world.append(outline);
for(let i=1;i<10;i++)world.append(node('path',{d:`M${i} 0V8`,stroke:'#e0e6dc','stroke-width':'.015'}));
for(let i=1;i<8;i++)world.append(node('path',{d:`M0 ${i}H10`,stroke:'#e0e6dc','stroke-width':'.015'}));
world.append(node('text',{x:9.8,y:.3,'text-anchor':'end','font-size':'.22',fill:'#7b8c80'},'外框 10 × 8'));
const blocks={};
for(const id of Object.keys(BASE)){
 const g=node('g',{'data-block':id,role:'button',tabindex:0,'aria-label':`模块 ${id}`}),rect=node('rect',{rx:'.04',fill:COLORS[id],stroke:'#fff','stroke-width':'.035'}),letter=node('text',{'text-anchor':'middle','font-size':'.36',fill:'#fff','pointer-events':'none'}),size=node('text',{'text-anchor':'middle','font-size':'.19',fill:'#fff','pointer-events':'none'});letter.textContent=id;g.append(rect,letter,size);world.append(g);blocks[id]={g,rect,letter,size};
 g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.code==='Space'){e.preventDefault();e.stopPropagation();begin(id);}else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();e.stopPropagation();begin(id);const[dx,dy]={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,1],ArrowDown:[0,-1]}[e.key];move(dx,dy);}});
}
const collisionLayer=node('g',{'pointer-events':'none'}),bbox=node('rect',{fill:'none',stroke:'#315b50','stroke-width':'.045','stroke-dasharray':'.14 .08','pointer-events':'none'}),dimensions=node('g',{'pointer-events':'none'});world.append(collisionLayer,bbox,dimensions);const graphic=document.createElementNS(NS,'g');stage.insertBefore(graphic,$('#stage-note'));
function fmt(n){return Number.isInteger(n)?String(n):n.toFixed(2).replace(/0+$/,'').replace(/\.$/,'');}
function clock(t){return`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;}
function status(pack,report,moving){
 const box=$('#metrics');let text;
 if(moving)text='编辑过程示意\n落定后再判定合法性；当前不显示有效得分。';
 else if(report.legal)text=`完整布局合法\n包围盒 ${fmt(report.bbox.w)} × ${fmt(report.bbox.h)} = ${fmt(report.bbox.area)}；模块总面积仍为 23。`;
 else{const detail=report.errors.map(e=>e.code==='overlap'?`${e.ids.join('/')} 重叠（面积 ${fmt(overlaps(pack).find(r=>r.ids.join('/')===e.ids.join('/'))?.area||0)}）`:e.code==='outside'?`${e.ids.join('/')} 超出外框`:`${e.ids.join('/')}：${e.code}`).join('；');text=`完整布局非法：${detail}\n几何包围盒面积 ${fmt(report.bbox.area)}；非法布局不能作为有效优化结果。`;}
 updateText(box,text);box.style.whiteSpace='pre-line';box.classList.toggle('bad',!moving&&!report.legal);
}
function renderQuestion(scene){
 const key=!session.trial&&scene.question?scene.key:null;if(key===lastQuestion)return;lastQuestion=key;$('#question').hidden=!key;if(!key)return;
 $('#question .eyebrow').textContent=scene.key==='overlap-predict'?'暂停，先预测下一步':scene.key==='bottle-predict'?'先找出活动边界':'用模型条件作判断';$('#question-title').textContent=scene.question.prompt;$('#choices').replaceChildren();$('#answer').textContent='';
 scene.question.choices.forEach((text,i)=>{const b=document.createElement('button');b.textContent=text;b.setAttribute('aria-pressed','false');b.onclick=()=>{answers.set(scene.key,i);asked.add(scene.key);for(const button of $('#choices').children)button.setAttribute('aria-pressed',String(button===b));$('#answer').textContent=scene.question.replies[i];if(!questionState||questionKey!==scene.key){pause();startQuestion(scene);}if(!questionState.held){revealQuestion(questionState);questionLast=performance.now();}render();};$('#choices').append(b);});
 if(answers.has(key)){const i=answers.get(key);$('#choices').children[i].setAttribute('aria-pressed','true');$('#answer').textContent=scene.question.replies[i];}
}
function render(){queueMicrotask(()=>localizeTeaching(document.body));
 const frame=frameAt(session.time,motion.matches),trial=!!session.trial,pack=session.trial||frame.pack,report=trial?check(pack):frame.report,moving=!trial&&frame.moving,scene=frame.scene;
 document.body.dataset.mode=trial?'trial':'lesson';stage.dataset.time=session.time.toFixed(3);stage.dataset.scene=scene.key;stage.dataset.fraction=String((session.time-scene.start)/(scene.end-scene.start));world.setAttribute('viewBox',(trial?[-.6,-.4,11.2,9]:frame.camera).join(' '));
 updateText($('#stage-title'),trial?`自己的尝试：选中 ${session.selected}`:scene.title);updateText($('#stage-label'),trial?'讲解已暂停':`第 ${scene.chapterIndex} / ${new Set(SCENES.map(s=>s.chapterIndex)).size} 章`);updateText($('#stage-note'),trial?'改完后，看看有没有碰撞，包围盒又变了多少':moving?'先看它移到哪里，再检查结果':scene.note);
 const focus=trial?[session.selected]:scene.focus;
 for(const[id,r]of Object.entries(pack)){
  const el=blocks[id],y=8-r.y-r.h;for(const[k,v]of Object.entries({x:r.x,y,width:r.w,height:r.h}))el.rect.setAttribute(k,v);
  el.rect.setAttribute('stroke',trial&&session.selected===id?'#172b29':'#fff');el.rect.setAttribute('stroke-width',trial&&session.selected===id?'.07':'.035');
  el.g.setAttribute('opacity',focus.length&&!focus.includes(id)?'.4':'1');el.letter.setAttribute('x',r.x+r.w/2);el.letter.setAttribute('y',y+r.h/2);el.size.setAttribute('x',r.x+r.w/2);el.size.setAttribute('y',y+r.h/2+.29);el.size.textContent=`${fmt(r.w)} × ${fmt(r.h)}`;
 }
 renderVisual(graphic,frame,session.time,trial);world.setAttribute('display',frame.illustration&&!trial?'none':'inline');const reveal=trial||!scene.question||answers.has(scene.key);collisionLayer.replaceChildren();if(reveal)for(const r of overlaps(pack))collisionLayer.append(node('rect',{x:r.x,y:8-r.y-r.h,width:r.w,height:r.h,fill:'url(#collision)',stroke:'#b8372d','stroke-width':'.045'}));
 bbox.setAttribute('visibility',report?.legal?'visible':'hidden');if(report?.legal){const b=report.bbox;for(const[k,v]of Object.entries({x:b.x,y:8-b.y-b.h,width:b.w,height:b.h}))bbox.setAttribute(k,v);}
 dimensions.replaceChildren();if(!trial&&scene.key==='overlap-area'){
  const p=(session.time-scene.start)/(scene.end-scene.start);if(p>.12){dimensions.append(node('path',{d:'M0 4.87H2',stroke:'#a34e32','stroke-width':'.04'}),node('text',{x:1,y:4.7,'text-anchor':'middle','font-size':'.22',fill:'#923b27'},'交集宽 2'));}
  if(p>.38)dimensions.append(node('path',{d:'M-.13 5V6',stroke:'#a34e32','stroke-width':'.04'}),node('text',{x:2.27,y:5.6,'font-size':'.22',fill:'#923b27'},'高 1'));
 }
 const spoken=NARRATION.captions.find(c=>session.time>=c.start&&session.time<c.end);updateText($('#caption'),trial?'讲解暂停。现在修改的是自己的尝试；返回后恢复原来的讲解时间和画面。':spoken?.text||spoken?.[language]||scene.caption);$('#caption').hidden=!captionOn;
 const waiting=!!questionTimer&&!questionState?.held;$('#seek').value=session.time;updateText($('#clock'),`${clock(session.time)} / ${clock(DURATION)}`);updateText($('#play'),playing?'暂停':waiting?'留在本题':trial?'继续讲解':'播放');$('#play').setAttribute('aria-label',playing?'暂停讲解':waiting?'暂停自动继续':trial?'继续讲解':'播放讲解');
 $('#trial-banner').hidden=!trial;updateText($('#trial-description'),`${trialFromMoving?'先从这一步完成后的布局开始试。':''}原讲解停在 ${clock(session.savedTime??session.time)}，返回后可以接着看。`);$('#selected').value=session.selected;$('#undo').disabled=!session.history.length;
 for(const b of document.querySelectorAll('[data-chapter]'))b.setAttribute('aria-current',String(Number(b.dataset.chapterIndex)===scene.chapterIndex));
 renderQuestion(scene);if(!trial&&scene.key==='overlap-predict'){updateText($('#metrics'),answers.has(scene.key)?'当前仍是变形前的原布局。预测针对下一步；点击“继续看解释”，或在图中将 A 换形后验证。':'先作预测，再选择答案或直接点模块验证。这里暂不提前显示检查结论。');$('#metrics').classList.remove('bad');}else if(!trial&&frame.illustration){updateText($('#metrics'),'先看这一步怎样推出来。想试摆时，展开工具，选择一个模块。');$('#metrics').classList.remove('bad');}else if(reveal)status(pack,report,moving);else{updateText($('#metrics'),'先作判断，再选择答案或直接点模块验证。这里暂不提前显示检查结论。');$('#metrics').classList.remove('bad');}
}
function pause(){seekController?.cancel();playEpoch++;playing=false;narration.pause();cancelAnimationFrame(raf);raf=0;stopDrag();render();}
function play(){seekController?.cancel();stopQuestion();stopDrag();if(session.trial)leaveTrial(session);if(session.time>=DURATION){seek(session,0);asked.clear();answers.clear();}narration.currentTime=session.time;narration.playbackRate=Number($('#speed').value);const epoch=++playEpoch;playing=true;render();if(window.parent!==window)window.parent.postMessage({type:'interactive-play'},location.origin);narration.play().then(()=>{if(playing&&epoch===playEpoch){cancelAnimationFrame(raf);raf=requestAnimationFrame(tick);}}).catch(()=>{if(epoch!==playEpoch)return;pause();$('#mode-message').textContent='配音未能开始。请点击播放重试；也可逐章查看。';});}
function tick(){if(!playing||seekController?.active)return;const next=Math.min(DURATION,narration.currentTime);
 const stop=SCENES.find(s=>s.question&&!asked.has(s.key)&&session.time<s.end-.02&&next>=s.end-.02);session.time=stop?stop.end-.02:next;
 if(stop){asked.add(stop.key);narration.currentTime=session.time;pause();startQuestion(stop);$('#mode-message').textContent='留出10秒思考；不操作时公布答案，4秒后自动继续。';return;}
 render();if(session.time>=DURATION){pause();$('#mode-message').textContent='本课讲解结束。请继续完成本页综合Lab与课后习题。';}else raf=requestAnimationFrame(tick);
}
function begin(id){holdQuestion();pause();tools.open=true;if(!session.trial)trialFromMoving=frameAt(session.time,motion.matches).moving;enterTrial(session,id);$('#mode-message').textContent=`自己的尝试：${id} 已选中。可以拖动它，也可以用方向按钮移动；试完再回到讲解。`;render();}
function move(dx,dy){if(!session.trial)begin($('#selected').value);edit(session,p=>{p[session.selected].x+=dx;p[session.selected].y+=dy;});render();}
function returnToLesson(){stopDrag();if(session.trial)leaveTrial(session);$('#mode-message').textContent='已返回原讲解位置。点击播放继续；自己的尝试没有改变讲解示范。';render();}
$('#play').onclick=()=>{if(questionTimer){holdQuestion();return;}playing?pause():play();};$('#return').onclick=returnToLesson;
function jump(t){pause();locate(t);}
function locate(t){stopQuestion();questionState=null;questionKey=null;timerText.textContent='播放本题后会留出10秒思考时间。';seek(session,t);narration.currentTime=session.time;for(const s of SCENES)if(t<s.end){asked.delete(s.key);answers.delete(s.key);}lastQuestion=undefined;$('#mode-message').textContent='已回到讲解，可以从这里接着看。';render();}
seekController=bindSeek($('#seek'),{isPlaying:()=>playing,pause,seek:locate,play});
for(const [i,scene]of SCENES.entries()){if(i&&SCENES[i-1].chapterIndex===scene.chapterIndex)continue;const b=document.createElement('button');b.textContent=`${clock(scene.start)}　${scene.chapterIndex}. ${scene.chapter[language]}`;b.dataset.chapter=scene.start;b.dataset.chapterIndex=scene.chapterIndex;b.onclick=()=>jump(scene.start);$('#chapters').append(b);}
const stepLabel=document.createElement('label');stepLabel.textContent='定位推演步骤 ';const stepSelect=document.createElement('select');stepSelect.setAttribute('aria-label','定位推演步骤');for(const s of SCENES){const o=document.createElement('option');o.value=s.start;o.textContent=clock(s.start)+' '+s.title;stepSelect.append(o);}stepSelect.onchange=()=>jump(Number(stepSelect.value));stepLabel.append(stepSelect);$('#chapters').after(stepLabel);const endStep=document.createElement('button');endStep.textContent='查看本步结尾';endStep.onclick=()=>jump(sceneAt(session.time).end-.05);stepLabel.after(endStep);
$('#continue').onclick=continueQuestion;$('#speed').onchange=()=>narration.playbackRate=Number($('#speed').value);
$('#selected').onchange=e=>begin(e.target.value);$('#reshape').onclick=()=>{if(!session.trial)begin('A');edit(session,p=>{p.A.w=p.A.w===2?3:2;p.A.h=6/p.A.w;});render();};
for(const b of document.querySelectorAll('[data-move]'))b.onclick=()=>move(...b.dataset.move.split(',').map(Number));
$('#undo').onclick=()=>{if(session.history.length)session.trial=session.history.pop();render();};$('#reset').onclick=()=>{if(session.trial){session.trial=clone(session.base);session.history=[];render();}else begin(session.selected);};
$('#cc').onclick=()=>{captionOn=!captionOn;$('#cc').setAttribute('aria-pressed',String(captionOn));render();};
$('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('.player').requestFullscreen();}catch{$('#mode-message').textContent='当前浏览器未提供全屏；仍可直接操作图中模块。';}};
function position(e){const point=new DOMPoint(e.clientX,e.clientY).matrixTransform(world.getScreenCTM().inverse());return{x:point.x,y:8-point.y};}
stage.addEventListener('pointerdown',e=>{const g=e.target.closest('[data-block]');if(!g)return;e.preventDefault();const id=g.dataset.block;begin(id);blocks[id].g.focus({preventScroll:true});const point=position(e);drag={id,x:point.x,y:point.y,original:clone(session.trial),moved:false,pointerId:e.pointerId};stage.setPointerCapture(e.pointerId);});
stage.addEventListener('pointermove',e=>{if(!drag)return;const point=position(e),dx=Math.round(point.x-drag.x),dy=Math.round(point.y-drag.y);if(dx===0&&dy===0&&!drag.moved)return;if(!drag.moved){session.history.push(clone(drag.original));drag.moved=true;}session.trial=clone(drag.original);session.trial[drag.id].x+=dx;session.trial[drag.id].y+=dy;render();});
function stopDrag(){const id=drag?.pointerId;drag=null;if(id!=null&&stage.hasPointerCapture(id))stage.releasePointerCapture(id);}stage.addEventListener('pointerup',stopDrag);stage.addEventListener('pointercancel',stopDrag);
document.addEventListener('keydown',e=>{if(e.code==='Space'&&!e.repeat&&!/INPUT|BUTTON|TEXTAREA|SELECT/.test(e.target.tagName)){e.preventDefault();if(questionTimer)holdQuestion();else playing?pause():play();}});
narration.addEventListener('ended',()=>{if(!seekController?.active&&Number.isFinite(narration.duration)&&Math.abs(narration.currentTime-narration.duration)<.1){session.time=DURATION;pause();}});
window.addEventListener('pagehide',()=>{seekController?.dispose();playEpoch++;playing=false;narration.pause();cancelAnimationFrame(raf);stopQuestion();stopDrag();});document.addEventListener('visibilitychange',()=>{if(document.hidden){holdQuestion();pause();}});motion.addEventListener('change',render);
if(new URLSearchParams(location.search).has('embed')){
 document.body.classList.add('embedded');document.querySelector('main>a').hidden=true;document.querySelector('header').hidden=true;document.querySelector('footer').hidden=true;
 const next=document.createElement('button');next.className='next-practice';next.textContent='继续本页的动手实验 ↓';next.onclick=()=>window.parent.postMessage({type:'interactive-go-lab'},location.origin);tools.after(next);
 const notify=()=>window.parent.postMessage({type:'interactive-height',height:Math.ceil(document.querySelector('main').getBoundingClientRect().height)+4},location.origin);new ResizeObserver(notify).observe(document.querySelector('main'));notify();
 window.addEventListener('message',e=>{if(e.source===window.parent&&e.origin===location.origin&&e.data?.type==='interactive-pause'){holdQuestion();pause();}});
}
render();$('#play').disabled=false;

window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});

session.time=restoreScene(NARRATION);installLanguageChoice(()=>{const s=sceneAt(session.time);return{key:s.key,fraction:(session.time-s.start)/(s.end-s.start)};});render();
