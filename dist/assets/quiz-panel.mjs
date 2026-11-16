const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const L=(v,lang)=>!v? '' : typeof v==='string'? v : (v[lang]??v.zh??v.en??'');
const letter=i=>String.fromCharCode(65+i);

export function quizPanel(m,lang,progress){
 const saved=progress.quizzes||{};
 return `<div class="quiz-panel" data-quiz-panel data-module="${esc(m.id)}"><h3>${lang==='en'?'Check understanding':'检查理解'} <span class="small">${lang==='en'?'Choose one. The explanation appears immediately.':'选一个答案，解析会立即出现。'}</span></h3>${m.quiz.map((q,i)=>{const a=saved[m.id+':'+i];return `<article class="quiz-item" data-q="${i}"><h3><span class="mono">${String(i+1).padStart(2,'0')} / </span>${esc(L(q.text,lang))}</h3><div class="quiz-options">${q.options.map((o,j)=>`<button data-choice="${j}" class="${a===j?(j===q.answer?'correct':'incorrect'):''}" aria-pressed="${a===j}">${letter(j)}. ${esc(L(o,lang))}</button>`).join('')}</div><p class="feedback ${Number.isInteger(a)&&a!==q.answer?'bad':''}" ${Number.isInteger(a)?'':'hidden'}>${Number.isInteger(a)?(a===q.answer?(lang==='en'?'Correct. ':'判断正确。'):(lang==='en'?'Look at the reason. ':'再看一下原因。'))+esc(L(q.explain,lang)):''}</p></article>`;}).join('')}<p class="quiz-score small" data-quiz-score>${scoreLine(m,saved,lang)}</p></div>`;
}
function scoreLine(m,saved,lang){const n=m.quiz.length,answered=m.quiz.filter((_,i)=>Number.isInteger(saved[m.id+':'+i])).length,right=m.quiz.filter((q,i)=>saved[m.id+':'+i]===q.answer).length;return lang==='en'?`Answered ${answered}/${n}; correct ${right}.`:`已作答 ${answered}/${n} 题，答对 ${right} 题。`;}
export function bindQuizPanel(m,progress,save,lang){
 const root=document.querySelector('[data-quiz-panel]');if(!root)return;
 progress.quizzes=progress.quizzes||{};
 root.onclick=e=>{const b=e.target.closest('[data-choice]');if(!b)return;const item=b.closest('[data-q]'),i=Number(item.dataset.q),j=Number(b.dataset.choice),q=m.quiz[i];progress.quizzes[m.id+':'+i]=j;save();for(const x of item.querySelectorAll('[data-choice]')){const k=Number(x.dataset.choice);x.classList.toggle('correct',k===j&&j===q.answer);x.classList.toggle('incorrect',k===j&&j!==q.answer);x.setAttribute('aria-pressed',String(k===j));}const fb=item.querySelector('.feedback');fb.hidden=false;fb.classList.toggle('bad',j!==q.answer);fb.textContent=(j===q.answer?(lang==='en'?'Correct. ':'判断正确。'):(lang==='en'?'Look at the reason. ':'再看一下原因。'))+L(q.explain,lang);const score=root.querySelector('[data-quiz-score]');if(score)score.textContent=scoreLine(m,progress.quizzes,lang);};
}
