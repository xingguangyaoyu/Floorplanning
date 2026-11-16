"""Gate Lab6 facts, reused audio provenance, Python decoder and useful wrong implementations."""
import hashlib,json,re,subprocess,sys
from pathlib import Path
import imageio_ffmpeg
R=Path(__file__).resolve().parents[1];d=json.loads((R/'build/lab06/provenance.json').read_text(encoding='utf-8'));out=R/'dist/lessons/06/teaching'
assert len(d['scenes'])==18 and len(d['chapters'])==8 and sum('question'in s for s in d['scenes'])==4
for p,h in d['sourceHashes'].items():assert hashlib.sha256((R/p).read_bytes()).hexdigest()==h,p
assert hashlib.sha256((out/'narration.m4a').read_bytes()).hexdigest()==d['audioSha256']
old=json.loads((R/'dist/data/stories.json').read_text(encoding='utf-8'))['06'];tim=json.loads((R/'dist/media/06/zh.json').read_text(encoding='utf-8'))['scenes'];lookup={s['key']:(s,t)for s,t in zip(old,tim)}
if d.get('newSpeech'):
 from voice_checks import validate_new
 validate_new(d,R,out/'narration.m4a')
else:
 voiced=[c for c in d['captions']if c['delivery']=='voice'];assert len(voiced)==len(d['cuts'])==8
 for cut,cue in zip(d['cuts'],voiced):
  s,t=lookup[cut['sourceKey']];assert cue['text']==s['say']['zh'];assert(cut['sourceStart'],cut['sourceEnd'])==(t['start'],t['end']);assert len(cue['words'])==len(t['words'])
  for a,b in zip(cue['words'],t['words']):assert a['text']==b['text']and abs(a['start']-(cut['start']+b['start']-t['start']))<1e-7
 assert all(c['words']==[]for c in d['captions']if c['delivery']=='reading')
probe=subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-hide_banner','-i',str(out/'narration.m4a')],capture_output=True,text=True)
m=re.search(r'Duration: (\d+):(\d+):(\d+\.\d+)',probe.stderr);assert m,probe.stderr[-500:]
secs=int(m.group(1))*3600+int(m.group(2))*60+float(m.group(3));assert abs(secs-d['duration'])<.05
subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-v','error','-threads','2','-i',str(out/'narration.m4a'),'-f','null','-'],capture_output=True,check=True)
subprocess.run(['node','--test','tests/lab06.test.mjs'],cwd=R,capture_output=True,check=True)
p=R/'build/python-exercises/06';ref=(p/'reference.py').read_text(encoding='utf-8');subprocess.run([sys.executable,'check.py','reference.py'],cwd=p,capture_output=True,check=True);starter=subprocess.run([sys.executable,'check.py','starter.py'],cwd=p,capture_output=True);assert starter.returncode==1
NL=chr(10)
mutations={
 'connects only adjacent pairs':ref.replace("for j in range(i + 1, len(pos)):","for j in range(i + 1, min(i + 2, len(pos))):"),
 'sums lower bounds instead of taking max':ref.replace("x = max([0] + [v for v, _ in hx])","x = sum([v for v, _ in hx]) if hx else 0"),
 'uses successor size as edge weight':ref.replace("hx = [((coords[p][0] + modules[p][0]), p) for (p, q) in H if q == nid]","hx = [((coords[p][0] + modules[q][0]), p) for (p, q) in H if q == nid]"),
 'swaps the vertical convention':ref.replace("else:"+NL+"                V.append((a, b))      # reversed -> vertical, a below b","else:"+NL+"                H.append((a, b))"),
 'drops the horizontal branch':ref.replace("H.append((a, b))      # same order -> horizontal, a left of b","V.append((a, b))"),
 'walks in reverse topological order':ref.replace('for nid in pos:                    # pos is a topological order','for nid in reversed(pos):'),
 'reports wrong key predecessor':ref.replace("'x': max(hx)[1] if hx else None, 'y': max(hy)[1] if hy else None}","'x': None, 'y': None}"),
 'hardcodes the standard layout':ref.replace("    rows = [[i, *coords[i]] for i in sorted(coords)]","    rows = [['A',0,0,3,2],['B',3,0,2,3],['C',5,0,2,2],['D',0,3,3,1],['E',7,0,2,2]] if len(modules)==5 else [[i, *coords[i]] for i in sorted(coords)]"),
}
results=[]
for name,text in mutations.items():
 assert text!=ref,name;target=R/'build/lab06/mutation.py';target.write_text(text,encoding='utf-8');run=subprocess.run([sys.executable,str(p/'check.py'),str(target)],cwd=R,capture_output=True,text=True);assert run.returncode==1 and 'FAIL'in run.stdout,(name,run.stdout[-500:],run.stderr[-300:]);results.append({'name':name,'failedChecks':sum(line.startswith('FAIL')for line in run.stdout.splitlines())})
report=dict(verdict='PASS',scenes=18,chapters=8,duration=d['duration'],voiceSeconds=round(d['duration']-d['readingSeconds'],6),readingSeconds=d['readingSeconds'],newSpeech=bool(d.get('newSpeech')),pythonChecks=len(json.loads((R/'build/python.json').read_text(encoding='utf-8'))['06']['tests']),rejectedMutations=results,audioDecode='PASS',provenance='PASS')
(R/'build/lab06/checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(report))
