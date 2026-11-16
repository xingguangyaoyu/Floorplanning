import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {STORIES} from '../content/storyboards.mjs';import {renderFilm} from '../dist/assets/draw.mjs';
const timing=id=>JSON.parse(fs.readFileSync(new URL(`../dist/media/${id}/en.json`,import.meta.url)));
test('soft transition shows bounded dimensions, fixed area and no invalid density score',()=>{
 const film=renderFilm(STORIES['08'],timing('08'),timing('08').scenes.find(s=>s.key==='reshape').animate+.5,{lang:'en',lesson:'08'});
 assert(!film.svg.includes('6.109375'));assert(!film.svg.includes('28.75%'));
 assert(film.svg.includes('Area stays six'));assert(!/\d\.\d{5}/.test(film.svg.replace(/x="[^"]*"|y="[^"]*"|width="[^"]*"|height="[^"]*"|opacity="[^"]*"|d="[^"]*"/g,'')));
});
test('an unchanged scene is settled immediately, with evaluated metrics',()=>{
 const t=timing('08').scenes.find(s=>s.key==='reshape-x').start;const film=renderFilm(STORIES['08'],timing('08'),t,{lang:'en',lesson:'08'});
 assert(film.settled);assert(film.svg.includes('REPAIR'));assert(!film.svg.includes('28.75%'));
});
test('rejection follows the accepted current layout without moving it',()=>{
 const scenes=STORIES['07'],accepted=scenes.find(s=>s.key==='accept'),rejected=scenes.find(s=>s.key==='reject');
 assert(rejected.anneal.step>accepted.anneal.step);assert.deepEqual(rejected.anneal.previous,accepted.pack);assert.deepEqual(rejected.pack,accepted.pack);
 const film=renderFilm(scenes,timing('07'),timing('07').scenes[6].start+.2,{lang:'en',lesson:'07'});assert(film.settled);
});

test('the concise full lesson retains its complete worked path and transferable boundary cases',()=>{const scenes=STORIES['08'];assert.equal(scenes.length,48);assert.equal(new Set(scenes.map(s=>s.chapterIndex)).size,9);assert.equal(new Set(scenes.map(s=>s.key)).size,48);assert(scenes.some(s=>s.key==='transfer-answer'&&s.shapeExamples.area===8));assert(scenes.find(s=>s.key==='contract-two-three').check==='shape');assert(scenes.filter(s=>s.question).length>=4);for(const key of ['reshape-y','repair-second-conflict','repair-worse','repack-same','compact-box','metrics-box','metrics-compact'])assert(scenes.some(s=>s.key===key));});
