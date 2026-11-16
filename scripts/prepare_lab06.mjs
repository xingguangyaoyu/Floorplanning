import fs from'node:fs';import{LESSON06,CHAPTERS06}from'../content/interactive06.mjs';
fs.mkdirSync('build/lab06',{recursive:true});fs.mkdirSync('docs/lab06',{recursive:true});fs.writeFileSync('build/lab06/authoring.json',JSON.stringify({...LESSON06,chapters:CHAPTERS06},null,2));
const LN=String.fromCharCode(10);
const body=LESSON06.scenes.map((s,i)=>'## '+(i+1)+'. '+s.title+LN+LN+'key: '+s.key+' / 章节'+s.chapter+' / 视图'+s.view+' / '+(s.voice?'既有语音':'文字推导')+LN+LN+'当前播放文字：'+(s.voice?'（沿用旧稿，见build/lab06/provenance.json cuts）':s.say)+LN+(s.voice?LN+'后续自然口播草稿（未录音）：'+s.say+LN:'')+LN+'画面短句：'+s.note+LN).join(LN);
fs.writeFileSync('docs/lab06/transcript.md','# Lab6讲解稿与分镜'+LN+LN+'2026-11-14。voice段沿用已有本地声音与对应原文；reading段是作者安排的文字与动画，没有新语音或伪造词时间。'+LN+LN+body);
console.log('Prepared '+LESSON06.scenes.length+' Lab6 scenes.');