// Exercise the real event bindings with simulated Worker/timer events.
// This is a state-lifecycle test; real Python execution is verified separately in the browser.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {bindShapePython,setShapeTask} from '../../dist/assets/finale08.mjs';
const task=JSON.parse(readFileSync(new URL('../../build/python.json',import.meta.url),'utf8'))['08-shape'];
const originals={document:globalThis.document,Worker:globalThis.Worker,setTimeout:globalThis.setTimeout,clearTimeout:globalThis.clearTimeout};
const elements=new Map(),timers=new Map(),jobs=[];let nextTimer=1,saves=0;
class TestNode {
 constructor(text=''){this.value=task.reference;this.textContent=text;this.disabled=false;this.dataset={};this.children=[];}
 replaceChildren(...children){this.children=[];this.textContent='';this.append(...children);}
 append(...children){this.children.push(...children);this.textContent+=children.map(n=>n.textContent).join('');}
}
const el=id=>{if(!elements.has(id))elements.set(id,new TestNode());return elements.get(id);};
const key='python-08-shape-v1',progress={code:{},visited:{}},passed=[];
globalThis.document={body:{dataset:{base:'../../'}},querySelector:el,createTextNode:text=>new TestNode(text),createElement:()=>new TestNode()};
globalThis.Worker=class{constructor(){jobs.push(this);}postMessage(){}terminate(){this.terminated=true;}};
globalThis.setTimeout=(fn,ms)=>{const id=nextTimer++;timers.set(id,{fn,ms});return id;};
globalThis.clearTimeout=id=>timers.delete(id);
function run(){el('#python-shape-run').onclick();return jobs.at(-1);}
function finish(job){job.onmessage({data:{type:'result',checks:task.tests.map(()=>({name:'test',status:'PASS'}))}});}
function mustBe(value,name){assert.equal(!!progress.visited[key],value,name);passed.push(name);}
try{
 setShapeTask(task);const dispose=bindShapePython({progress,save:()=>saves++});
 finish(run());mustBe(true,'success preserves the newly written pass after cleanup');
 run();mustBe(false,'starting a new run revokes the previous pass');
 el('#python-shape-stop').onclick();mustBe(false,'manual cancellation leaves no stale pass');
 finish(run());mustBe(true,'passing again restores the pass');
 el('#python-source-shape').value+='\n# edit';el('#python-source-shape').oninput();mustBe(false,'editing revokes the pass');
 finish(run());el('#python-shape-reset').onclick();mustBe(false,'reset revokes the pass');
 finish(run());run();const timeout=[...timers.values()].find(v=>v.ms===20000);assert(timeout);timeout.fn();mustBe(false,'the real 20-second timeout callback revokes the pass');
 finish(run());run().onerror({message:'simulated worker failure'});mustBe(false,'worker errors revoke the pass');
 finish(run());run().onmessage({data:{type:'error',text:'simulated load failure'}});mustBe(false,'worker error messages revoke the pass');
 const old=run(),current=run();finish(old);mustBe(false,'late old-worker results cannot restore a pass');finish(current);mustBe(true,'the current successful worker restores the pass');
 const pending=run();dispose();assert.ok(pending.terminated);assert.equal(timers.size,0);finish(pending);mustBe(false,'disposed worker cannot write a late pass');
 const result={verdict:'PASS',kind:'real binding with simulated Worker/timer events',pythonExecutionCovered:false,checks:passed,saves};
 writeFileSync(new URL('./shape-state-results.json',import.meta.url),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}finally{for(const[k,v]of Object.entries(originals)){if(v===undefined)delete globalThis[k];else globalThis[k]=v;}}
