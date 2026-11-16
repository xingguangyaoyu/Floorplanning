export function selectedLanguage(){
 const query=new URLSearchParams(globalThis.location?.search||'').get('lang');if(query==='en'||query==='zh')return query;
 try{return JSON.parse(globalThis.localStorage?.getItem('floorplanning-language')||'"zh"')==='en'?'en':'zh';}catch{return'zh';}
}
export const language=selectedLanguage();
export const lessonSuffix=language==='en'?'-en':'';
export function restoreScene(data){
 const q=new URLSearchParams(location.search),s=data.scenes.find(s=>s.key===q.get('scene'));
 return s?s.start+Math.max(0,Math.min(.999,Number(q.get('fraction'))||0))*(s.end-s.start):0;
}
export function installLanguageChoice(getState){
 document.documentElement.lang=language==='en'?'en':'zh-CN';
 const label=document.createElement('label');label.className='teaching-language';label.textContent=language==='en'?'Language ':'语言 ';
 const select=document.createElement('select');select.setAttribute('aria-label',language==='en'?'Teaching language':'讲解语言');
 for(const[value,name]of[['zh','中文'],['en','English']]){const option=document.createElement('option');option.value=value;option.textContent=name;select.append(option);}select.value=language;
 select.onchange=()=>{const s=getState(),url=new URL(location.href);url.searchParams.set('lang',select.value);url.searchParams.set('scene',s.key);url.searchParams.set('fraction',s.fraction);location.replace(url);};
 label.append(select);document.querySelector('.controls').append(label);
}
