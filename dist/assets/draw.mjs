import {COLORS,MODULES,OUTLINE,inspect,interpolatePack,parseTree} from './core.mjs?v=b7d4c6912114';
export const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const L=(x,lang='zh')=>typeof x==='object'&&x!==null?(x[lang]??x.en??''):String(x??'');
function text(x,y,s,size=20,color='#e5ede8',extra=''){return `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" ${extra}>${esc(s)}</text>`;}
function wrap(s,limit){
 if(!/[\u2e80-\uffff]/.test(s)){const lines=[];let line='';for(const word of s.split(/\s+/)){if(line&&line.length+1+word.length>limit){lines.push(line);line='';}line+=(line?' ':'')+word;}if(line)lines.push(line);return lines;}
 const lines=[];let line='',len=0;for(const ch of Array.from(s)){const k=/[\u2e80-\uffff]/.test(ch)?1.7:1;if(len+k>limit&&line){lines.push(line);line='';len=0;}line+=ch;len+=k;}if(line)lines.push(line);return lines;
}
export function boardSVG(pack,{bbox=false,focus=[],skyline=false,extent=12,soft=true,interactive=false,lang='zh',labels=true}={}){
 const X=430,Y=166,C=35;let body='';
 body+=`<rect x="${X}" y="${Y}" width="${10*C}" height="${8*C}" fill="#173338" stroke="#74938f" stroke-width="1.5"/>`;
 for(let x=1;x<10;x++)body+=`<path d="M${X+x*C} ${Y}v${8*C}" stroke="#29464a"/>`;
 for(let y=1;y<8;y++)body+=`<path d="M${X} ${Y+y*C}h${10*C}" stroke="#29464a"/>`;
 for(let x=0;x<=12;x+=2)body+=text(X+x*C,Y+8*C+23,x,12,'#9cb5ae','text-anchor="middle"');
 for(let y=0;y<=8;y+=2)body+=text(X-15,Y+(8-y)*C+4,y,12,'#9cb5ae','text-anchor="middle"');
 body+=text(X,Y-14,'10 × 8',13,'#b8c9c0');
 const state=inspect(pack,OUTLINE,MODULES,{soft,rotate:true}),bad=new Set(state.errors.flatMap(e=>e.ids));
 for(const [id,r]of Object.entries(pack)){
  const xx=X+r.x*C,yy=Y+(8-r.y-r.h)*C,focused=focus.includes(id),opacity=r.opacity??1;
  body+=`<g ${interactive?`class="draggable-block" role="button" tabindex="0" data-block="${esc(id)}" aria-label="${lang==='zh'?'模块':'Block'} ${id}"`:''} opacity="${opacity}"><rect x="${xx+1}" y="${yy+1}" width="${Math.max(1,r.w*C-2)}" height="${Math.max(1,r.h*C-2)}" rx="3" fill="${COLORS[id]||'#777'}" stroke="${focused?'#f6e4b5':bad.has(id)?'#f3978f':'#10292d'}" stroke-width="${focused||bad.has(id)?3:1}"/>`;
  body+=text(xx+r.w*C/2,yy+r.h*C/2+5,id,23,'#fff','text-anchor="middle" font-weight="600"');
  if(labels&&r.h>=1.8)body+=text(xx+r.w*C/2,yy+r.h*C/2+25,`${fmt(r.w)} × ${fmt(r.h)}`,10,'#edf3ef','text-anchor="middle"');
  body+='</g>';
 }
 if(bbox&&Object.keys(pack).length){const b=state.bbox;body+=`<rect x="${X+b.x*C-3}" y="${Y+(8-b.y-b.h)*C-3}" width="${b.w*C+6}" height="${b.h*C+6}" rx="3" fill="none" stroke="#e1c99a" stroke-width="2" stroke-dasharray="7 5"/>`;body+=text(X,492,`${lang==='zh'?'包围盒':'Bounding box'}  ${fmt(b.w)} × ${fmt(b.h)} = ${fmt(b.area)}`,17,'#e1c99a');}
 if(skyline){const xs=[...new Set([0,...Object.values(pack).flatMap(r=>[r.x,r.x+r.w])])].sort((a,b)=>a-b);let d='';for(let i=0;i<xs.length-1;i++){const lo=xs[i],hi=xs[i+1],h=Math.max(0,...Object.values(pack).filter(r=>r.x<hi&&r.x+r.w>lo).map(r=>r.y+r.h));d+=`${d?'L':'M'}${X+lo*C},${Y+(8-h)*C}L${X+hi*C},${Y+(8-h)*C}`;}body+=`<path d="${d}" fill="none" stroke="#f3cd7d" stroke-width="3.5"/>`;}
 return body;
}
export function treeSVG(tree,{x=45,y=190,w=280,h=235,placed=[]}={}){
 if(typeof tree==='string')try{tree=parseTree(tree);}catch{return '';}
 const nodes=[],links=[];let order=0,maxDepth=0;
 function go(n,depth,parent,side){if(!n)return;go(n.left,depth+1,n,'left');nodes.push({n,depth,i:order++});maxDepth=Math.max(maxDepth,depth);go(n.right,depth+1,n,'right');if(parent)links.push({a:parent.id,b:n.id,side});}go(tree,0);
 const point=Object.fromEntries(nodes.map(({n,depth,i})=>[n.id,[x+(i+.5)*w/nodes.length,y+depth*Math.min(54,h/Math.max(1,maxDepth))]]));let body='';
 for(const e of links){const a=point[e.a],b=point[e.b];body+=`<path d="M${a} L${b}" fill="none" stroke="#718b85" stroke-width="2" ${e.side==='right'?'stroke-dasharray="5 5"':''}/>`;}
 for(const {n}of nodes){const [xx,yy]=point[n.id];body+=`<circle cx="${xx}" cy="${yy}" r="18" fill="${placed.includes(n.id)?COLORS[n.id]:'#18363a'}" stroke="${COLORS[n.id]}" stroke-width="2"/>`+text(xx,yy+6,n.id,18,'#edf3ee','text-anchor="middle"');}return body;
}
export const fmt=n=>Number.isInteger(n)?String(n):Number(n).toFixed(2).replace(/0+$/,'').replace(/\.$/,'');
function panelSVG(panel,formula,lang){
 let out=text(42,169,L(panel.heading,lang),16,'#b6cdbf','font-weight="600"'),y=209;
 for(const row of panel.lines){for(const line of wrap(L(row,lang),lang==='zh'?29:36)){out+=text(42,y,line,15,'#e5ede8');y+=24;}y+=10;}
 if(formula){out+=`<rect x="34" y="${Math.max(338,y+3)}" width="337" height="77" rx="4" fill="#1b3b3f" stroke="#6c8174"/>`;wrap(formula,38).slice(0,2).forEach((line,i)=>out+=text(49,Math.max(367,y+32)+i*24,line,16,'#eddbb2'));}
 return out;
}
function factorsSVG(lang,{area=6,pairs=[[1,6],[2,3],[3,2],[6,1]],reveal=true}={}){let out='';for(const [i,[w,h]]of pairs.entries()){const x=433+i%2*235,y=(pairs.length===2?210:155)+Math.floor(i/2)*140,ok=w/h>=.5&&w/h<=2;
 out+=`<rect x="${x}" y="${y}" width="211" height="125" rx="4" fill="#18373b" stroke="${!reveal?'#6c8174':ok?'#8ebda5':'#b57b73'}"/>`;
 out+=`<rect x="${x+12}" y="${y+11}" width="${w*13}" height="${h*13}" fill="#437ba5" stroke="#e0d9bd"/>`;
 out+=text(x+102,y+32,`${w} × ${h}`,19)+text(x+102,y+59,`r = ${reveal?fmt(w/h):'?'}`,15,'#c7d6ca')+text(x+102,y+91,reveal?(ok?(lang==='zh'?'允许':'ALLOWED'):(lang==='zh'?'比例超界':'RATIO FAIL')):'?',14,ok?'#a6d1b7':'#efaaa0')+text(x+12,y+113,`${lang==='zh'?'面积':'area'} ${area}`,12,'#c7d6ca');
 }return out;}
export function renderFilm(stories,timing,time,{lang='zh',lesson='08',captions=true,reduceMotion=false}={}){
 let index=timing.scenes.findIndex(s=>time<s.end);if(index<0)index=stories.length-1;const timed=timing.scenes[index],s=stories[index],previous=stories[Math.max(0,index-1)],progress=reduceMotion||s.cut||JSON.stringify(previous.pack)===JSON.stringify(s.pack)?1:Math.max(0,Math.min(1,(time-timed.animate)/(s.animateDuration||1.25)));
 const pack=interpolatePack(previous.pack,s.pack,progress),settled=progress>=1,status=inspect(s.pack,OUTLINE,MODULES,{soft:true,rotate:true});
 let body=`<rect width="960" height="540" fill="#10282d"/><path d="M32 115H928" stroke="#385057"/>`;
 body+=text(40,32,`FLOORPLANNING  /  ${lesson==='intro'?'START HERE':'LESSON '+lesson}  /  ${s.chapterIndex?`CHAPTER ${s.chapterIndex} · STEP ${s.within}`:String(index+1).padStart(2,'0')}`,12,'#9eb6ad','letter-spacing="1.3"');
 if(s.chapterIndex)body+=text(916,32,`${s.chapterIndex} / ${Math.max(...stories.map(v=>v.chapterIndex||0))}`,13,'#e3d1aa','text-anchor="end"');
 const title=wrap(L(s.title,lang),lang==='zh'?46:52);title.forEach((line,i)=>body+=text(40,77+i*28,line,title.length>1?25:32,'#f2eee4','font-weight="500"'));
 body+=s.shapeExamples?factorsSVG(lang,s.shapeExamples):s.factors?factorsSVG(lang):boardSVG(s.check==='shape'?{A:pack.A}:pack,{focus:s.focus,bbox:s.bbox&&settled,skyline:s.skyline,lang});
 if(s.stateLabel)body+=text(780,144,L(s.stateLabel,lang),13,'#eddbb2','text-anchor="end"');
 for(const [key,color]of [['overlapRegion','#ed8176'],['emptyRegion','#d5c088']]){const r=s[key];if(r&&settled)body+=`<rect x="${430+r.x*35}" y="${166+(8-r.y-r.h)*35}" width="${r.w*35}" height="${r.h*35}" fill="${color}" fill-opacity=".35" stroke="${color}" stroke-width="3" stroke-dasharray="4 3"/>`;}
 if(s.panel)body+=panelSVG(s.panel,s.formula,lang);
 else if(s.tree)body+=treeSVG(s.tree,{placed:Object.keys(s.pack)});
 else if(s.pair){body+=text(42,176,lang==='zh'?'两个排列':'TWO PERMUTATIONS',13,'#a7bdb5');body+=text(42,215,'pos   '+s.pair[0].split('').join(' '),21);body+=text(42,253,'neg   '+s.pair[1].split('').join(' '),21);body+=text(42,295,lang==='zh'?'同顺序 → 左右':'Same order → horizontal',15,'#9fc9b3');body+=text(42,327,lang==='zh'?'反顺序 → 上下':'Reverse order → vertical',15,'#d8c394');}
 else if(s.stack){body+=text(42,178,lang==='zh'?'栈  ·  栈顶在上':'STACK  ·  TOP FIRST',13,'#a7bdb5');s.stack.slice().reverse().forEach((str,j)=>{body+=`<rect x="42" y="${198+j*56}" width="258" height="43" rx="3" fill="#1b3a3d" stroke="#43645c"/>`+text(57,226+j*56,str,19);});}
 else if(s.anneal){const e=s.anneal;const lines=[['ΔE',fmt(e.delta)],['T',fmt(e.T)],['p',e.probability.toFixed(3)],['u',e.u.toFixed(3)],[lang==='zh'?'决策':'Decision',L(e.accepted?{zh:'接受',en:'ACCEPT'}:{zh:'拒绝',en:'REJECT'},lang)]];lines.forEach(([k,v],i)=>{body+=text(42,190+i*39,k,16,'#a7bdb5')+text(290,190+i*39,v,19,'#e3d1aa','text-anchor="end"');});}
 else{body+=text(42,180,lang==='zh'?'同一组模块，贯穿七节课':'ONE SHARED FIVE-BLOCK INSTANCE',13,'#a7bdb5');MODULES.forEach((original,i)=>{const m=pack[original.id]?{id:original.id,...pack[original.id]}:original;body+=`<rect x="42" y="${202+i*37}" width="12" height="12" rx="2" fill="${COLORS[m.id]}"/>`+text(70,214+i*37,`${m.id}   ${fmt(m.w)} × ${fmt(m.h)}   ${lang==='zh'?'面积':'area'} ${fmt(m.w*m.h)}`,17);});}
 if(s.metrics){const rows=[[lang==='zh'?'模块面积和':'BLOCK AREA','23'],[lang==='zh'?'外框密度':'OUTLINE DENSITY',settled&&status.legal?'28.75%':'—'],[lang==='zh'?'包围盒面积':'BOX AREA',settled?fmt(status.bbox.area):'…']];rows.forEach(([k,v],i)=>{body+=text(845,178+i*66,k,11,'#a9bdb4','text-anchor="middle"')+text(845,207+i*66,v,24,'#f1e8d4','text-anchor="middle"');});}
 const shape=pack.A,shapeOK=shape&&shape.w>0&&shape.h>0&&Math.abs(shape.w*shape.h-6)<1e-7&&shape.w/shape.h>=.5-1e-8&&shape.w/shape.h<=2+1e-8;
 const badge=s.check==='none'?'':!settled?L({zh:'正在变化，等待重新检查',en:'Moving · recheck after settling'},lang):s.check==='shape'?L({zh:'仅检查 A 的形状：'+(shapeOK?'通过':'未通过'),en:'A SHAPE ONLY · '+(shapeOK?'ALLOWED':'FAIL')},lang):!status.complete?L({zh:'摆放过程，模块尚未齐全',en:'Placement in progress'},lang):status.legal?L({zh:'合法：完整 · 在框内 · 无重叠',en:'LEGAL · complete, inside, separate'},lang):L({zh:'需要修复：'+status.errors.map(e=>e.ids.join('/')+' '+({outside:'越界',overlap:'重叠',aspect:'宽高比',shape:'形状',area:'面积'}[e.code]||e.code)).join('；'),en:'REPAIR · '+status.errors.map(e=>e.ids.join('/')+' '+e.code).join('; ')},lang);
 body+=text(42,452,badge,13,!settled?'#b9c7bf':(s.check==='shape'?shapeOK:status.legal)?'#9cc9b0':'#efaaa0');
 if(captions){body+=`<rect x="25" y="505" width="910" height="31" rx="4" fill="#08191d"/>`;const say=L(s.say,lang),lines=wrap(say,lang==='zh'?100:118);if(lines.length===1)body+=text(480,527,lines[0],14,'#edf0e7','text-anchor="middle"');else{body+=`<rect x="25" y="482" width="910" height="54" rx="4" fill="#08191d"/>`;lines.slice(0,2).forEach((str,i)=>body+=text(480,504+i*21,str,14,'#edf0e7','text-anchor="middle"'));}}
 return {svg:`<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540" role="img" aria-label="${esc(L(s.title,lang))}" font-family="Microsoft YaHei, Segoe UI, sans-serif">${body}</svg>`,index,scene:s,settled};
}
export function renderBoard(pack,opts={}){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="390 125 480 395" role="img" aria-label="${opts.lang==='en'?'Floorplan packing board':'布图实验网格'}" font-family="Microsoft YaHei, Segoe UI, sans-serif">${boardSVG(pack,{...opts,interactive:true})}</svg>`;}
