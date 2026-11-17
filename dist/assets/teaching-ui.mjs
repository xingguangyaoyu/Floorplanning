import{language}from'./teaching-language.mjs';
import labels from'./teaching-labels-en.mjs';
const words={
 '可直接操作的布图讲解':'Interactive floorplanning diagram','五模块布局':'Five-block layout','静音配音':'Mute narration','开启配音':'Unmute narration',
 '准备中':'Preparing','播放':'Play','暂停':'Pause','播放讲解':'Play lesson','暂停讲解':'Pause lesson','静音':'Mute','开启声音':'Unmute','文字':'Captions','全屏':'Fullscreen','速度':'Speed',
 '自己的尝试':'Your experiment','回到讲解':'Return to lesson','继续看解释':'Continue','留在本题':'Stay here','讲解进度':'Lesson progress','章节与尝试工具（可选）':'Chapters and experiment tools',
 '讲解路线':'Chapters','定位推演步骤':'Choose a step','查看本步结尾':'Show step end','点图里的模块试一试':'Try moving the blocks','当前模块':'Selected block','撤销':'Undo','重置本次尝试':'Reset experiment',
 '继续本页的动手实验 ↓':'Continue to the lab below ↓','直接点图里的模块':'Select a block to experiment','同图尝试':'Experiment on this layout','讲解章节':'Lesson chapters','交互讲解':'Interactive lesson',
 '可以操作的布局讲解':'Interactive layout diagram','讲解已暂停。试完后回到原处接着看。':'Lesson paused. Return when you finish experimenting.',
 '已暂停自动继续，想好后可以接着看。':'Auto-continue paused. Continue when ready.','播放到这里后，会留出时间让你想一想。':'This question allows time to think.',
 '点图里的模块，或选择一个模块试一试。':'Select a block in the diagram to experiment.',
 '直接拖动图中的模块，检查结果会即时更新；试完点“回到讲解”继续。':'Drag a block to update checks. Choose Return to lesson when finished.',
 '当前摆放符合这一步的模块清单和几何规则。':'This placement satisfies the catalog and geometric constraints.',
 '先看这一步怎样推出来。想试摆时，展开工具，选择一个模块。':'Follow the derivation, or open the tools and select a block to experiment.',
 '讲解暂停。现在修改的是自己的尝试；返回后恢复原来的讲解时间和画面。':'Lesson paused. Edits affect your experiment only; returning restores the original lesson.',
 '选一个模块，看看你的改动会带来什么变化。':'Select a block and inspect the effect of your edit.',
 'A 换形：2×3 / 3×2':'Reshape A: 2×3 / 3×2'
};
export function teachingText(text){
 if(words[text])return words[text];if(labels[text])return labels[text];
 return text.replace(/^外框\s*(.+)$/,'Outline $1').replace(/^当前栈顶区域 (.+)$/,'Top stack region $1')
 .replace(/^问题 一$/,'Question 1').replace(/^问题 二$/,'Question 2').replace(/^问题 三$/,'Question 3').replace(/^交集宽 (.+)$/,'Shared width $1').replace(/^高 (.+)$/,'Height $1').replace(/^坐标 (.+)$/,'Origin $1')
 .replace(/^第 (\d+) 步：压入 (.+)$/,'Step $1: push $2').replace(/^第 (\d+) 步：([HV]) — 弹出两个、合成一个$/,'Step $1: $2 — pop two, combine one').replace(/^第 (\d+) 步的真实日志$/,'Actual log: step $1')
 .replace(/^([A-Z]) 进栈：它是一个叶子，尺寸 (.+)，暂时单独占一个栈位$/,'Push $1: leaf, size $2')
 .replace(/^先弹 (.+)（第二区域），再弹 (.+)（第一区域）$/,'Pop $1 (second), then $2 (first)')
 .replace(/^按 ([HV]) 合成 (.+)，压回栈顶$/,'$1 combine → $2; push')
 .replace(/^([A-Z]) 是叶子 → (.+)$/,'$1 leaf → $2').replace(/^([HV]) 合成 → (.+)$/,'$1 combines → $2')
 .replace(/^(.+)：父 (.+) 原点 (.+) \+ 偏移 (.+) → 新原点 (.+)$/,'$1: $2 origin $3 + offset $4 → $5')
 .replace(/^([A-Z])·([A-Z]) → 水平（同序）$/,'$1·$2 → horizontal (same order)')
 .replace(/^([A-Z])·([A-Z]) → 竖直（反序）$/,'$1·$2 → vertical (opposite order)')
 .replace(/^竖线 (.+)$/,'Vertical $1').replace(/^横线 (.+)$/,'Horizontal $1').replace(/^越界 (.+)$/,'Overflow $1')
 .replace(/^右边缘 (.+)$/,'Right edge $1').replace(/^E 右边缘 (.+)$/,'E right edge $1')
 .replace(/^x=7：共边，交集面积为 0$/,'x=7: edge contact, area 0')
 .replace(/^dx=(.+)，dy=(.+)，面积 (.+)$/,'dx=$1, dy=$2, area $3')
 .replace(/^根从 (.+) 开始，还没有孩子$/,'Root at $1; children not placed yet')
 .replace(/^第 (\d+) \/ (\d+) 章$/,'Chapter $1 / $2').replace(/^模块 ([A-Z])，第(\d+)行$/,'Block $1, row $2').replace(/^([A-Z])（第(\d+)行）$/,'$1 (row $2)').replace(/^讲解停在(.+)，返回后可以接着看。$/,'Lesson paused at $1. Return to continue.').replace(/^(\d+)秒后显示答案；也可以点选或留在本题。$/,'Answer in $1 seconds. Choose an option or stay here.').replace(/^答案已显示，(\d+)秒后继续。$/,'Answer revealed. Continuing in $1 seconds.');
}
export function localizeTeaching(root){
 if(language!=='en')return;
 const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),changes=[];
 while(walk.nextNode()){const n=walk.currentNode,t=n.nodeValue.trim(),out=teachingText(t);if(out!==t)changes.push([n,n.nodeValue.replace(t,out)]);}
 for(const[n,v]of changes)n.nodeValue=v;
 for(const el of root.querySelectorAll('[aria-label]'))el.setAttribute('aria-label',teachingText(el.getAttribute('aria-label')));
 // English words are often wider than the Chinese labels they replace.
 // Fit within the existing SVG/card without changing its mathematical geometry.
 for(const el of root.querySelectorAll('#stage text')){
  const x=Number(el.getAttribute('x')),y=Number(el.getAttribute('y')),font=Number(el.getAttribute('font-size'))||18,anchor=el.getAttribute('text-anchor')||'start';
  if(!Number.isFinite(x))continue;
  let left=24,right=936;
  for(const box of el.parentElement.children){if(box.tagName!=='rect')continue;const a=Number(box.getAttribute('x')),b=Number(box.getAttribute('y')),w=Number(box.getAttribute('width')),h=Number(box.getAttribute('height'));if(x>a&&x<a+w&&y>b&&y<b+h){left=a+10;right=a+w-10;break;}}
  const available=anchor==='middle'?2*Math.min(x-left,right-x):anchor==='end'?x-left:right-x;
  const estimate=el.textContent.length*font*.54;if(available>20&&estimate>available)el.style.fontSize=(font*available/estimate).toFixed(2)+'px';
 }
}
