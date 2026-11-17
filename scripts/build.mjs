import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';
import {MODULES,SOURCES,GLOSSARY} from '../content/course.mjs';import {STORIES,SOFT_BEST} from '../content/storyboards.mjs';import {TASKS} from '../content/python.mjs';
import {inspect,MODULES as BLOCKS,OUTLINE} from '../dist/assets/core.mjs';import {esc,L,renderFilm} from '../dist/assets/draw.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),DIST=path.join(ROOT,'dist');
const digest=async file=>createHash('sha256').update(await fs.readFile(path.join(DIST,file))).digest('hex').slice(0,12);
const coreVersion=await digest('assets/core.mjs');
const drawPath=path.join(DIST,'assets/draw.mjs'),drawSource=await fs.readFile(drawPath,'utf8'),updatedDraw=drawSource.replace(/\.\/core\.mjs(?:\?v=[a-f0-9]+)?/g,`./core.mjs?v=${coreVersion}`);
if(updatedDraw!==drawSource)await fs.writeFile(drawPath,updatedDraw);
const drawVersion=await digest('assets/draw.mjs');
const extraPath=path.join(DIST,'assets/lesson-extras.mjs'),extraSource=await fs.readFile(extraPath,'utf8'),updatedExtra=extraSource.replace(/\.\/core\.mjs(?:\?v=[a-f0-9]+)?/g,`./core.mjs?v=${coreVersion}`).replace(/\.\/draw\.mjs(?:\?v=[a-f0-9]+)?/g,`./draw.mjs?v=${drawVersion}`);
if(updatedExtra!==extraSource)await fs.writeFile(extraPath,updatedExtra);
const extraVersion=await digest('assets/lesson-extras.mjs'),videoDisplayVersion=await digest('assets/video-display.mjs');
const advancedPath=path.join(DIST,'assets/advanced08.mjs'),advancedText=await fs.readFile(advancedPath,'utf8');await fs.writeFile(advancedPath,advancedText.replace(/\.\/core\.mjs(?:\?v=[a-f0-9]+)?/g,`./core.mjs?v=${coreVersion}`));const advancedVersion=await digest('assets/advanced08.mjs');
const pageLocaleVersion=await digest('assets/page-locale.mjs');
for(const file of ['assets/app.mjs','assets/finale08.mjs']){
 const target=path.join(DIST,file),source=await fs.readFile(target,'utf8');
 await fs.writeFile(target,source.replace(/\.\/page-locale\.mjs(?:\?v=[a-f0-9]+)?/g,`./page-locale.mjs?v=${pageLocaleVersion}`));
}
const lab02Version=await digest('assets/lab02-page.mjs'),lab03Version=await digest('assets/lab03-page.mjs'),lab04Version=await digest('assets/lab04-page.mjs'),lab05Version=await digest('assets/lab05-page.mjs'),lab06Version=await digest('assets/lab06-page.mjs'),lab07Version=await digest('assets/lab07-page.mjs'),finaleVersion=await digest('assets/finale08.mjs');
const appPath=path.join(DIST,'assets/app.mjs'),appSource=await fs.readFile(appPath,'utf8'),updatedApp=appSource.replace(/\.\/lab03-page\.mjs(?:\?v=[a-f0-9]+)?/g,`./lab03-page.mjs?v=${lab03Version}`).replace(/\.\/lab02-page\.mjs(?:\?v=[a-f0-9]+)?/g,`./lab02-page.mjs?v=${lab02Version}`).replace(/\.\/lab04-page\.mjs(?:\?v=[a-z0-9]+)?/g,`./lab04-page.mjs?v=${lab04Version}`).replace(/\.\/lab05-page\.mjs(?:\?v=[a-z0-9]+)?/g,`./lab05-page.mjs?v=${lab05Version}`).replace(/\.\/lab06-page\.mjs(?:\?v=[a-z0-9]+)?/g,`./lab06-page.mjs?v=${lab06Version}`).replace(/\.\/lab07-page\.mjs(?:\?v=[a-z0-9]+)?/g,`./lab07-page.mjs?v=${lab07Version}`).replace(/\.\/finale08\.mjs(?:\?v=[a-z0-9]+)?/g,`./finale08.mjs?v=${finaleVersion}`).replace(/\.\/advanced08\.mjs(?:\?v=[a-f0-9]+)?/g,`./advanced08.mjs?v=${advancedVersion}`).replace(/\.\/core\.mjs(?:\?v=[a-f0-9]+)?/g,`./core.mjs?v=${coreVersion}`).replace(/\.\/draw\.mjs(?:\?v=[a-f0-9]+)?/g,`./draw.mjs?v=${drawVersion}`).replace(/\.\/lesson-extras\.mjs(?:\?v=[a-f0-9]+)?/g,`./lesson-extras.mjs?v=${extraVersion}`).replace(/\.\/video-display\.mjs(?:\?v=[a-f0-9]+)?/g,`./video-display.mjs?v=${videoDisplayVersion}`);
if(updatedApp!==appSource)await fs.writeFile(appPath,updatedApp);
const appVersion=await digest('assets/app.mjs'),styleVersion=await digest('assets/style.css');
const course={version:1,modules:MODULES,sources:SOURCES,glossary:GLOSSARY,videoSamples:{'08':await fs.access(path.join(DIST,'media/08/sample-en.mp4')).then(()=>true,()=>false)}};
const readJson=async p=>fs.access(p).then(async()=>JSON.parse(await fs.readFile(p,'utf8')),()=>null);
const interactiveLessons={};
for(const id of ['02','03','04','05','06','07','08']){
 const prov=await readJson(path.join(ROOT,'build',`lab${id}`,'provenance.json'));
 const manifest=id==='08'?await readJson(path.join(ROOT,'build','complete-interactive-manifest.json')):null;
 if(!prov&&!manifest)continue;
 const source=manifest||prov;
 interactiveLessons[id]={duration:source.duration,chapters:manifest?new Set(source.scenes.map(s=>s.chapterIndex)).size:source.chapters.length,tasks:3,exercises:4};
}
course.interactiveLessons=interactiveLessons;
course.fullVideos={'08':{}};for(const lang of ['en','zh'])if(await fs.access(path.join(DIST,`media/08/video-${lang}.mp4`)).then(()=>true,()=>false))course.fullVideos['08'][lang]=`video-${lang}.mp4?v=${await digest(`media/08/video-${lang}.mp4`)}`;
await fs.mkdir(path.join(DIST,'data'),{recursive:true});await fs.mkdir(path.join(DIST,'downloads'),{recursive:true});await fs.mkdir(path.join(ROOT,'build'),{recursive:true});
for(const [name,data]of Object.entries({course,stories:STORIES,python:TASKS}))await fs.writeFile(path.join(DIST,'data',name+'.json'),JSON.stringify(data));
await fs.writeFile(path.join(ROOT,'build/stories.json'),JSON.stringify(STORIES,null,2));
if(!inspect(SOFT_BEST,OUTLINE,BLOCKS,{soft:true}).legal)throw Error('Soft witness is not legal');
for(const [id,scenes]of Object.entries(STORIES))for(const s of scenes){for(const r of Object.values(s.pack))for(const k of ['x','y','w','h'])if(!Number.isFinite(r[k]))throw Error(`Non-finite scene ${id}/${s.key}`);}
function page({title='Floorplanning Studio',base='./',kind='home',id=''}){return `<!doctype html>\n<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="七节 Floorplanning 交互课程：双语代码动画、预测题、实验、讲义与 Python。从固定边界到表示法和搜索。"><meta name="theme-color" content="#28665b"><link rel="icon" type="image/svg+xml" href="${base}assets/favicon.svg"><link rel="stylesheet" href="${base}assets/style.css?v=${styleVersion}"></head><body data-base="${base}" data-page="${kind}" data-lesson="${id}"><div id="app"><main class="wrap"><h1>${esc(title)}</h1><p>正在准备交互课程 / Loading the interactive course…</p><p><a href="${base}downloads/course-notes-zh.md">下载中文讲义</a> · <a href="${base}downloads/course-notes-en.md">English notes</a></p></main></div><noscript><p>JavaScript is needed for the interactive lesson. Downloadable notes remain available.</p></noscript><script type="module" src="${base}assets/app.mjs?v=${appVersion}"></script></body></html>\n`;}
await fs.writeFile(path.join(DIST,'index.html'),page({}));
for(const [dir,kind,title]of [['compare','compare','同例比较 · Floorplanning Studio'],['glossary','glossary','基础与术语 · Floorplanning Studio'],['sources','sources','来源与融合 · Floorplanning Studio'],['progress','progress','学习记录 · Floorplanning Studio'],['notes','notes','可打印讲义 · Floorplanning Studio']]){await fs.mkdir(path.join(DIST,dir),{recursive:true});await fs.writeFile(path.join(DIST,dir,'index.html'),page({title,base:'../',kind}));}
for(const m of MODULES){const dir=path.join(DIST,'lessons',m.id);await fs.mkdir(dir,{recursive:true});await fs.writeFile(path.join(dir,'index.html'),page({title:`${m.id} · ${m.name.zh} · Floorplanning Studio`,base:'../../',kind:'lesson',id:m.id}));}
await fs.writeFile(path.join(DIST,'.nojekyll'),'');await fs.writeFile(path.join(DIST,'404.html'),page({title:'Floorplanning Studio · 页面未找到',base:'./'}));
await fs.writeFile(path.join(DIST,'assets/favicon.svg'),'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="5" fill="#f5f1e8"/><path d="M5 5h12v9H5zM20 5h7v14h-7zM5 17h12v10H5zM20 22h7v5h-7z" fill="#28665b"/></svg>');
function notes(m,lang){return `# ${m.id} · ${L(m.name,lang)}\n\n${L(m.question,lang)}\n\n${L(m.intro,lang)}\n\n${m.sections.map(([h,p])=>`## ${L(h,lang)}\n\n${L(p,lang)}`).join('\n\n')}\n\n## ${lang==='zh'?'算法步骤':'Pseudocode'}\n\n\`\`\`text\n${m.pseudo}\n\`\`\`\n\n## ${lang==='zh'?'易错点':'Pitfall'}\n\n${L(m.pitfall,lang)}\n\n## ${lang==='zh'?'检查理解':'Check understanding'}\n\n${m.quiz.map((q,i)=>`${i+1}. ${L(q.text,lang)}\n\n${q.options.map((o,j)=>`   ${String.fromCharCode(65+j)}. ${L(o,lang)}`).join('\n')}\n\n   ${lang==='zh'?'答案':'Answer'}: ${String.fromCharCode(65+q.answer)}. ${L(q.explain,lang)}`).join('\n\n')}\n\n## ${lang==='zh'?'Python 练习':'Python exercise'}\n\n${L(TASKS[m.id].prompt,lang)}\n\n\`\`\`python\n${TASKS[m.id].starter}\n\`\`\`\n\n---\n${lang==='zh'?'新教材：谭星宇，CC BY 4.0。原作贡献':'New material: Xingyu Tan, CC BY 4.0. Original contributor'}: ${L(SOURCES.find(s=>s.id===m.id).author,lang)}\n`;}
for(const lang of ['zh','en']){let all=`# Floorplanning Studio\n\n${lang==='zh'?'从约束到表示，再到搜索。统一坐标：左下角原点；宽×高；外框 10×8；模块 A—E 总面积 23。':'From constraints to representations to search. Shared conventions: lower-left origin; width×height; 10×8 outline; A–E total area 23.'}\n\n`;
 for(const m of MODULES){const n=notes(m,lang);await fs.writeFile(path.join(DIST,'downloads',`lesson-${m.id}-${lang}.md`),n);all+=n+'\n\n';}
 await fs.writeFile(path.join(DIST,'downloads',`course-notes-${lang}.md`),all);
}
for(const m of MODULES)await fs.writeFile(path.join(DIST,'downloads',`lesson-${m.id}-storyboard.json`),JSON.stringify({lesson:m.id,scenes:STORIES[m.id]},null,2));
await fs.writeFile(path.join(ROOT,'build/python.json'),JSON.stringify(TASKS,null,2));
console.log(`Built ${MODULES.length} lesson routes, 5 course pages, bilingual notes, storyboards and Python tasks.`);
