import{COLORS}from'../../../assets/core.mjs';import{board}from'../../02/teaching/visuals.mjs';import{describeError02}from'../../../assets/legality02.mjs';import{metricsReport}from'../../../assets/metrics03.mjs';import{STD06,ROW06,MULTI06,STD_SP06,MULTI_SP06}from'../../../assets/sp06.mjs';
const E=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const T=(x,y,s,size=24,color='#244d40',anchor='middle')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}" text-anchor="${anchor}">${E(s)}</text>`;
const R=(x,y,w,h,fill='#eef4e8',stroke='#b7c9b5',extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${fill}" stroke="${stroke}" ${extra}/>`;
const rowsOf=pack=>Object.entries(pack).map(([id,v])=>[id,v.x,v.y,v.w,v.h]).sort((a,b)=>a[0]<b[0]?-1:1);
function cards(items,p){return items.map(([h,b],i)=>{const x=55+(i%2)*455,y=110+Math.floor(i/2)*155;const lines=String(b).split('\n').slice(0,2);return R(x,y,415,130,'#edf3e8',p*items.length>=i?'#72997e':'#c8d4c6')+T(x+20,y+38,h,25,'#234e40','start')+lines.map((ln,k)=>T(x+20,y+78+k*26,ln,18,'#58796a','start')).join('');}).join('');}
function permRows(highlight){const pos=STD_SP06.pos,neg=STD_SP06.neg;let s='';const cw=52,gap=16,x0=90;
 [['pos',pos,140],['neg',neg,215]].forEach(([label,row,y])=>{s+=T(x0-30,y+26,label,20,'#5e7565','end');row.split('').forEach((ch,i)=>{const x=x0+i*(cw+gap);const hi=highlight&&highlight.includes(ch)&&row.indexOf(ch)===i;s+=R(x,y,cw,52,hi?'#f6ead9':'#f2f6ee',hi?'#c9a06d':'#c8d4c6')+T(x+cw/2,y+34,ch,26,hi?'#8a5a26':'#355d49');});});
 if(highlight&&highlight.length===2){const[a,b]=highlight;const ia=pos.indexOf(a),ib=pos.indexOf(b),ja=neg.indexOf(a),jb=neg.indexOf(b);
  s+=`<path d="M${x0+ia*(cw+gap)+cw/2} 168C${x0+ia*(cw+gap)+cw/2} 196 ${x0+ib*(cw+gap)+cw/2} 190 ${x0+ib*(cw+gap)+cw/2} 168" stroke="#a05f30" fill="none"/>`;
  s+=`<path d="M${x0+ja*(cw+gap)+cw/2} 243C${x0+ja*(cw+gap)+cw/2} 271 ${x0+jb*(cw+gap)+cw/2} 265 ${x0+jb*(cw+gap)+cw/2} 243" stroke="#a05f30" fill="none"/>`;}
 return s;}
function graphView(step){let s=permRows();
 if(step==='graph'){s+=T(480,300,'十对模块的分类结果',24);const H=STD06.graph.H,V=STD06.graph.V;const items=[...H.map(e=>e[0]+'·'+e[1]+' → 水平（同序）'),...V.map(e=>e[0]+'·'+e[1]+' → 竖直（反序）')];
  items.slice(0,5).forEach((t,i)=>{s+=R(60,330+i*36,420,30,'#f2f6ee')+T(75,351,t,17,'#355d49','start');});
  items.slice(5,10).forEach((t,i)=>{s+=R(500,330+i*36,420,30,'#f2f6ee')+T(515,351,t,17,'#355d49','start');});
  s+=T(480,530,'同序→水平；反序→竖直；每一对恰好进一个方向',18);}
 else{const ev=STD06.events.find(e=>e.id==='D');s+=T(480,300,'D 的竖直前驱与下界',24);
  ev.vPred.forEach((p,i)=>{const bound=STD06.coords[p].y+STD06.coords[p].h;const key=p===ev.keyY;s+=R(140,335+i*36,560,30,key?'#f6ead9':'#f2f6ee',key?'#c9a06d':'#c8d4c6')+T(160,356,p+' 的顶部 = '+STD06.coords[p].y+'+'+STD06.coords[p].h+' = '+bound,19,key?'#8a5a26':'#5e7565','start');});
  s+=T(480,530,'y_D = max(2,3,2,2) = 3：B 是关键前驱',19,'#a05f30');}
 return s;}
export function renderScene(scene,time,trial,reduced){const p=Math.max(0,Math.min(1,(time-scene.start)/(scene.end-scene.start))),o=scene.outline||[10,8];let rows=trial||scene.rows,body='',moving=false;
 if(!trial&&scene.from){const q=reduced?1:Math.max(0,Math.min(1,(time-scene.start-1)/3)),v=q*q*(3-2*q);moving=q<1;rows=scene.rows.map((r,i)=>r.map((n,j)=>j===1||j===2?scene.from[i][j]+(n-scene.from[i][j])*v:n));}
 const report=metricsReport(rows,o,scene.catalog);
 if(trial){body=board(rows,o,{x:40,y:105,w:570,h:315});body+=T(755,160,report.legal?'当前摆放合法':'先处理摆放错误',27,report.legal?'#326d4d':'#a44f35')+T(755,230,'这是你手动调整后的布局',22,'#5e7565')+T(755,300,'想改结构：编辑两行字母',22,'#5e7565');}
 else if(scene.view==='intro-why06'){body=permRows();body+=T(480,300,'每一对模块的相对位置，一次读完',25);body+=R(150,340,660,66,p>.5?'#f6ead9':'#f3f6ef','#c9a06d')+T(480,368,'同序 → 水平约束（x）　反序 → 竖直约束（y）',21,'#8a5a26')+T(480,392,'按拓扑序对全部下界取最大值 → 坐标',19,'#a04e36');}
 else if(scene.view==='intro-goal06'){const chain=[['分类','十对全部分进两个方向'],['排序','pos 本身是拓扑序'],['取最大','坐标=最长路径'],['解释','谁是无环？谁是关键约束？']];chain.forEach(([h1,h2],i)=>{const x=42+i*228;body+=R(x,160,205,130,'#edf3e8',p*4>=i?'#72997e':'#c8d4c6')+T(x+102,205,i+1,30,'#9b6337')+T(x+102,246,h1,21,'#234e40')+T(x+102,272,h2,15,'#58796a');});body+=R(120,340,720,80,'#f6ead9','#c9a06d')+T(480,372,'学完要能回答',23,'#8a5a26')+T(480,404,'为什么取最大？为什么无环？为什么仍可能越界？',18,'#a04e36');}
 else if(scene.view==='sp-cards')body=cards([['两行排列','pos 与 neg，各含全部模块恰好一次'],['同序对','两行中先后一致 → 水平约束，早者在左'],['反序对','两行先后相反 → 竖直约束，早者在下（本课约定）'],['约定要成套','换资料必须同时换箭头与不等式']],p);
 else if(scene.view==='pair-classify'){const pair=scene.pair||'AB';body=permRows(pair.split(''));const[a,b]=pair.split('');
  if(a==='A'&&b==='B'){body+=T(480,310,'A、B 在两行中都先 A 后 B',24);body+=T(480,360,'水平约束：A 在 B 左边',26,'#355d49');body+=T(480,415,'x_B ≥ x_A + 3（A 的宽）',26,'#9a5c31');}
  else{body+=T(480,310,'A 在 pos 先于 D，在 neg 后于 D',24);body+=T(480,360,'竖直约束：A 在 D 下方',26,'#355d49');body+=T(480,415,'y_D ≥ y_A + 2（A 的高）',26,'#9a5c31');}
  body+=T(480,470,'边权用前驱的尺寸：要越过的是它占的空间',19,'#5e7565');}
 else if(scene.view==='graph-view')body=graphView(scene.step);
 else if(scene.view==='critical-chain'){const ev=STD06.events.find(e=>e.id==='D');body=board(rowsOf(STD06.coords),[10,8],{x:45,y:110,w:430,h:330,interactive:false,showPairs:false});body+=T(700,160,'D 的 y=3 由谁决定？',23);STD06.coords&&ev.vPred.forEach((pr,i)=>{const top=STD06.coords[pr].y+STD06.coords[pr].h;body+=T(700,205+i*44,pr+' 顶 '+top+(pr==='B'?' ← 关键':''),22,pr==='B'?'#a05f30':'#5e7565');});if(p>.5)body+=T(700,405,'改 B 的高度，D 立刻跟着变',21,'#a04e36');}
 else if(scene.view==='acyclic-cards')body=cards([['边只指向"较晚"','两行中都较早的模块在箭头起点'],['pos 就是拓扑序','按 pos 顺序算坐标，前驱必已算好'],['环不可能','环要求某块既早又晚'],['所以取最大合法','最长路径在无环图上才有定义']],p);
 else if(scene.view==='board-overflow06'){body=board(rows,o,{x:35,y:105,w:540,h:315,interactive:false,showPairs:false});body+=T(745,160,'不重叠：成立（构造保证）',23,'#386f4c')+T(745,225,'E 的右边缘 = 12',25,'#a04e36')+T(745,290,'外框只有 10 → 越界',24,'#a04e36')+T(745,360,'解码合法 ≠ 装进外框',23,'#5e7565');}
 else if(scene.view==='checks-cards06')body=cards([['解码检查','两行齐全、无重复、清单内'],['不重叠','由构造保证，无需再查'],['包含性','交给 Lab2：x+w≤W、y+h≤H'],['顺序','先解码，再几何；两道不能互相替代']],p);
 else if(scene.view==='multi-encoding'){body=board(rowsOf(MULTI06[0].coords),[10,8],{x:45,y:110,w:430,h:330,interactive:false,showPairs:false});MULTI_SP06.forEach((e,i)=>{body+=T(700,170+i*46,(i===0?'① ':'② ')+(i===2?'③ ':'')+e.pos+' / '+e.neg,20,i===0?'#8a5a26':'#5e7565','start');});body+=T(700,320,'三份编码 → 同一张布局',22,'#355d49','start')+T(700,370,'14400 个编码 → 12966 份布局',20,'#5e7565','start')+T(700,410,'1234 份有多个编码，最多3个',20,'#5e7565','start');}
 else if(scene.view==='compare-cards'){body=cards([['切片标准编码','包围盒 27：一个指定编码'],['B*-tree 标准树','包围盒 27：另一个指定编码'],['序列对标准编码','包围盒 36：第三份指定编码'],['比能力要看穷举','26880 份切片：最小 25\n5040 棵 / 14400 个：到 24']],p);body+=T(480,470,'背一个编码的分数，说明不了表示法能覆盖什么',20,'#5e7565');}
 else if(scene.view==='neighbor-cards')body=cards([['交换 pos 中两个字母','相对关系局部改变'],['同时交换两行','另一种邻域'],['每次编辑','重新解码 → Lab2 → Lab3'],['这正是','下一课模拟退火的候选操作']],p);
 return`<defs><pattern id="collision" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#efc2ad"/><path d="M0 0V8" stroke="#a74330" stroke-width="3"/></pattern></defs>${T(35,44,trial?'自己的尝试':scene.title,28,'#1d3c31','start')}${T(925,44,'第 '+scene.chapter+' / 8 章',13,'#6b8373','end')}${body}${T(480,530,trial?'试试手动调整，再想想两行字母怎么改':scene.note,18)}`;}
export function reportTrial(rows,scene){const r=metricsReport(rows,scene.outline||[10,8],scene.catalog);return r.legal?'当前摆放合法；但两行字母没变，这只是手动挪动。':'当前不能计有效分数：'+r.errors.map(describeError02).join('，')+'；结构要改编码，不是挪块。';}