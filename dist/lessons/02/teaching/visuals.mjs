import{sceneProgress,motionProgress}from'../../../assets/voice-timing.mjs';
import{COLORS}from'../../../assets/core.mjs';import{auditRows,intersection,describeError02}from'../../../assets/legality02.mjs';
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const text=(x,y,s,size=22,color='#254c42',anchor='middle')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" text-anchor="${anchor}">${esc(s)}</text>`;
const rect=(x,y,w,h,fill,stroke='#b4c6b5',extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${fill}" stroke="${stroke}" ${extra}/>`;
const clamp01=v=>Math.max(0,Math.min(1,v)),ease=v=>{const t=clamp01(v);return t*t*(3-2*t)};
const fade=(v,a,b)=>clamp01((v-a)/(b-a));
const line=(x1,y1,x2,y2,color,width=2,dash='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}"${dash?` stroke-dasharray="${dash}"`:''}/>`;
const badge=(x,y,s,color='#a34231',size=15)=>{const w=Math.max(58,String(s).length*size*.92+18);return rect(x,y-size-3,w,size+12,'#fff8f2',color)+text(x+9,y, s,size,color,'start');};
function geo(outline=[10,8],opts={}){const{x=100,y=95,w=760,h=350}=opts,u=Math.min(w/outline[0],h/outline[1]);return{u,ox:x+(w-outline[0]*u)/2,oy:y+(h-outline[1]*u)/2};}
export function board(rows,outline=[10,8],opts={}){const{x=100,y=95,w=760,h=350,corners=false,interactive=true,showPairs=true,focus=[]}=opts,{u,ox,oy}=geo(outline,opts);let s=`<g data-board="true" data-unit="${u}">`+rect(ox,oy,outline[0]*u,outline[1]*u,'#f7faf2','#8caa95');
 for(let i=1;i<outline[0];i++)s+=`<path d="M${ox+i*u} ${oy}v${outline[1]*u}" stroke="#dce6d8"/>`;for(let i=1;i<outline[1];i++)s+=`<path d="M${ox} ${oy+i*u}h${outline[0]*u}" stroke="#dce6d8"/>`;
 const valid=rows.map((r,i)=>({r,i})).filter(({r})=>r.slice(1).every(Number.isFinite)&&r[3]>0&&r[4]>0);
 for(const{r:[id,X,Y,W,H],i}of valid){const px=ox+X*u,py=oy+(outline[1]-Y-H)*u,color=COLORS[id]||(['#437ba5','#c08a42'][i%2]);s+=`<g ${interactive?`data-row="${i}" role="button" tabindex="0" aria-label="模块 ${esc(id)}，第${i+1}行"`:''} opacity="${focus.length&&!focus.includes(id)?.45:1}">`+rect(px,py,W*u,H*u,color,'#fff');if(W*u>=25&&H*u>=20)s+=text(px+W*u/2,py+H*u/2+4,id,Math.min(25,u*.7),'#fff');if(W*u>=55&&H*u>=50)s+=text(px+W*u/2,py+H*u/2+24,W+'×'+H,14,'#fff');if(corners)for(const[a,b]of[[0,0],[W,0],[0,H],[W,H]])s+=`<circle cx="${px+a*u}" cy="${py+b*u}" r="4" fill="#fff" stroke="#853c2c"/>`;s+='</g>';}
 if(showPairs)for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++){if(!valid.some(a=>a.i===i)||!valid.some(a=>a.i===j))continue;const v=intersection(rows[i],rows[j]);if(v.area>0)s+=rect(ox+Math.max(rows[i][1],rows[j][1])*u,oy+(outline[1]-Math.min(rows[i][2]+rows[i][4],rows[j][2]+rows[j][4]))*u,v.dx*u,v.dy*u,'url(#collision)','#a34231','pointer-events="none"');}
 s+=text(ox,oy+outline[1]*u+22,'0',15,'#678270')+text(ox+outline[0]*u,oy+outline[1]*u+22,String(outline[0]),15,'#678270')+text(ox-16,oy+7,String(outline[1]),15,'#678270')+text(ox+outline[0]*u/2,oy-14,'外框 '+outline[0]+'×'+outline[1],17);return s+'</g>';}
const cards=(items,p)=>items.map(([h,b],i)=>{const x=55+(i%2)*455,y=110+Math.floor(i/2)*155,on=p*items.length>=i,t=ease((p*items.length-i)*1.15);return `<g opacity="${on?1:.22}" transform="translate(0 ${(1-t)*16})">`+rect(x,y,415,130,on?'#edf3e8':'#f3f6ef',on?'#72997e':'#c8d4c6')+text(x+20,y+38,h,25,'#234e40','start')+text(x+20,y+85,b,19,'#58796a','start')+'</g>';}).join('');
const rowName=(rows,id)=>rows.find(r=>r[0]===id);
function motionLayer(scene,rows,time,o,opts){
 if(!scene.from||!scene.rows)return'';const g=geo(o,opts),from=scene.from,to=scene.rows,moved=to.map((r,i)=>(r[1]!==from[i]?.[1]||r[2]!==from[i]?.[2])?i:-1).filter(i=>i>=0);if(!moved.length)return'';
 let s='';for(const i of moved){const a=from[i],b=rows[i],id=b[0],color=COLORS[id]||'#437ba5',ax=g.ox+a[1]*g.u,ay=g.oy+(o[1]-a[2]-a[4])*g.u,bx=g.ox+b[1]*g.u,by=g.oy+(o[1]-b[2]-b[4])*g.u;
  s+=rect(ax,ay,a[3]*g.u,a[4]*g.u,'none',color,`stroke-dasharray="7 6" stroke-width="1.8" opacity=".55" pointer-events="none"`);
  if(Math.abs(bx-ax)>.8||Math.abs(by-ay)>.8)s+=`<path d="M${ax+a[3]*g.u/2} ${ay+a[4]*g.u/2} L${bx+b[3]*g.u/2} ${by+b[4]*g.u/2}" stroke="${color}" stroke-width="2" stroke-dasharray="5 5" opacity=".65" marker-end="url(#move-arrow)" pointer-events="none"/>`;
  const nx=Math.round(b[1]*10)/10,ny=Math.round(b[2]*10)/10;
  s+=`<g opacity="${1-fade(clamp01((time-scene.start)/(scene.end-scene.start)),.74,.9)}">`+badge(bx+2,ay-8,`(${nx}, ${ny})`,color,14)+'</g>';
 }
 return s;
}
function edgeLayer(scene,rows,p,o,opts,withMotion){
 const g=geo(o,opts),e=rowName(rows,'E');if(!e)return'';const W=o[0],xr=e[1]+e[3],bx=g.ox+W*g.u,over=xr>W;if(!over)return'';
 const top=g.oy+(o[1]-e[2]-e[4])*g.u,bot=g.oy+(o[1]-e[2])*g.u,show=withMotion?.18+.4:.1;
 let s=`<g opacity="${fade(p,show,show+.18)}">`;
 s+=line(bx,g.oy,bx,g.oy+o[1]*g.u,'#a34231',2,'6 5');
 s+=line(g.ox+xr*g.u,top,g.ox+xr*g.u,bot,'#a34231',2.5,'4 4');
 s+=text(bx+5,g.oy+16,'x=10',14,'#a34231','start');
 s+=`<path d="M${bx+2} ${top-96} H${g.ox+xr*g.u-2}" stroke="#a34231" stroke-width="1.6" marker-start="url(#dim-line)" marker-end="url(#dim-line)"/>`;
 s+=text((bx+g.ox+xr*g.u)/2,top-104,'越界 1',15,'#a34231'); if(scene.key!=='bounds')s+=text(928,g.oy-16,`右边缘 ${e[1]}+${e[3]}=${xr} > ${W}`,'18','#a34231','end');return s+'</g>';
}
function contactLayer(rows,p,o,opts){const g=geo(o,opts),c=rowName(rows,'C'),e=rowName(rows,'E');if(!c||!e)return'';const x=c[1]+c[3];if(Math.abs(e[1]-x)>0.01)return'';const y1=g.oy+(o[1]-Math.max(c[2],e[2]))*g.u,y2=g.oy+(o[1]-Math.min(c[2]+c[4],e[2]+e[4]))*g.u;
 return `<g opacity="${fade(p,.55,.8)}">`+line(g.ox+x*g.u,y1,g.ox+x*g.u,y2,'#2f7d5d',4,'5 4')+badge(g.ox+x*g.u+8,(y1+y2)/2,`x=${x}：共边，交集面积为 0`,'#2f7d5d',16)+'</g>';
}
function overlapLayer(rows,p,o,opts){const g=geo(o,opts),c=rowName(rows,'C'),e=rowName(rows,'E');if(!c||!e)return'';const v=intersection(c,e);if(v.area<=0)return'';const x=g.ox+Math.max(c[1],e[1])*g.u,y=g.oy+(o[1]-Math.min(c[2]+c[4],e[2]+e[4]))*g.u,w=v.dx*g.u,h=v.dy*g.u;
 return `<g opacity="${fade(p,.62,.85)}">`+rect(x,y,w,h,'none','#7d2c1e',`stroke-dasharray="6 4" stroke-width="2.5" pointer-events="none"`)+badge(x+w+8,y+h+10,`dx=${v.dx}，dy=${v.dy}，面积 ${v.area}`,'#7d2c1e',16)+'</g>';
}
function conflictLayer(scene,rows,p,o,opts){const g=geo(o,opts);if(scene.key==='multiple'){const pairs=auditRows(rows,o).pairs,times=[.12,.4,.68];let s='';pairs.forEach((v,i)=>{const id=v.ids.join('/'),x=g.ox+Math.max(rowName(rows,v.ids[0])[1],rowName(rows,v.ids[1])[1])*g.u,y=g.oy+(o[1]-Math.min(rowName(rows,v.ids[0])[2]+rowName(rows,v.ids[0])[4],rowName(rows,v.ids[1])[2]+rowName(rows,v.ids[1])[4]))*g.u,op=fade(p,times[i]||.8,(times[i]||.8)+.12);s+=`<g opacity="${op}">`+badge(x+v.dx*g.u+6,y+v.dy*g.u+10,`${id}：${v.area}`,'#7d2c1e',15)+'</g>';});const e=rowName(rows,'E');if(e&&e[1]+e[3]>o[0]&&p>.82)s+=`<g opacity="${fade(p,.82,.95)}">`+badge(g.ox+o[0]*g.u+8,g.oy+34,`E 右边缘 ${e[1]+e[3]} > ${o[0]}`,'#a34231',15)+'</g>';return s;}
 if(scene.key==='new-conflict'){const oldV=auditRows(scene.from,o).pairs,newV=auditRows(scene.rows,o).pairs;let s='';const oldA=oldV.find(v=>v.ids.join('/')==='A/D'),oldB=oldV.find(v=>v.ids.join('/')==='B/D'),nv=newV.find(v=>v.ids.join('/')==='C/D');for(const[v,k]of[[oldA,'A/D：1'],[oldB,'B/D：2']])if(v&&k){const x=g.ox+Math.max(rowName(scene.from,v.ids[0])[1],rowName(scene.from,v.ids[1])[1])*g.u,y=g.oy+(o[1]-Math.min(rowName(scene.from,v.ids[0])[2]+rowName(scene.from,v.ids[0])[4],rowName(scene.from,v.ids[1])[2]+rowName(scene.from,v.ids[1])[4]))*g.u;s+=`<g opacity="${fade(p,0,.25)}">`+badge(x+8,y+v.dy*g.u+8,k+' 已消失','#2f7d5d',14)+'</g>';}
  if(nv){const x=g.ox+Math.max(rowName(rows,'C')[1],rowName(rows,'D')[1])*g.u,y=g.oy+(o[1]-Math.min(rowName(rows,'C')[2]+rowName(rows,'C')[4],rowName(rows,'D')[2]+rowName(rows,'D')[4]))*g.u;s+=`<g opacity="${fade(p,.62,.82)}">`+badge(x+nv.dx*g.u+6,y+nv.dy*g.u+10,'C/D：2（新冲突）','#7d2c1e',15)+'</g>';}return s;}
 return'';
}
function projectionX(rows,p){const gx=560,base=330,unit=52,min=4,max=8,C=rowName(rows,'C'),E=rowName(rows,'E'),grow=ease(p/.4);
 let s=text(730,96,'横向：先取共同区间',24)+line(gx,base,gx+(max-min)*unit,base,'#8caa95',2);
 for(let v=min;v<=max;v++)s+=line(gx+(v-min)*unit,base,gx+(v-min)*unit,base+8,'#8caa95',1.5)+text(gx+(v-min)*unit,base+30,String(v),16,'#678270');
 const bar=(r,color,y,label)=>{const a=Math.max(min,r[1]),b=Math.min(max,r[1]+r[3]);return rect(gx+(a-min)*unit,y,(b-a)*unit*grow,26,color,'#fff',`opacity="${fade(p,.1,.35)}"`)+text(gx+(a-min)*unit-8,y+19,label,17,color,'end');};
 s+=bar(C,'#c08a42',190,'C [5,7]')+bar(E,'#bb7589',245,'E [6,8]');
 const x1=gx+(6-min)*unit,x2=gx+(7-min)*unit;if(p>.45)s+=`<g opacity="${fade(p,.45,.65)}">`+rect(x1,168,unit*grow,130,'#efc2ad','#a34231','opacity=".35"')+line(x1,350,x1,368,'#a34231',2)+line(x2,350,x2,368,'#a34231',2)+text((x1+x2)/2,390,'共同 [6,7]，宽 1',18,'#a34231')+'</g>';
 if(p>.7)s+=text(730,440,'5…7 与 6…8 的交集是 6…7','20','#254c42');
 return s;}
function projectionY(rows,p){const gx=620,base=360,unit=100,grow=ease(p/.4),C=rowName(rows,'C'),E=rowName(rows,'E');let s=text(760,96,'纵向：再看共同高度',24)+line(gx,base,gx+(2)*unit+90,base,'#8caa95',2);
 for(const[t,x]of[['0',gx],['2',gx+2*unit]])s+=text(x,base+28,t,16,'#678270');
 const col=(r,color,x,label)=>{const h=r[4]*unit*grow;return rect(x,base-h,44,h,color,'#fff',`opacity="${fade(p,.1,.35)}"`)+text(x+22,base-h-10,label,17,color);};
 s+=col(C,'#c08a42',gx+28,'C [0,2]')+col(E,'#bb7589',gx+165,'E [0,2]');
 if(p>.45)s+=`<g opacity="${fade(p,.45,.65)}">`+rect(gx+20,base-2*unit-14,190,2*unit+14,'none','#a34231','stroke-dasharray="6 4" stroke-width="2"')+text(gx+115,base-2*unit-26,'共同高 2','18','#a34231')+'</g>';
 if(p>.7)s+=text(760,445,'1 × 2 = 2','26','#7d2c1e');
 return s;}
export function renderScene(scene,time,trial,reduced){const p=sceneProgress(scene,time),o=scene.outline||[10,8];let rows=trial||scene.rows,body='';
 if(!trial&&scene.from){const q=motionProgress(scene,time,reduced),e=q*q*(3-2*q);rows=scene.rows.map((r,i)=>r.map((v,j)=>j===1||j===2?scene.from[i][j]+(v-scene.from[i][j])*e:v));}
 if(trial||scene.view==='board'){const opts={focus:trial?[]:scene.focus||[],showPairs:true};body=board(rows,o,opts);if(!trial&&scene.from)body+=motionLayer(scene,rows,time,o,opts);if(!trial){if(scene.key==='right'||scene.key==='outside')body+=edgeLayer(scene,rows,p,o,opts,scene.key==='right');else if(scene.key==='touch')body+=contactLayer(rows,p,o,opts);else if(scene.key==='overlap')body+=overlapLayer(rows,p,o,opts);else if(scene.key==='multiple'||scene.key==='new-conflict')body+=conflictLayer(scene,rows,p,o,opts);}}
 else if(scene.view==='intro-flow'){
  body+=rect(40,140,255,115,'#edf3e8','#72997e')+text(167,182,'输入',25,'#234e40')+text(167,220,'模块清单 + 固定外框',18,'#58796a');
  body+='<path d="M295 197h45" stroke="#72997e" stroke-width="2"/><path d="M340 197l-10-6v12z" fill="#72997e"/>';
  body+=rect(340,140,255,115,'#edf3e8','#72997e')+text(467,182,'自动摆放',25,'#234e40')+text(467,220,'算法摆放，人工微调',18,'#58796a');
  body+='<path d="M595 197h45" stroke="#72997e" stroke-width="2"/><path d="M640 197l-10-6v12z" fill="#72997e"/>';
  body+=rect(640,140,280,115,'#edf3e8','#72997e')+text(780,182,'一份坐标',25,'#234e40')+text(780,220,'每块 (x, y, 宽, 高)',18,'#58796a');
  body+=`<path d="M780 255v20H480v37" fill="none" stroke="#72997e" stroke-width="2" opacity="${fade(p,.2,.45)}"/><path d="M480 314l-6-10h12z" fill="#72997e" opacity="${fade(p,.2,.45)}"/>`;
  const segs=[[295,197,340,197],[595,197,640,197],[780,255,780,300],[780,300,480,300],[480,300,480,314]];
  segs.forEach(([x1,y1,x2,y2],i)=>{const t=clamp01(p*segs.length-i);if(t>0&&t<=1){const x=x1+(x2-x1)*ease(t),y=y1+(y2-y1)*ease(t);body+=`<circle cx="${x}" cy="${y}" r="7" fill="#c08a42" opacity=".95"/><circle cx="${x}" cy="${y}" r="12" fill="#c08a42" opacity=".14"/>`;}});
  body+=`<g opacity="${fade(p,.35,.6)}">`+rect(280,315,400,95,p>.55?'#f6ead9':'#f3f6ef','#c9a06d')+text(480,353,'下一步：压紧与评分',26,'#8a5a26')+text(480,388,'但如果布局本身用不了，分数就没有意义',19,'#a04e36')+'</g>';
 }
 else if(scene.view==='intro-goal')body=cards([['输入','任意一组矩形、外框和模块清单'],['输出','全部错误，并指出具体位置'],['不做什么','不优化、不重摆；只判断能否使用'],['为什么重要','评分、解码、搜索都默认它先通过']],p);
 else if(scene.view==='contract')body=cards([['每块恰好出现一次','A、B、C、D、E，不能重复或漏放'],['尺寸按清单固定','A3×2、B2×3、C/E2×2、D3×1'],['每条边都在框内','10×8外框；坐标从左下角开始'],['不能占同一片内部空间','允许共边、共角；这次禁止旋转']],p);
 else if(scene.view==='numbers')body=cards([['3×2','正尺寸，还要对照模块清单'],['3×0','高度为0，不能当成矩形'],['−3×−2','乘积虽为正，尺寸仍不允许'],['坐标为NaN或∞','不是可使用的有限坐标']],p);
 else if(scene.view==='bounds'){body=board(rows,o,{x:35,y:115,w:525,h:305,focus:['E']});body+=edgeLayer(scene,rows,p,o,{x:35,y:115,w:525,h:305},true);['x ≥ 0','y ≥ 0','x + w ≤ W','y + h ≤ H'].forEach((s,i)=>{const on=p*4>=i,ok=i!==2;body+=`<g opacity="${on?1:.3}">`+text(730,150+i*76,s,28,on?'#905b33':'#93a391')+`<circle cx="878" cy="${143+i*76}" r="12" fill="${ok?'#2f7d5d':'#a34231'}"/>`+text(878,148+i*76,ok?'✓':'✗',16,'#fff')+'</g>';});}
 else if(scene.view==='projection-x'){body=board(rows,o,{x:35,y:100,w:470,h:320,focus:['C','E']});body+=projectionX(rows,p);}
 else if(scene.view==='projection-y'){body=board(rows,o,{x:35,y:100,w:470,h:320,focus:['C','E']});body+=projectionY(rows,p);}
 else if(scene.view==='formula'){const opts={x:35,y:150,w:380,h:270,focus:['C','E']},g=geo(o,opts),c=rowName(rows,'C'),e=rowName(rows,'E'),v=c&&e?intersection(c,e):{area:0};body=board(rows.filter(r=>r[0]==='C'||r[0]==='E'),o,opts);if(v.area>0&&p>.16){const x=g.ox+Math.max(c[1],e[1])*g.u,y=g.oy+(o[1]-Math.min(c[2]+c[4],e[2]+e[4]))*g.u;body+=rect(x,y,v.dx*g.u,v.dy*g.u,'none','#7d2c1e','stroke-width="2.4" stroke-dasharray="6 4"')+badge(x+v.dx*g.u+6,y+v.dy*g.u+9,`dx=${v.dx}，dy=${v.dy}`,'#7d2c1e',15);}const fx=455;body+=text(fx,160,'dx = max(0, R − L)',24,'#254c42','start');if(p>.22)body+=text(fx,198,'R = min(x₁+w₁, x₂+w₂)',22,'#58796a','start');if(p>.36)body+=text(fx,234,'L = max(x₁, x₂)',22,'#58796a','start');if(p>.5)body+=text(fx,288,'dy = max(0, T − B)',24,'#254c42','start');if(p>.62)body+=text(fx,326,'T = min(y₁+h₁, y₂+h₂)',22,'#58796a','start');if(p>.74)body+=text(fx,362,'B = max(y₁, y₂)',22,'#58796a','start');if(p>.55)body+=text(fx,420,'面积 = dx × dy',28,'#9a5c31','start');if(p>.82)body+=text(fx,464,'1 × 2 = 2，正面积才是重叠',24,'#7d2c1e','start');}
 else if(scene.view==='contacts'){const layouts=[[['P',0,0,2,2],['Q',2,0,2,2]],[['P',0,0,2,2],['Q',2,2,2,2]],[['P',0,0,2,2],['Q',1,1,2,2]]];layouts.forEach((r,i)=>{const on=p*3>=i;body+=`<g opacity="${on?1:.2}">`+board(r,[4,4],{x:30+i*310,y:160,w:280,h:230,interactive:false});body+=text(170+i*310,440,['共边：面积0','共角：面积0','内部重叠：面积1'][i],23,i===2?'#a04430':'#35664c')+'</g>';});}
 else if(scene.view==='contained'||scene.view==='cross'){const opts={x:120,y:105,w:720,h:335,corners:scene.view==='cross'};body=board(rows,o,opts);if(!trial&&scene.from)body+=motionLayer(scene,rows,time,o,opts);}
 else if(scene.view==='identity'){body=text(480,120,'模块清单：A、B、C、D、E',26);rows.forEach((r,i)=>{const on=p*4>=i;body+=`<g opacity="${on?1:.2}">`+rect(65+i*175,170,150,130,'#edf3e8')+text(65+i*175+75,222,r[0],35)+text(65+i*175+75,269,r[3]+'×'+r[4],22)+'</g>';});if(p>.3)body+=rect(240,170,150,130,'none','#a34231','stroke-width="2.5"')+badge(252,158,'A 重复','#a34231',14);if(p>.52)body+=text(480,365,'五行数据，但A重复、B缺失',29,'#a04e36');if(p>.7)body+=text(480,425,'第二行的A还是2×3，不符合A固定3×2',23);if(p>.82)body+=text(480,470,'B 缺失：清单要五个模块，这里只有四个名字',23,'#a04e36');}
 else if(scene.view==='algorithm'||scene.view==='pipeline'){const lines=scene.view==='pipeline'?['读取新的rows、outline和catalog','逐行核对名称、数值、固定尺寸和边界','遍历所有模块对，计算共同宽和高','返回全部定位错误和真实交集面积']:['核对名称：缺失、重复、未知','排除无效数值，再检查固定尺寸','检查每块四条边是否在外框内','检查全部模块对：5块共有10对','返回错误清单；没有错误才合法'];lines.forEach((s,i)=>{const y=105+i*72,on=p*lines.length>=i;body+=rect(65,y,830,57,on?'#e2eddf':'#f3f6ef');if(on)body+=`<circle cx="83" cy="${y+29}" r="9" fill="#2f7d5d"/>`+text(83,y+34,'✓',14,'#fff');body+=text(105,y+38,`${i+1}. ${s}`,25,on?'#315b49':'#8ba092','start');});}
 else if(scene.view==='capacity'){body=board(scene.rows,[4,4],{x:90,y:150,w:390,h:270,interactive:false});const u=12,grow=ease(p*1.2);if(p>.12){body+=text(690,170,'3×2 + 2×3 = 12',27,'#8a5a26','start')+rect(690,190,12*u*grow,26,'#c08a42','#fff');if(p>.32)body+=text(690,250,'外框4×4 = 16',27,'#35664c','start')+rect(690,270,16*u*grow,26,'#edf3e8','#72997e');}if(p>.55)body+=text(690,340,'12 < 16，面积够',26,'#35664c','start');if(p>.75)body+=text(690,405,'形状真的放得下吗？',24,'#a04e36','start');}
 else if(scene.view==='separation'){const horiz=[['A',0,0,3,2],['B',3,0,2,3]],vert=[['A',0,0,3,2],['B',0,2,2,3]];body=`<g opacity="${fade(p,.05,.3)}">`+board(horiz,[4,4],{x:40,y:145,w:360,h:245,interactive:false})+'</g>';body+=`<g opacity="${fade(p,.4,.65)}">`+board(vert,[4,4],{x:550,y:145,w:360,h:245,interactive:false})+'</g>';if(p>.3)body+=line(40,138,346,138,'#a04e36',1.8,'6 4')+text(235,128,'3 + 2 = 5',18,'#a04e36')+text(235,442,'左右分开：至少宽5 > 4',25,'#a04e36');if(p>.65)body+=line(925,390,925,86,'#a04e36',1.8,'6 4')+text(930,240,'5',18,'#a04e36','start')+text(730,442,'上下分开：至少高5 > 4',25,'#a04e36');}
 return`<defs><pattern id="collision" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#efc2ad"/><path d="M0 0V8" stroke="#a74330" stroke-width="3"/></pattern><marker id="move-arrow" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto"><path d="M0 0L9 4.5L0 9z" fill="context-stroke"/></marker><marker id="dim-line" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M1 4h6" stroke="#a34231" stroke-width="1.4"/></marker></defs>${text(35,44,trial?'自己的尝试':scene.title,28,'#1c3a31','start')}${text(925,44,'第 '+scene.chapter+' / 8 章',13,'#6b8373','end')}${body}${text(480,512,trial?'每次改完，都检查一下发生了什么变化':scene.note,18)}`;
}
export function reportTrial(rows,scene){const r=auditRows(rows,scene.outline||[10,8],scene.catalog);return r.legal?'当前摆放符合这一步的模块清单和几何规则。':'当前问题：'+r.errors.map(describeError02).join('，')+(r.pairs.length?'；交集面积：'+r.pairs.map(p=>p.ids.join('/')+'='+p.area).join('，'):'');}
