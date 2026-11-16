"""Gate Lab4 facts, reused audio provenance, Python decoder and useful wrong implementations."""
import hashlib,json,subprocess,sys
from pathlib import Path
import imageio_ffmpeg
R=Path(__file__).resolve().parents[1];d=json.loads((R/'build/lab04/provenance.json').read_text(encoding='utf-8'));out=R/'dist/lessons/04/teaching'
assert len(d['scenes'])==25 and len(d['chapters'])==8 and sum('question'in s for s in d['scenes'])==2
for p,h in d['sourceHashes'].items():assert hashlib.sha256((R/p).read_bytes()).hexdigest()==h,p
assert hashlib.sha256((out/'narration.m4a').read_bytes()).hexdigest()==d['audioSha256']
old=json.loads((R/'dist/data/stories.json').read_text(encoding='utf-8'))['04'];tim=json.loads((R/'dist/media/04/zh.json').read_text(encoding='utf-8'))['scenes'];lookup={s['key']:(s,t)for s,t in zip(old,tim)}
voiced=[c for c in d['captions']if c['delivery']=='voice'];assert len(voiced)==len(d['cuts'])==8
for cut,cue in zip(d['cuts'],voiced):
 s,t=lookup[cut['sourceKey']];assert cue['text']==s['say']['zh'];assert(cut['sourceStart'],cut['sourceEnd'])==(t['start'],t['end']);assert len(cue['words'])==len(t['words'])
 for a,b in zip(cue['words'],t['words']):assert a['text']==b['text']and abs(a['start']-(cut['start']+b['start']-t['start']))<1e-7
assert all(c['words']==[]for c in d['captions']if c['delivery']=='reading')
meta=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(out/'narration.m4a')]))
assert len(meta['streams'])==1 and meta['streams'][0]['codec_type']=='audio';assert abs(float(meta['format']['duration'])-d['duration'])<.05
subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-v','error','-threads','2','-i',str(out/'narration.m4a'),'-f','null','-'],capture_output=True,check=True)
subprocess.run(['node','--test','tests/lab04.test.mjs'],cwd=R,capture_output=True,check=True)
p=R/'build/python-exercises/04';ref=(p/'reference.py').read_text(encoding='utf-8');subprocess.run([sys.executable,'check.py','reference.py'],cwd=p,capture_output=True,check=True);starter=subprocess.run([sys.executable,'check.py','starter.py'],cwd=p,capture_output=True);assert starter.returncode==1
mutations={
 'pops in reverse order':ref.replace("b = stack.pop()   # popped first -> second region\n            a = stack.pop()   # popped second -> first region","a = stack.pop()\n            b = stack.pop()"),
 'forgets the child offset':ref.replace("place(node['right'], x, y + lh)","place(node['right'], x, y)").replace("place(node['right'], x + lw, y)","place(node['right'], x, y)"),
 'skips the underflow guard':ref.replace("if len(stack) < 2:\n                errors.append(f'underflow:{token}')\n                break",""),
 'ignores duplicate letters':ref.replace("if token in seen:\n                errors.append(f'duplicate:{token}')\n                break",""),
 'accepts leftover regions':ref.replace("if len(stack) != 1:\n        return {'ok': False, 'errors': [f'leftover:{len(stack)}'], 'tree': None,\n                'size': None, 'coords': None, 'rows': []}",""),
 'hardcodes the standard answer':ref.replace("rows = [[i, *coords[i]] for i in sorted(coords)]","rows = [['A',0,0,3,2],['B',3,0,2,3],['C',5,0,2,2],['D',0,2,3,1],['E',7,0,2,2]] if len(catalog)==5 else [[i, *coords[i]] for i in sorted(coords)]"),
 'swaps H and V conventions':ref.replace("(max(wa, wb), ha + hb) if token == 'H' else (wa + wb, max(ha, hb))","(wa + wb, max(ha, hb)) if token == 'H' else (max(wa, wb), ha + hb)"),
 'rounds decimal coordinates':ref.replace("coords[node['id']] = (x, y, *node['size'])","coords[node['id']] = (int(x), int(y), *node['size'])")}
results=[]
for name,text in mutations.items():
 assert text!=ref,name;target=R/'build/lab04/mutation.py';target.write_text(text,encoding='utf-8');run=subprocess.run([sys.executable,str(p/'check.py'),str(target)],cwd=R,capture_output=True,text=True);assert run.returncode==1 and 'FAIL'in run.stdout,(name,run.stdout[-600:],run.stderr[-300:]);results.append({'name':name,'failedChecks':sum(line.startswith('FAIL')for line in run.stdout.splitlines())})
report=dict(verdict='PASS',scenes=25,chapters=8,duration=d['duration'],voiceSeconds=round(d['duration']-d['readingSeconds'],6),readingSeconds=d['readingSeconds'],newSpeech=False,pythonChecks=len(json.loads((R/'build/python.json').read_text(encoding='utf-8'))['04']['tests']),rejectedMutations=results,audioDecode='PASS',provenance='PASS')
(R/'build/lab04/checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(report))
