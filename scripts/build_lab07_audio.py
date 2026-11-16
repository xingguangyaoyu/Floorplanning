"""Build Lab4 live timeline: reused measured speech plus authored reading, no new TTS."""
import hashlib,json,re,subprocess
from pathlib import Path
import imageio_ffmpeg
R=Path(__file__).resolve().parents[1];out=R/'dist/lessons/07/teaching';out.mkdir(parents=True,exist_ok=True)
d=json.loads((R/'build/lab07/authoring.json').read_text(encoding='utf-8'));old=json.loads((R/'dist/data/stories.json').read_text(encoding='utf-8'))['07'];tim=json.loads((R/'dist/media/07/zh.json').read_text(encoding='utf-8'))['scenes'];lookup={s['key']:(s,t)for s,t in zip(old,tim)}
filters=[];labels=[];captions=[];cuts=[];cursor=0;reading=0
for s in d['scenes']:
 s['start']=round(cursor,6);label='a'+str(len(labels));labels.append('['+label+']')
 if s.get('voice'):
  src,t=lookup[s['voice']];seconds=t['end']-t['start'];filters.append(f'[0:a]atrim=start={t["start"]}:end={t["end"]},asetpts=PTS-STARTPTS,aresample=24000,aformat=sample_fmts=fltp:channel_layouts=mono[{label}]')
  captions.append(dict(start=cursor,end=cursor+seconds,text=src['say']['zh'],delivery='voice',sourceKey=s['voice'],words=[dict(text=w['text'],start=cursor+w['start']-t['start'],end=cursor+w['end']-t['start'])for w in t['words']]))
  cuts.append(dict(scene=s['key'],sourceKey=s['voice'],sourceStart=t['start'],sourceEnd=t['end'],start=cursor,end=cursor+seconds));s['delivery']='voice'
 else:
  seconds=max(s.get('seconds',10),round(len(s['say'])/6+1,2));reading+=seconds;filters.append(f'anullsrc=r=24000:cl=mono,atrim=duration={seconds}[{label}]');s['delivery']='reading'
  parts=re.findall(r'[^。！？]+[。！？]?',s['say']);total=sum(map(len,parts));at=cursor
  for part in parts:
   length=seconds*len(part)/total;captions.append(dict(start=at,end=at+length,text=part,delivery='reading',sourceKey=None,words=[]));at+=length
 cursor+=seconds;s['end']=round(cursor,6)
filters.append(''.join(labels)+f'concat=n={len(labels)}:v=0:a=1[out]')
subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-v','error','-y','-i',str(R/'dist/media/07/zh.m4a'),'-filter_complex',';'.join(filters),'-map','[out]','-c:a','aac','-b:a','96k','-threads','2','-movflags','+faststart',str(out/'narration.m4a')],check=True)
d.update(duration=round(cursor,6),readingSeconds=round(reading,6),captions=captions,cuts=cuts,newSpeech=False,audioSha256=hashlib.sha256((out/'narration.m4a').read_bytes()).hexdigest(),sourceHashes={p:hashlib.sha256((R/p).read_bytes()).hexdigest()for p in ['content/interactive07.mjs','dist/media/07/zh.m4a','dist/media/07/zh.json','dist/assets/anneal07.mjs']})
(out/'lesson-data.mjs').write_text('export default '+json.dumps(d,ensure_ascii=False)+';\n',encoding='utf-8');(R/'build/lab07/provenance.json').write_text(json.dumps(d,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps({k:d[k]for k in ['duration','readingSeconds','newSpeech']}))
