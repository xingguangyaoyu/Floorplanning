"""Gate the complete live lesson and its local audio provenance, not retired MP4s."""
import hashlib,json,subprocess
from pathlib import Path
import imageio_ffmpeg
ROOT=Path(__file__).resolve().parents[1];DATA=json.loads((ROOT/'build/complete-interactive-manifest.json').read_text(encoding='utf-8'));OUT=ROOT/'dist/lessons/08/teaching'
assert DATA['kind']=='complete-live-lesson'and len(DATA['scenes'])==44 and len({s['chapterIndex']for s in DATA['scenes']})==11
assert sum('question'in s for s in DATA['scenes'])==3
for p,h in DATA['sourceHashes'].items():assert hashlib.sha256((ROOT/p).read_bytes()).hexdigest()==h,p
assert hashlib.sha256((OUT/'narration.m4a').read_bytes()).hexdigest()==DATA['audioSha256']
old=json.loads((ROOT/'dist/data/stories.json').read_text(encoding='utf-8'))['08'];timing=json.loads((ROOT/'dist/media/08/zh.json').read_text(encoding='utf-8'))['scenes'];lookup={s['key']:(s,t)for s,t in zip(old,timing)}
if DATA.get('newSpeech'):
 from voice_checks import validate_new
 validate_new(DATA,ROOT,OUT/'narration.m4a')
else:
 voiced=[c for c in DATA['captions']if c['delivery']=='voice'];assert len(voiced)==len(DATA['cuts'])==36
 for cut,cue in zip(DATA['cuts'],voiced):
  s,t=lookup[cut['key']];assert cue['zh']==s['say']['zh']and cue['en']==s['say']['en'];assert(cut['sourceStart'],cut['sourceEnd'])==(t['start'],t['end']);assert len(cue['words'])==len(t['words'])
  for a,b in zip(cue['words'],t['words']):assert a['text']==b['text']and abs(a['start']-(cut['start']+b['start']-t['start']))<1e-7
 assert all(not c['words']for c in DATA['captions']if c['delivery']=='reading')
cursor=0
for s in DATA['scenes']:assert abs(s['start']-cursor)<1e-5 and s['end']>s['start'];cursor=s['end']
assert abs(cursor-DATA['duration'])<1e-6
meta=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(OUT/'narration.m4a')]))
assert len(meta['streams'])==1 and meta['streams'][0]['codec_type']=='audio';assert abs(float(meta['format']['duration'])-DATA['duration'])<.04
subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-v','error','-threads','2','-i',str(OUT/'narration.m4a'),'-f','null','-'],capture_output=True,check=True)
assert not list((ROOT/'dist/media/08').rglob('*.mp4')),'Retired MP4s must not be served in Lab8'
subprocess.run(['node','--test','tests/interactive-pilot.test.mjs'],cwd=ROOT,capture_output=True,check=True)
subprocess.run(['python','check.py','reference.py'],cwd=ROOT/'build/python-exercises/08',capture_output=True,check=True)
starter=subprocess.run(['python','check.py','starter.py'],cwd=ROOT/'build/python-exercises/08',capture_output=True);assert starter.returncode==1
report=dict(verdict='PASS',kind='complete-live-lesson',duration=DATA['duration'],scenes=44,chapters=11,voiceClips=len(DATA.get('utterances',DATA['cuts'])),readingSeconds=DATA['readingSeconds'],newSpeech=bool(DATA.get('newSpeech')),questions=3,pythonChecks=22,provenance='PASS',decode='PASS',learnerMp4='removed',audioSha256=DATA['audioSha256'])
(ROOT/'build/complete-interactive-checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');(ROOT/'build/full-lesson-checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(report))
