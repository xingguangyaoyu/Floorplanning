import catalog from'./page-locale-data.mjs?v=8e31dd52e8a7';
const HAN=/[\u4e00-\u9fff]/,token=/\{(\d+)\}/g;
const unresolvedCapture=value=>HAN.test(value)&&!(/^[A-Z]和[A-Z]$/).test(value);
const reverse=Object.fromEntries(Object.entries(catalog).filter(([zh,en])=>HAN.test(zh)&&/[A-Za-z]/.test(en)).map(([zh,en])=>[en,zh]));
const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
function patterns(entries){return Object.entries(entries).filter(([key])=>/\{\d+\}/.test(key)).map(([key,value])=>{
 const ids=[],literals=[],pieces=[];let at=0;
 for(const match of key.matchAll(token)){const part=key.slice(at,match.index);literals.push(part);pieces.push(escape(part),'([\\s\\S]*?)');ids.push(match[1]);at=match.index+match[0].length;}
 const tail=key.slice(at);literals.push(tail);pieces.push(escape(tail));return{regex:new RegExp('^'+pieces.join('')+'$'),ids,value,leadingCapture:key.startsWith('{'),literals:literals.filter(Boolean),weight:literals.join('').length};
 }).sort((a,b)=>b.weight-a.weight);}
const formats={en:patterns(catalog),zh:patterns(reverse)},cache=new Map();
let language='zh',root=null,observer=null;
const textMemory=new WeakMap(),attributeMemory=new WeakMap(),unresolved=new Set();
export function translatePageText(value,lang=language,depth=0){
 const text=String(value??'');if(!text.trim()||depth>5)return text;
 const dict=lang==='en'?catalog:reverse,trim=text.trim(),key=lang+'\0'+trim;
 if(cache.has(key))return text.replace(trim,()=>cache.get(key));
 if(lang==='zh'&&HAN.test(trim))return text;
 let result=dict[trim];
 if(result==null&&lang==='en'&&trim.startsWith('未通过：'))result='Failed: '+translatePageText(trim.slice(4),lang,depth+1);
 if(result==null&&lang==='en'&&/^[A-Z]和[A-Z]$/.test(trim))result=trim.replace('和',' and ');
 // Quiz letters are structure, not part of a translated answer or module ID.
 const answer=trim.match(/^([A-Z]\.\s+)([\s\S]+)$/);
 if(result==null&&answer)result=answer[1]+translatePageText(answer[2],lang,depth+1);

 if(result==null&&trim.includes('\n'))result=trim.split('\n').map(s=>translatePageText(s,lang,depth+1)).join('\n');
 if(result==null)for(const f of formats[lang]){
  if(!f.literals.every(s=>trim.includes(s)))continue;
  const match=f.regex.exec(trim);if(!match)continue;
  if((f.weight<5&&match.slice(1).some(unresolvedCapture))||(f.leadingCapture&&unresolvedCapture(match[1])))continue;
  if(match.slice(1).some(v=>f.literals.some(part=>part.length>=3&&v.includes(part))))continue;
  const values=Object.fromEntries(f.ids.map((id,i)=>[id,match[i+1]]));
  result=f.value.replace(token,(_,id)=>translatePageText(values[id]??'',lang,depth+1));break;
 }
 if(result==null&&trim.includes('；'))result=trim.split('；').map(s=>translatePageText(s,lang,depth+1)).join('; ');
 if(result==null&&/^(PASS|FAIL|INCOMPLETE|ERROR)\s+/.test(trim)){
  const m=trim.match(/^(PASS|FAIL|INCOMPLETE|ERROR)(\s+)([\s\S]*)$/);result=m[1]+m[2]+translatePageText(m[3],lang,depth+1);
 }
 if(result==null){
  const pieces=trim.split(/([\n，；])/);
  if(pieces.length>1)result=pieces.map(s=>s==='，'?', ':s==='；'?'; ':translatePageText(s,lang,depth+1)).join('');
 }
 if(result==null)result=trim;
 if(depth===0){if(cache.size>12000)cache.clear();cache.set(key,result);}
 return text.replace(trim,()=>result);
}
const protectedSelector='textarea,code,script,style,[data-i18n-raw],#language,.code-panel';
function excluded(node){const el=node.nodeType===1?node:node.parentElement;return !el||!!el.closest(protectedSelector);}
function translateNode(node){
 if(excluded(node))return;
 const current=node.nodeValue,old=textMemory.get(node),source=old&&current===old.applied?old.source:current;
 const applied=translatePageText(source);textMemory.set(node,{source,applied});if(current!==applied)node.nodeValue=applied;
 if(language==='en'&&HAN.test(applied)&&unresolved.size<2000)unresolved.add(source.trim());
}
function translateAttributes(el){
 if(excluded(el))return;
 let stored=attributeMemory.get(el);if(!stored){stored={};attributeMemory.set(el,stored);}
 for(const name of['aria-label','title','placeholder'])if(el.hasAttribute(name)){
  const current=el.getAttribute(name),old=stored[name],source=old&&current===old.applied?old.source:current,applied=translatePageText(source);stored[name]={source,applied};if(applied!==current)el.setAttribute(name,applied);
 }
}
function scan(node){
 if(node.nodeType===3){translateNode(node);return;}if(node.nodeType!==1||excluded(node))return;
 if(node.tagName==='OPTION'&&!node.hasAttribute('value'))node.setAttribute('value',node.value);
 translateAttributes(node);for(const child of node.childNodes)scan(child);
}
export function refreshPageLocale(){if(root?.isConnected)scan(root);}
export function setPageLanguage(lang){language=lang==='en'?'en':'zh';unresolved.clear();refreshPageLocale();}
export function attachPageLocale(element,lang){
 observer?.disconnect();root=element;language=lang==='en'?'en':'zh';unresolved.clear();scan(root);
 observer=new MutationObserver(records=>{
  const targets=new Set();for(const r of records){if(r.type==='childList')for(const child of r.addedNodes)targets.add(child);else if(r.type==='characterData')targets.add(r.target);else if(r.type==='attributes')targets.add(r.target);}
  for(const target of targets)if(root.contains(target))scan(target);
 });observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','title','placeholder']});
 return()=>observer?.disconnect();
}
export function pageLocaleDiagnostics(){return{language,unresolved:[...unresolved]};}
// Separate authored status/test labels from the student's code, stderr and stdout.
export function renderPythonReport(output,data,summary){
 output.replaceChildren();for(const c of data.checks){output.append(document.createTextNode(c.status.padEnd(10)+' '));const label=document.createElement('span');label.textContent=c.name;output.append(label);
  if(c.error){const raw=document.createElement('span');raw.dataset.i18nRaw='';raw.textContent=' — '+c.error;output.append(raw);}output.append(document.createTextNode('\n'));
 }
 if(data.stdout){const raw=document.createElement('span');raw.dataset.i18nRaw='';raw.textContent='\n'+data.stdout;output.append(raw);}
 const status=document.createElement('span');status.textContent='\n'+summary;output.append(status);refreshPageLocale();
}
export function renderPythonError(output,error){output.replaceChildren();const raw=document.createElement('span');raw.dataset.i18nRaw='';raw.textContent=error;output.append(raw);}
