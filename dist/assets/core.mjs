// Original teaching implementation. Coordinates: lower-left, x right, y up.
export const OUTLINE={w:10,h:8};
export const MODULES=[{id:'A',w:3,h:2,soft:true},{id:'B',w:2,h:3},{id:'C',w:2,h:2},{id:'D',w:3,h:1},{id:'E',w:2,h:2}];
export const COLORS={A:'#437ba5',B:'#438b78',C:'#c08a42',D:'#8f76b5',E:'#bb7589'};
export const GOLDEN={A:{x:0,y:0,w:3,h:2},B:{x:3,y:0,w:2,h:3},C:{x:5,y:0,w:2,h:2},D:{x:0,y:2,w:3,h:1},E:{x:7,y:0,w:2,h:2}};
export const BEST={A:{x:0,y:0,w:3,h:2},B:{x:4,y:1,w:2,h:3},C:{x:0,y:2,w:2,h:2},D:{x:3,y:0,w:3,h:1},E:{x:2,y:2,w:2,h:2}};
export const clone=x=>JSON.parse(JSON.stringify(x));
export const overlap=(a,b)=>a.x<b.x+b.w-1e-9&&b.x<a.x+a.w-1e-9&&a.y<b.y+b.h-1e-9&&b.y<a.y+a.h-1e-9;
export function inspect(pack,outline=OUTLINE,modules=MODULES,{soft=false,rotate=false}={}){
 const rows=Array.isArray(pack)?pack:Object.entries(pack).map(([id,r])=>({id,...r}));
 const errors=[],ids=new Set(),expected=new Map(modules.map(m=>[m.id,m]));
 for(const r of rows){
  if(ids.has(r.id))errors.push({code:'duplicate',ids:[r.id]}); ids.add(r.id);
  const m=expected.get(r.id);if(!m){errors.push({code:'unknown',ids:[r.id]});continue;}
  if(!['x','y','w','h'].every(k=>Number.isFinite(r[k]))||r.w<=0||r.h<=0){errors.push({code:'number',ids:[r.id]});continue;}
  if(soft&&m.soft){if(Math.abs(r.w*r.h-m.w*m.h)>1e-7)errors.push({code:'area',ids:[r.id]});if(r.w/r.h<.5-1e-8||r.w/r.h>2+1e-8)errors.push({code:'aspect',ids:[r.id]});}
  else if(!(r.w===m.w&&r.h===m.h)&&!(rotate&&r.w===m.h&&r.h===m.w))errors.push({code:'shape',ids:[r.id]});
  if(r.x<0||r.y<0||r.x+r.w>outline.w+1e-8||r.y+r.h>outline.h+1e-8)errors.push({code:'outside',ids:[r.id]});
 }
 for(const id of expected.keys())if(!ids.has(id))errors.push({code:'missing',ids:[id]});
 for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++)if(overlap(rows[i],rows[j]))errors.push({code:'overlap',ids:[rows[i].id,rows[j].id]});
 const complete=rows.length===modules.length&&[...expected.keys()].every(id=>ids.has(id))&&!errors.some(e=>['unknown','duplicate','number'].includes(e.code));
 const minX=rows.length?Math.min(...rows.map(r=>r.x)):0,minY=rows.length?Math.min(...rows.map(r=>r.y)):0;
 const w=rows.length?Math.max(...rows.map(r=>r.x+r.w))-minX:0,h=rows.length?Math.max(...rows.map(r=>r.y+r.h))-minY:0;
 const area=modules.reduce((a,m)=>a+m.w*m.h,0),bbox=w*h,legal=errors.length===0;
 return {legal,complete,errors,area,outlineArea:outline.w*outline.h,outlineDensity:area/(outline.w*outline.h),outlineDead:outline.w*outline.h-area,bbox:{x:minX,y:minY,w,h,area:bbox},packingDensity:legal?area/bbox:null,bboxDead:legal?bbox-area:null};
}
export function slicing(tokens,modules=MODULES){
 if(typeof tokens==='string')tokens=tokens.trim().split(/\s+/);
 const byId=Object.fromEntries(modules.map(m=>[m.id,m])),stack=[],seen=new Set(),events=[];
 for(const token of tokens){
  if(token==='H'||token==='V'){
   if(stack.length<2)throw Error('underflow');const b=stack.pop(),a=stack.pop(),pack=clone(a.pack);
   for(const [id,r]of Object.entries(b.pack))pack[id]={...r,x:r.x+(token==='V'?a.w:0),y:r.y+(token==='H'?a.h:0)};
   const region={w:token==='V'?a.w+b.w:Math.max(a.w,b.w),h:token==='H'?a.h+b.h:Math.max(a.h,b.h),pack,tree:{id:token,left:a.tree,right:b.tree}};stack.push(region);
  }else{
   if(!byId[token])throw Error('unknown:'+token);if(seen.has(token))throw Error('duplicate:'+token);seen.add(token);
   const m=byId[token];stack.push({w:m.w,h:m.h,pack:{[token]:{x:0,y:0,w:m.w,h:m.h}},tree:{id:token}});
  }
  events.push({token,stack:stack.map(({w,h,pack})=>({w,h,ids:Object.keys(pack).join('')})),pack:clone(stack.at(-1).pack)});
 }
 if(stack.length!==1)throw Error('leftover');if(seen.size!==modules.length)throw Error('missing');
 return {...stack[0],events};
}
export function parseTree(s){
 const tokens=s.match(/[A-Za-z][A-Za-z0-9_]*|[(),-]/g)||[];if(tokens.join('')!==s.replace(/\s+/g,''))throw Error('tree-syntax');let p=0;
 function read(){const id=tokens[p++];if(id==='-')return null;if(!id||/^[(),]$/.test(id))throw Error('tree-syntax');const n={id};if(tokens[p]==='('){p++;n.left=read();if(tokens[p++]!==',')throw Error('tree-comma');n.right=read();if(tokens[p++]!==')')throw Error('tree-close');}return n;}
 const tree=read();if(p!==tokens.length||!tree)throw Error('tree-syntax');return tree;
}
export function bstar(tree,modules=MODULES){
 if(typeof tree==='string')tree=parseTree(tree);const byId=Object.fromEntries(modules.map(m=>[m.id,m])),seen=new Set(),pack={},events=[],contour=[];
 function walk(n,x){if(!n)return;if(!byId[n.id]||seen.has(n.id))throw Error('tree-module');seen.add(n.id);const m=byId[n.id];
  const y=Math.max(0,...contour.filter(s=>s.x2>x&&s.x1<x+m.w).map(s=>s.h));pack[n.id]={x,y,w:m.w,h:m.h};
  const next=[];for(const s of contour){if(s.x2<=x||s.x1>=x+m.w)next.push(s);else{if(s.x1<x)next.push({...s,x2:x});if(s.x2>x+m.w)next.push({...s,x1:x+m.w});}}next.push({x1:x,x2:x+m.w,h:y+m.h});contour.splice(0,contour.length,...next.sort((a,b)=>a.x1-b.x1));
  events.push({id:n.id,x,y,contour:clone(contour),pack:clone(pack)});walk(n.left,x+m.w);walk(n.right,x);
 }
 walk(tree,0);if(seen.size!==modules.length)throw Error('missing');return {pack,events,tree};
}
export function swapNames(tree,a,b){const t=clone(tree);function go(n){if(!n)return;n.id=n.id===a?b:n.id===b?a:n.id;go(n.left);go(n.right);}go(t);return t;}
export function sequencePair(pos,neg,modules=MODULES){
 if(typeof pos==='string')pos=pos.replace(/\s+/g,'').split('');if(typeof neg==='string')neg=neg.replace(/\s+/g,'').split('');
 const byId=Object.fromEntries(modules.map(m=>[m.id,m]));
 for(const seq of [pos,neg])if(seq.length!==modules.length||new Set(seq).size!==modules.length||seq.some(id=>!byId[id]))throw Error('permutation');
 const pack={},H=[],V=[],events=[];
 for(let i=0;i<pos.length;i++)for(let j=i+1;j<pos.length;j++)(neg.indexOf(pos[i])<neg.indexOf(pos[j])?H:V).push([pos[i],pos[j]]);
 for(const id of pos){const m=byId[id],hPred=H.filter(e=>e[1]===id).map(e=>e[0]),vPred=V.filter(e=>e[1]===id).map(e=>e[0]);
  const x=Math.max(0,...hPred.map(a=>pack[a].x+pack[a].w)),y=Math.max(0,...vPred.map(a=>pack[a].y+pack[a].h));pack[id]={x,y,w:m.w,h:m.h};events.push({id,x,y,hPred,vPred,pack:clone(pack)});
 }return {pack,H,V,events,pos,neg};
}
export function seedRandom(seed){let a=seed>>>0;return ()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
export function energy(pack,outline=OUTLINE){const s=inspect(pack,outline);return s.bbox.area+100*(Math.max(0,s.bbox.w-outline.w)+Math.max(0,s.bbox.h-outline.h));}
export function anneal({seed=7,steps=120,temperature=12,cooling=.97,pos='ABCDE',neg='ABCDE'}={}){
 if(!Number.isInteger(steps)||steps<1||steps>2000||!(temperature>0)||!(cooling>0&&cooling<=1))throw Error('anneal-parameters');
 const rng=seedRandom(seed),initial=sequencePair(pos,neg);let p=[...initial.pos],n=[...initial.neg],current=initial.pack,e=energy(current),best=inspect(current).legal?clone(current):null,bestE=best?inspect(best).bbox.area:Infinity;const events=[];
 for(let k=0;k<steps;k++){const pp=[...p],nn=[...n],seq=rng()<.5?pp:nn,i=Math.floor(rng()*seq.length);let j=Math.floor(rng()*(seq.length-1));if(j>=i)j++;[seq[i],seq[j]]=[seq[j],seq[i]];
  const candidate=sequencePair(pp,nn).pack,next=energy(candidate),delta=next-e,T=temperature*Math.pow(cooling,k),probability=delta<=0?1:Math.exp(-delta/T),u=rng(),accepted=u<probability;
  const previous=clone(current);if(accepted){p=pp;n=nn;current=candidate;e=next;}
  const s=inspect(current);if(s.legal&&s.bbox.area<bestE){best=clone(current);bestE=s.bbox.area;}
  events.push({step:k+1,T,delta,probability,u,accepted,energy:e,candidateEnergy:next,pack:clone(current),previous,candidate,best:clone(best),bestEnergy:Number.isFinite(bestE)?bestE:null,pos:[...p],neg:[...n]});
 }return {pack:current,best,events,seed};
}
export function interpolatePack(a,b,t){const out={},u=1-Math.pow(1-Math.max(0,Math.min(1,t)),3);for(const [id,r]of Object.entries(b)){const q=a[id]||{...r,y:r.y+2,opacity:0};out[id]={};for(const k of ['x','y','w','h'])out[id][k]=q[k]+(r[k]-q[k])*u;if(Math.abs(q.w*q.h-r.w*r.h)<1e-8&&out[id].w>0)out[id].h=r.w*r.h/out[id].w;out[id].opacity=(q.opacity??1)+((r.opacity??1)-(q.opacity??1))*u;}return out;}
export const TREES={golden:'A(B(C(E,-),-),D)',lift:'C(B(A(E,-),-),D)',best:'A(D,C(E(B,-),-))',row:'A(B(C(D(E,-),-),-),-)',bad:'A(B(C(D,-),-),E)'};
