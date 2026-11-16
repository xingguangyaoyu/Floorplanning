"""Gate Lab5 facts, reused audio provenance, Python packer and useful wrong implementations."""
import hashlib,json,re,subprocess,sys
from pathlib import Path
import imageio_ffmpeg
R=Path(__file__).resolve().parents[1];d=json.loads((R/'build/lab05/provenance.json').read_text(encoding='utf-8'));out=R/'dist/lessons/05/teaching'
assert len(d['scenes'])==20 and len(d['chapters'])==8 and sum('question'in s for s in d['scenes'])==3
for p,h in d['sourceHashes'].items():assert hashlib.sha256((R/p).read_bytes()).hexdigest()==h,p
assert hashlib.sha256((out/'narration.m4a').read_bytes()).hexdigest()==d['audioSha256']
old=json.loads((R/'dist/data/stories.json').read_text(encoding='utf-8'))['05'];tim=json.loads((R/'dist/media/05/zh.json').read_text(encoding='utf-8'))['scenes'];lookup={s['key']:(s,t)for s,t in zip(old,tim)}
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
subprocess.run(['node','--test','tests/lab05.test.mjs'],cwd=R,capture_output=True,check=True)
p=R/'build/python-exercises/05';ref=(p/'reference.py').read_text(encoding='utf-8');subprocess.run([sys.executable,'check.py','reference.py'],cwd=p,capture_output=True,check=True);starter=subprocess.run([sys.executable,'check.py','starter.py'],cwd=p,capture_output=True);assert starter.returncode==1
mutations={
 'uses parent top instead of skyline query':ref.replace("y = max([0] + [seg_h for (x1, x2, seg_h) in contour if x2 > x and x1 < x + w])","y = parent_top"),
 'queries only the first unit of the footprint':ref.replace("if x2 > x and x1 < x + w])","if x2 > x and x1 < x + 1])"),
 'visits right child before the left subtree':ref.replace("walk(child(n, 1), x + pw, coords[nid][1] + ph)   # left child: parent's right edge\n        walk(child(n, 2), x, coords[nid][1] + ph)        # right child: parent's x","walk(child(n, 2), x, coords[nid][1] + ph)\n        walk(child(n, 1), x + pw, coords[nid][1] + ph)"),
 'drops residual segments':ref.replace("            if x1 < x: kept.append((x1, x, seg_h))          # keep left residual\n            if x2 > x + w: kept.append((x + w, x2, seg_h))  # keep right residual",""),
 'skips missing check':ref.replace("    missing = [i for i in modules if i not in seen]\n    if missing:\n        return {'ok': False, 'errors': ['missing:' + ','.join(missing)], 'order': [],\n                'coords': None, 'rows': [], 'contour': None, 'trace': []}",""),
 'ignores duplicates':ref.replace("        if nid in seen:\n            raise ValueError(f'duplicate:{nid}')",""),
 'hardcodes the standard layout':ref.replace("    rows = [[i, *coords[i]] for i in sorted(coords)]","    rows = [['A',0,0,3,2],['B',3,0,2,3],['C',5,0,2,2],['D',0,2,3,1],['E',7,0,2,2]] if len(modules)==5 else [[i, *coords[i]] for i in sorted(coords)]"),
 'never merges equal neighbours':ref.replace("            if merged and merged[-1][1] == seg[0] and merged[-1][2] == seg[2]:\n                merged[-1] = (merged[-1][0], seg[1], seg[2])  # merge equal neighbours\n            else:","            if False:\n                pass\n            else:")}
results=[]
for name,text in mutations.items():
 assert text!=ref,name;target=R/'build/lab05/mutation.py';target.write_text(text,encoding='utf-8');run=subprocess.run([sys.executable,str(p/'check.py'),str(target)],cwd=R,capture_output=True,text=True);assert run.returncode==1 and 'FAIL'in run.stdout,(name,run.stdout[-500:],run.stderr[-300:]);results.append({'name':name,'failedChecks':sum(line.startswith('FAIL')for line in run.stdout.splitlines())})
report=dict(verdict='PASS',scenes=20,chapters=8,duration=d['duration'],voiceSeconds=round(d['duration']-d['readingSeconds'],6),readingSeconds=d['readingSeconds'],newSpeech=bool(d.get('newSpeech')),pythonChecks=len(json.loads((R/'build/python.json').read_text(encoding='utf-8'))['05']['tests']),rejectedMutations=results,audioDecode='PASS',provenance='PASS')
(R/'build/lab05/checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(report))
