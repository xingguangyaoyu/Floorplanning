import fs from 'node:fs/promises';
import {V3,V3_SAMPLE,V3_STATES,V3_FACTS}from'../content/v3-08-draft.mjs';
await fs.mkdir('docs/full-course/v3',{recursive:true});await fs.mkdir('build/v3',{recursive:true});
for(const [name,scenes]of[['full',V3],['sample',V3_SAMPLE]]){
 await fs.writeFile(`build/v3/${name}-stories.json`,JSON.stringify({'08v3':scenes},null,2));
 let md='# Lab8 V3 '+(name==='full'?'完整讲稿草案':'画面样段讲稿')+'\n\n';
 for(const s of scenes){if(s.within===1||name==='sample')md+=`\n## ${s.chapter.zh} / ${s.key}\n\n`;md+=`${s.say.zh}\n\n${s.say.en}\n\n`;}
 await fs.writeFile(`docs/full-course/v3/${name}-transcript.md`,md);
}
await fs.writeFile('build/v3/states.json',JSON.stringify(V3_STATES));await fs.writeFile('build/v3/facts.json',JSON.stringify(V3_FACTS,null,2));
if(!V3_FACTS.softWitness.legal||V3_FACTS.softWitness.bbox.area!==24||!V3_FACTS.hardWitness.legal||V3_FACTS.hardWitness.bbox.area!==24)throw Error('Invalid witness');
for(const state of Object.values(V3_STATES))for(const r of Object.values(state))for(const k of ['x','y','w','h'])if(!Number.isInteger(r[k]))throw Error('Noninteger witness');
const long=V3.filter(s=>s.say.en.split(/\s+/).length>22||[...s.say.zh].reduce((n,c)=>n+(c.charCodeAt(0)>0x2e80?1:.5),0)>44).map(s=>s.key);
if(long.length)throw Error('Overlong cues: '+long.join(','));
if(V3.some(s=>!Number.isInteger(s.seconds)||s.seconds<5))throw Error('Missing visual reading duration');
console.log(JSON.stringify({fullCues:V3.length,sampleCues:V3_SAMPLE.length,overlong:long,facts:'integer lower bound and both 24 witnesses verified'}));
