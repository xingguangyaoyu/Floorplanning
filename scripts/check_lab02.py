"""Gate Lab2 facts, reused audio provenance, Python checker and useful wrong implementations."""
import hashlib,json,re,subprocess,sys
from pathlib import Path
import imageio_ffmpeg
R=Path(__file__).resolve().parents[1];d=json.loads((R/'build/lab02/provenance.json').read_text(encoding='utf-8'));out=R/'dist/lessons/02/teaching'
assert len(d['scenes'])==26 and len(d['chapters'])==8 and sum('question'in s for s in d['scenes'])==7
for p,h in d['sourceHashes'].items():assert hashlib.sha256((R/p).read_bytes()).hexdigest()==h,p
assert hashlib.sha256((out/'narration.m4a').read_bytes()).hexdigest()==d['audioSha256']
old=json.loads((R/'dist/data/stories.json').read_text(encoding='utf-8'))['02'];tim=json.loads((R/'dist/media/02/zh.json').read_text(encoding='utf-8'))['scenes'];lookup={s['key']:(s,t)for s,t in zip(old,tim)}
if d.get('newSpeech'):
 from voice_checks import validate_new
 validate_new(d,R,out/'narration.m4a')
else:
 assert len(voiced)==len(d['cuts'])==8
 for cut,cue in zip(d['cuts'],voiced):
  s,t=lookup[cut['sourceKey']];assert cue['text']==s['say']['zh'];assert(cut['sourceStart'],cut['sourceEnd'])==(t['start'],t['end']);assert len(cue['words'])==len(t['words'])
  for a,b in zip(cue['words'],t['words']):assert a['text']==b['text']and abs(a['start']-(cut['start']+b['start']-t['start']))<1e-7
 assert all(c['words']==[]for c in d['captions']if c['delivery']=='reading')
probe=subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-hide_banner','-i',str(out/'narration.m4a')],capture_output=True,text=True)
m=re.search(r'Duration: (\d+):(\d+):(\d+\.\d+)',probe.stderr);assert m,probe.stderr[-500:]
secs=int(m.group(1))*3600+int(m.group(2))*60+float(m.group(3));assert abs(secs-d['duration'])<.05
subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-v','error','-threads','2','-i',str(out/'narration.m4a'),'-f','null','-'],capture_output=True,check=True)
subprocess.run(['node','--test','tests/lab02.test.mjs'],cwd=R,capture_output=True,check=True)
p=R/'build/python-exercises/02';ref=(p/'reference.py').read_text(encoding='utf-8');subprocess.run([sys.executable,'check.py','reference.py'],cwd=p,capture_output=True,check=True);starter=subprocess.run([sys.executable,'check.py','starter.py'],cwd=p,capture_output=True);assert starter.returncode==1
mutations={
 'always legal':ref.replace("'legal':not errors","'legal':True"),
 'ignores collisions':ref.replace('if dx > 0 and dy > 0:','if False:'),
 'counts boundary as collision':ref.replace('if dx > 0 and dy > 0:','if dx >= 0 and dy >= 0:'),
 'skips non A/B pairs':ref.replace('for b,X,Y,W,H in good[i+1:]:','for b,X,Y,W,H in good[i+1:]:\n            if a not in ("A","B") and b not in ("A","B"): continue'),
 'allows hard rotation':ref.replace('(w,h) != tuple(catalog[name])','(w,h) != tuple(catalog[name]) and (h,w) != tuple(catalog[name])'),
 'hardcodes outline':ref.replace('width, height = outline','width, height = (10,8)')}
results=[]
for name,text in mutations.items():
 assert text!=ref;target=R/'build/lab02/mutation.py';target.write_text(text,encoding='utf-8');run=subprocess.run([sys.executable,str(p/'check.py'),str(target)],cwd=R,capture_output=True,text=True);assert run.returncode==1 and 'FAIL'in run.stdout,(name,run.stdout,run.stderr);results.append({'name':name,'failedChecks':sum(line.startswith('FAIL')for line in run.stdout.splitlines())})
report=dict(verdict='PASS',scenes=26,chapters=8,duration=d['duration'],voiceSeconds=round(d['duration']-d['readingSeconds'],6),readingSeconds=d['readingSeconds'],newSpeech=bool(d.get('newSpeech')),pythonChecks=len(json.loads((R/'build/python.json').read_text(encoding='utf-8'))['02']['tests']),rejectedMutations=results,audioDecode='PASS',provenance='PASS')
(R/'build/lab02/checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(report))
