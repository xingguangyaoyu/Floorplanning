"""Promote the complete lesson to live scenes, reusing local voice where it matches."""
import hashlib,json,shutil,subprocess
from pathlib import Path
import imageio_ffmpeg
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'dist/lessons/08/teaching';OUT.mkdir(parents=True,exist_ok=True)
from voice_checks import protect_measured_narration
protect_measured_narration(ROOT,'08')
source=json.loads((ROOT/'build/v3/full-stories.json').read_text(encoding='utf-8'))['08v3'];states=json.loads((ROOT/'build/v3/states.json').read_text(encoding='utf-8'))
old=json.loads((ROOT/'dist/data/stories.json').read_text(encoding='utf-8'))['08'];time=json.loads((ROOT/'dist/media/08/zh.json').read_text(encoding='utf-8'))['scenes'];bykey={s['key']:(s,t)for s,t in zip(old,time)}
mapping={'scope':['opening-contract','use-hard'],'couple-height':['contract-area'],'couple-bound':['contract-ratio','contract-bounds'],'couple-filter':['factors-tall','factors-survive'],'couple-model':['factors-continuous'],'baseline-read':['baseline-D','baseline-box'],'overlap-change':['reshape'],'overlap-area':['reshape-x','reshape-y'],'overlap-contact':['check-touch'],'repair-side':['repair-choice','repair-second-conflict'],'repair-up':['repair-up'],'repair-score':['repair-worse'],'repack-B':['repack-B'],'repack-C':['repack-C'],'repack-D':['repack-D'],'bottle-edge':['repack-same'],'space-D':['compact-space','compact-temporary'],'space-E':['compact-E','compact-box','compact-empty'],'metric-fixed':['metrics-outline'],'metric-box':['metrics-box','metrics-compact'],'transfer':['transfer-eight','transfer-answer'],'finish':['transfer-summary']}
questions={
 'overlap-predict':dict(prompt='只改 A 为 2×3，其余不动，会怎样？',choices=['仍合法，因为面积未变','A/D 出现正面积重叠','面积变为5'],answer=1,replies=['面积相等不能替代邻居检查。','交集为 x=0…2、y=2…3，面积2。','宽高仍相乘为6，错误来自新增占用。']),
 'bottle-predict':dict(prompt='只收紧 B、C、D 仍为27，谁还决定盒宽？',choices=['E 的右边缘','模块面积和23','固定外框80'],answer=0,replies=['A仍在原点，E的右边缘9仍决定宽度。','面积和给下界，不能直接给当前盒宽。','外框是容量，当前包围盒由实际边缘决定。']),
 'proof-prime':dict(prompt='在整数网格模型里，为什么面积23不可能？',choices=['整数边长只能1×23或23×1，放不下C','因为当前只找到24','因为固定外框密度不变'],answer=0,replies=['23是质数，两种长条短边为1，容不下固定2×2的C。','找到24只给上界，尚需排除更小的解。','固定外框密度对这些合法摆法都相同，不给最优证明。'])}
extra=[dict(key='overlap-predict',view='predict',state='baseline',pack=states['baseline'],chapterIndex=3,chapter=source[6]['chapter'],say={'zh':'下一步只改变 A 的形状。先预测整个布局是否仍合法。','en':'Predict legality after changing only A.'},seconds=8),dict(key='bottle-predict',view='predict',state='repacked',pack=states['repacked'],chapterIndex=5,chapter=source[13]['chapter'],say={'zh':'先找出仍限制包围盒的那一块。','en':'Identify the block that still limits the bounding box.'},seconds=8)]
scenes=[]
for s in source:
 if s['key']=='overlap-change':scenes.append(extra[0])
 if s['key']=='bottle-edge':scenes.append(extra[1])
 scenes.append(dict(s))
mapping['overlap-predict']=['predict-setup','predict'];mapping['bottle-predict']=['repack-predict']
filters=[];labels=[];captions=[];cuts=[];cursor=0;reading=0
for scene in scenes:
 key=scene['key'];scene['start']=round(cursor,6);keys=mapping.get(key,[]);scene['delivery']='voice'if keys else'reading'
 if not keys:
  duration=scene['seconds'];label=f'a{len(labels)}';filters.append(f'anullsrc=r=24000:cl=mono,atrim=duration={duration}[{label}]');labels.append(f'[{label}]');captions.append(dict(start=cursor,end=cursor+duration,zh=scene['say']['zh'],en=scene['say']['en'],sourceKey=None,words=[],delivery='reading'));cursor+=duration;reading+=duration
 for k in keys:
  s,t=bykey[k];duration=t['end']-t['start'];label=f'a{len(labels)}';filters.append(f'[0:a]atrim=start={t["start"]}:end={t["end"]},asetpts=PTS-STARTPTS,aresample=24000,aformat=sample_fmts=fltp:channel_layouts=mono[{label}]');labels.append(f'[{label}]');captions.append(dict(start=cursor,end=cursor+duration,zh=s['say']['zh'],en=s['say']['en'],sourceKey=k,delivery='voice',words=[dict(text=w['text'],start=cursor+w['start']-t['start'],end=cursor+w['end']-t['start'])for w in t['words']]));cuts.append(dict(scene=key,key=k,sourceStart=t['start'],sourceEnd=t['end'],start=cursor,end=cursor+duration));cursor+=duration
 scene['end']=round(cursor,6)
 if key in questions:scene['question']=questions[key]
filters.append(''.join(labels)+f'concat=n={len(labels)}:v=0:a=1[out]')
subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-v','error','-y','-i',str(ROOT/'dist/media/08/zh.m4a'),'-filter_complex',';'.join(filters),'-map','[out]','-c:a','aac','-b:a','128k','-threads','2','-movflags','+faststart',str(OUT/'narration.m4a')],check=True)
hashes={p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest()for p in ['dist/media/08/zh.m4a','dist/media/08/zh.json','dist/data/stories.json','content/v3-08-draft.mjs']}
data=dict(kind='complete-live-lesson',duration=round(cursor,6),readingSeconds=reading,scenes=scenes,states=states,captions=captions,cuts=cuts,sourceHashes=hashes,audioSha256=hashlib.sha256((OUT/'narration.m4a').read_bytes()).hexdigest())
(OUT/'lesson-data.mjs').write_text('export default '+json.dumps(data,ensure_ascii=False)+';\n',encoding='utf-8');(ROOT/'build/complete-interactive-manifest.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
# Player/model/visuals are maintained source files in OUT; never overwrite them.
print(json.dumps(dict(duration=data['duration'],scenes=len(scenes),chapters=len({s['chapterIndex']for s in scenes}),readingSeconds=reading,voiceClips=len(cuts),newSpeech=False)))
