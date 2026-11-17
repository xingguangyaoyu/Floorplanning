import test from 'node:test';import assert from 'node:assert/strict';
import{bindLab05}from'../dist/assets/lab05-page.mjs';
import{bindLab06}from'../dist/assets/lab06-page.mjs';
import{TASKS05,packBstar05}from'../dist/assets/bstar05.mjs';
import{TASKS06,decodeSP06}from'../dist/assets/sp06.mjs';
function withDocument(run){const previous=globalThis.document,els=new Map();const get=id=>{if(!els.has(id))els.set(id,{value:'',innerHTML:'',textContent:'',disabled:false});return els.get(id);};globalThis.document={querySelector:get,querySelectorAll:()=>[]};try{run(get);}finally{globalThis.document=previous;}}
test('Lab5 real decode button renders every task coordinate and metrics panel',()=>withDocument(get=>{
 bindLab05({progress:{},save(){}});
 for(const task of TASKS05){get('#lab05-task').onchange({target:{value:task.id}});get('#lab05-decode').onclick();const expected=packBstar05(task.tree);assert.ok(expected.ok);for(const id of expected.order){const c=expected.pack[id];assert.ok(get('#lab05-order').innerHTML.includes(`(${c.x}, ${c.y}) ${c.w}×${c.h}`),`${task.id}/${id}`);}assert.ok(get('#lab05-metrics').innerHTML.includes('='+expected.report.bbox.area));}
}));
test('Lab6 real decode button renders each coordinate and actual critical predecessors',()=>withDocument(get=>{
 bindLab06({progress:{},save(){}});
 for(const task of TASKS06){get('#lab06-task').onchange({target:{value:task.id}});get('#lab06-decode').onclick();const expected=decodeSP06(task.pos,task.neg);assert.ok(expected.ok);for(const event of expected.events){assert.ok(get('#lab06-coords').innerHTML.includes(`(${event.x}, ${event.y}) ${event.w}×${event.h}`));for(const axis of ['X','Y'])if(event['key'+axis])assert.ok(get('#lab06-coords').innerHTML.includes(axis.toLowerCase()+'←'+event['key'+axis]));}assert.ok(get('#lab06-metrics').innerHTML.includes('='+expected.report.bbox.area));}
}));
