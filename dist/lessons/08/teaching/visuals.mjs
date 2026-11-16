import DATA from'./lesson-data.mjs';import{COLORS,inspect}from'../../../assets/core.mjs';
const NS='http://www.w3.org/2000/svg',C={ink:'#18362f',muted:'#648475',accent:'#a05f30',paper:'#f9faf5',red:'#ad493a',green:'#2d7865'};
function node(tag,attrs={},text){const e=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text!=null)e.textContent=text;return e;}
function text(g,x,y,value,size=24,color=C.ink,anchor='middle'){g.append(node('text',{x,y,'font-size':size,fill:color,'text-anchor':anchor},value));}
function rect(g,x,y,w,h,fill,stroke=C.muted){g.append(node('rect',{x,y,width:w,height:h,fill,stroke,'stroke-width':1.5,rx:3}));}
function line(g,x,y,X,Y,color=C.accent){g.append(node('path',{d:`M${x} ${y}L${X} ${Y}`,stroke:color,'stroke-width':2,fill:'none'}));}
const states=DATA.states;const clamp=x=>Math.max(0,Math.min(1,x));
function mini(g,pack,x,y,w,h,label,outer=false){const maxx=outer?10:Math.max(...Object.values(pack).map(r=>r.x+r.w)),maxy=outer?8:Math.max(...Object.values(pack).map(r=>r.y+r.h)),u=Math.min(w/maxx,h/maxy),ox=x+(w-maxx*u)/2,oy=y+(h-maxy*u)/2;rect(g,ox,oy,maxx*u,maxy*u,'#f1f4ec');for(const[id,r]of Object.entries(pack)){rect(g,ox+r.x*u,oy+(maxy-r.y-r.h)*u,r.w*u,r.h*u,COLORS[id],'#fff');if(r.w*u>28)text(g,ox+(r.x+r.w/2)*u,oy+(maxy-r.y-r.h/2)*u+5,id,Math.min(25,u*.7),'#fff');}if(label)text(g,x+w/2,y+h+29,label,21,C.green);}
export function renderVisual(layer,frame,time,trial){layer.replaceChildren();if(trial||!frame.illustration){layer.setAttribute('display','none');return;}layer.removeAttribute('display');const s=frame.scene,k=s.key,p=clamp((time-s.start)/(s.end-s.start));
 if(k==='intro-why'){
  const u=56;for(const[i,[w,h,lab]]of[[3,2,'3 × 2'],[2,3,'2 × 3']].entries()){const x=170+i*400,y=280-h*u/2;rect(layer,x,y,w*u,h*u,COLORS.A,C.accent);text(layer,x+w*u/2,y+h*u/2+7,lab,26,'#fff');text(layer,x+w*u/2,y-28,lab,24,C.ink);text(layer,x+w*u/2,y+h*u+42,'面积都是 6',22,C.green);}
  line(layer,170+3*u+26,280,570-26,280,C.accent);text(layer,480,140,'同一个模块，两种画法',27,C.ink);text(layer,480,470,'形状一变，邻居的位置就要跟着变',24,C.accent);
 }else if(k==='intro-course'){
  const chips=[['Lab2','合法性检查'],['Lab3','评价指标'],['Lab4–6','解码布局'],['Lab7','搜索']];for(let i=0;i<4;i++){const x=48+i*222;rect(layer,x,190,200,120,'#edf3e9',p*4>=i?C.green:'#c6d5c5');text(layer,x+100,240,chips[i][0],27,C.accent);text(layer,x+100,280,chips[i][1],19,C.ink);}
  for(let i=0;i<3;i++)line(layer,48+200+i*222,250,48+222+i*222,250,C.accent);
  text(layer,480,380,'本课把它们合成一个完整流程：选形状 → 摆放 → 评价 → 证明',23,C.ink);text(layer,480,430,'只做其中一步，回答不了“变形到底有没有用”',21,C.muted);
 }else if(k==='intro-task'){
  const cards=[['一','形状候选','面积与比例定出','整数候选'],['二','摆放与合法性','放进固定外框，','指出谁碰到谁'],['三','结论边界','最优证明靠哪些','条件，说清范围']];for(let i=0;i<3;i++){const x=55+i*300;rect(layer,x,170,275,235,'#edf3e9',p*3>=i?C.accent:'#c6d5c5');text(layer,x+137,225,`问题 ${cards[i][0]}`,24,C.accent);text(layer,x+137,280,cards[i][1],26,C.ink);text(layer,x+137,330,cards[i][2],19,C.muted);text(layer,x+137,360,cards[i][3],19,C.muted);}
 }else if(k==='intro-preview'){
  mini(layer,states.baseline,80,140,340,230,'A=3×2：合法，盒27');mini(layer,states.bad,540,140,340,230,'A=2×3：先撞到D');
  text(layer,480,110,'先看现象，再学方法',26,C.ink);text(layer,480,478,'本课回答：为什么会撞？怎么摆回去？还能不能更好？',23,C.accent);
 }else if(k==='multi-shapes'){
  const u=46;for(let i=0;i<3;i++){const[x,y,lab]=[[240,215,'A：6'],[420,215,'B：12'],[600,215,'C：3×1 固定']];const shapes=i===0?'2×3 / 3×2':i===1?'3×4 / 4×3':'固定';rect(layer,x-60,y-30,150,90,'#edf3e9',C.accent);text(layer,x+15,y,shapes,20,C.ink);text(layer,x+15,y-14,lab,19,C.green);}
  text(layer,480,120,'树：A B V C H（后缀表达式）',26,C.ink);text(layer,480,360,'V：A 在左、B 在右；H：整体在下、C 在上',22,C.muted);text(layer,480,430,'四个组合 → 四份 (宽,高)',24,C.accent);
 }else if(k==='frontier-keep'){
  const combos=[['6 × 4 = 24','保留（前沿）','#2d7865'],['5 × 5 = 25','保留（前沿）','#2d7865'],['7 × 4 = 28','被 (6,4) 支配','#ad493a'],['6 × 5 = 30','被 (6,4) 支配','#ad493a']];
  for(let i=0;i<4;i++){const x=60+i*222;rect(layer,x,170,205,120,'#edf3e9',p*4>=i?(combos[i][2]==='#2d7865'?C.green:C.red):'#c6d5c5');text(layer,x+102,215,combos[i][0],24,C.ink);text(layer,x+102,262,combos[i][1],18,combos[i][2]);}
  text(layer,480,130,'支配 = 宽和高都不更大、至少一维严格更小',24,C.ink);text(layer,480,340,'前沿同时保留 (6,4) 与 (5,5)',24,C.accent);text(layer,480,440,'面积 24 不是全部答案：还要看宽高',21,C.muted);
 }else if(k==='outline-filter'){
  const u=42;rect(layer,150,190,6*u,5*u,'#f1f4ec',C.muted);text(layer,150+6*u/2,180,'外框 5×5',22,C.ink);
  rect(layer,170,210,6*u*0.85,4*u*0.85,'none',C.red);text(layer,170+6*u*0.85/2,210+4*u*0.85/2,'6×4=24 放不下',21,C.red);
  rect(layer,170,215,5*u,5*u,'none',C.green);text(layer,170+5*u/2,215+5*u/2+6,'5×5=25 可行',22,C.green);
  text(layer,480,130,'放进 5×5：面积贪心会失败',26,C.ink);text(layer,480,480,'面积最小 ≠ 能用；先按外框过滤，再谈好坏',22,C.accent);
 }else if(k==='backtrace'){
  const rows=[['A 取 2×3','来源：候选0','(0,0)'],['B 取 3×4','来源：候选0','(2,0)'],['C 固定 3×1','—','(0,4)']];
  for(let i=0;i<3;i++){const y=170+i*80;rect(layer,90,y,800,60,'#edf3e9',p*3>=i?C.green:'#c6d5c5');text(layer,120,y+38,rows[i][0],24,C.ink,'start');text(layer,420,y+38,rows[i][1],21,C.muted,'start');text(layer,700,y+38,'坐标 '+rows[i][2],22,C.green,'start');}
  text(layer,480,130,'回溯：从前沿候选还原每个子树的选择',26,C.ink);text(layer,480,460,'再交给 Lab2 检查：完整、在框、无重叠',22,C.accent);
 }else if(k==='joint-search'){
  const cards=[['冻结基线','形状与拓扑都不动：只评初始 1 次'],['只搜形状','拓扑不动：换 A/B 的形状组合'],['形状+拓扑','编码交换与改形状都可做'],['共同点','同一解码器、初始编码、外框、种子与预算']];
  for(let i=0;i<4;i++){const x=55+(i%2)*445,y=105+Math.floor(i/2)*150;rect(layer,x,y,410,128,'#edf3e9',Math.floor(p*4)===i?C.accent:'#c6d5c5');text(layer,x+20,y+35,cards[i][0],24,C.ink,'start');text(layer,x+20,y+80,cards[i][1],18,C.muted,'start');}
 }else if(k==='three-config'){
  const rows=[['冻结基线','0 / 3 种子可行','只评 1 次'],['只搜形状','3 / 3 种子可行','最好 25'],['形状+拓扑','3 / 3 种子可行','最好 25']];
  for(let i=0;i<3;i++){const y=150+i*80;rect(layer,90,y,800,60,p*3>=i?'#e3efdd':'#f2f6ee',p*3>=i?C.green:'#c6d5c5');text(layer,120,y+38,rows[i][0],24,C.ink,'start');text(layer,420,y+38,rows[i][1],22,C.ink,'start');text(layer,700,y+38,rows[i][2],21,C.muted,'start');}
  text(layer,480,130,'三配置对照（种子{3,7,11}，≤30次评估）',25,C.ink);text(layer,480,455,'收益归因只针对 A/B/C 这组数据与参数',22,C.accent);
 }else if(k==='grid'){
  const cards=[['正整数尺寸','宽、高 > 0；面积与比例同时合格'],['整数坐标','所有左下角落在整数网格'],['几何约束','10×8框内、轴对齐、禁止旋转'],['完整且不重叠','A—E各一块，允许边界接触']];for(let i=0;i<4;i++){const x=55+i%2*445,y=105+Math.floor(i/2)*150;rect(layer,x,y,410,128,'#edf3e9',Math.floor(p*4)===i?C.accent:'#c6d5c5');text(layer,x+20,y+35,cards[i][0],25,C.ink,'start');text(layer,x+20,y+80,cards[i][1],18,C.muted,'start');}
 }else if(k==='couple-height'||k==='couple-model'){
  const q=clamp((p-.08)/.75),w=k==='couple-model'?2+q*.5:3-q,h=6/w,u=65;rect(layer,480-w*u/2,265-h*u/2,w*u,h*u,COLORS.A,C.accent);text(layer,480,270,'A：面积 6',26,'#fff');text(layer,480,265-h*u/2-18,`w ≈ ${w.toFixed(2)}`,22,C.green);text(layer,480-w*u/2-20,270,`h ≈ ${h.toFixed(2)}`,20,C.green,'end');text(layer,480,435,k==='couple-model'?'2.5 × 2.4 连续允许；整数模型不收':'w × h = 6 → h = 6 / w',26,C.ink);
 }else if(k==='couple-bound'){
  text(layer,480,135,'0.5 ≤ w / h ≤ 2',30);if(p>.2)text(layer,480,205,'0.5 ≤ w² / 6 ≤ 2',32,C.accent);if(p>.42)text(layer,480,272,'√3 ≤ w ≤ √12',32,C.green);line(layer,150,360,810,360,C.muted);rect(layer,150+(.732/5)*660,348,(Math.sqrt(12)-Math.sqrt(3))/5*660,24,'#c6ddc6');for(let i=1;i<=6;i++)text(layer,150+(i-1)/5*660,399,i,19);if(p>.65){text(layer,480,440,'整数因数对还要满足 wh = 6',22,C.accent);}
 }else if(k==='couple-filter'){
  for(const[i,[w,h]]of[[1,6],[2,3],[3,2],[6,1]].entries()){const x=45+i*230,ok=w/h>=.5&&w/h<=2;rect(layer,x,120,205,295,'#edf3e9',p>i*.2?(ok?C.green:C.red):'#c6d5c5');text(layer,x+102,158,`${w} × ${h}`,26);rect(layer,x+102-w*12,250-h*12,w*24,h*24,COLORS.A);if(p>.15+i*.18){text(layer,x+102,367,`w/h=${(w/h).toFixed(3)}`,21,ok?C.green:C.red);text(layer,x+102,397,ok?'允许':'比例超界',20,ok?C.green:C.red);}}
 }else if(k==='overlap-contact'){
  for(let i=0;i<2;i++){const x=105+i*470,u=70;rect(layer,x,210,2*u,3*u,COLORS.A);rect(layer,x,i?210:140,3*u,u,COLORS.D);if(i)rect(layer,x,210,2*u,u,'#e7afa1',C.red);text(layer,x+105,110,i?'正面积重叠':'只贴边',26,i?C.red:C.green);text(layer,x+105,460,i?'交集 2 × 1 = 2':'交集高 0 → 面积 0',23,i?C.red:C.green);}
 }else if(k==='space-swap'||k==='space-path'){
  if(k==='space-swap'){for(const[i,[name,area]]of[['repacked',27],['lifted',36],['compact',24]].entries()){mini(layer,states[name],35+i*315,180,265,200,String(area));text(layer,167+i*315,125,['开始','D腾位','E进入'][i],24);}}
  else{const mid=structuredClone(states.lifted);mid.E.x=5.5;mid.E.y=1;for(const[i,pack]of[states.lifted,mid,states.compact].entries())mini(layer,pack,35+i*315,180,265,200,['起点合法','C/E重叠0.5','终点合法'][i]);text(layer,480,125,'线性插值并不保证搬运路径无碰撞',25,C.red);}
 }else if(k==='metric-fixed'||k==='metric-box'){
  for(const[i,name]of['baseline','compact'].entries()){const r=inspect(states[name],undefined,undefined,{soft:true}),fixed=k==='metric-fixed';mini(layer,states[name],45+i*475,150,390,230, fixed?'23 / 80 = 28.75%':`23 / ${r.bbox.area} ≈ ${(100*23/r.bbox.area).toFixed(2)}%`,fixed);text(layer,240+i*475,110,i?'压紧后':'原合法布局',24);}text(layer,480,438,k==='metric-fixed'?'固定外框不变；这个比例不评价压紧':'分子仍为23，改善的是包围盒分母',24,C.green);
 }else if(k==='proof-area'){
  text(layer,480,130,'A_box ≥ ΣA_i = 23',34,C.accent);for(let i=0;i<24;i++){const x=345+i%6*45,y=185+Math.floor(i/6)*45;rect(layer,x,y,39,39,i<Math.min(23,Math.ceil(p*30))?COLORS.A:'#e4ece0');}text(layer,480,422,'无内部重叠，面积才可以相加；图为面积计数',22,C.muted);
 }else if(k==='proof-integer'){
  text(layer,480,140,'W = max(x_i + w_i) − min(x_i)',28);text(layer,480,210,'H = max(y_i + h_i) − min(y_i)',28);if(p>.22)text(layer,480,288,'整数尺寸 + 整数坐标 → W、H均为正整数',27,C.accent);line(layer,250,365,720,365);for(let i=0;i<4;i++)text(layer,260+i*150,409,23+i,26);text(layer,480,452,'已有面积下界23，只需再排除整数面积23',23,C.green);
 }else if(k==='proof-prime'||k==='proof-exclude'){
  const q=clamp(p*1.8),u=12;rect(layer,260,110,u,23*u*q,'#cadfc8');rect(layer,500,230,23*u*q,u,'#cadfc8');text(layer,220,255,'1 × 23',23,C.accent);text(layer,640,205,'23 × 1',23,C.accent);if(k==='proof-exclude'){rect(layer,260,215,24,24,COLORS.C);rect(layer,630,230,24,24,COLORS.C);text(layer,480,422,'短边只有1，容不下固定2×2的C',27,C.red);}else text(layer,480,435,'23 是质数：23 = 1×23 = 23×1',29,C.green);
 }else if(k==='proof-continuous'){
  text(layer,480,135,'实数边长不只两种：4.6 × 5 = 23',29);text(layer,480,185,'这里只说边长可能性，不代表已经有可行布图',20,C.muted);line(layer,160,300,805,300,C.green);for(const[x,t]of[[160,'23'],[353,'23.3'],[482,'23.5'],[805,'24']])text(layer,x,345,t,25);text(layer,480,423,'面积下界仍是23；连续模型需要另证',26,C.accent);
 }else if(k==='proof-limit'){
  mini(layer,states.hardBest,65,160,360,230,'A保持3×2：合法24');mini(layer,states.compact,535,160,360,230,'A改为2×3：合法24');text(layer,480,112,'两份合法见证，不能据此认领变形收益',26,C.accent);
 }else if(k==='transfer'){
  text(layer,480,113,'h=8/w；0.5≤w²/8≤2 → 2≤w≤4',27,C.green);for(const[i,[w,h]]of[[2,4],[3,8/3],[4,2]].entries()){const x=48+i*305;rect(layer,x,165,270,257,'#edf3e9');rect(layer,x+135-w*18,280-h*18,w*36,h*36,COLORS.A);text(layer,x+135,378,i===1?'3 × (8/3)':`${w} × ${h}`,24);text(layer,x+135,410,i===1?'连续允许，整数不收':'整数允许（含边界）',17,i===1?C.red:C.green);}
 }else if(k==='finish'){
  for(const[i,t]of['说明形状为什么可行','解释谁限制包围盒','用证据区分见证与最优'].entries()){rect(layer,50+i*305,165,275,200,'#edf3e9',p*3>=i?C.green:'#c6d5c5');text(layer,187+i*305,225,i+1,40,C.accent);text(layer,187+i*305,305,t,19);}
 }
}
