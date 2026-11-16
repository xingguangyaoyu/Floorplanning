"""Offline content, downloads, measured timings and exercise acceptance checks."""
import hashlib,json,re,subprocess,sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit,unquote
ROOT=Path(__file__).resolve().parents[1];DIST=ROOT/'dist'
errors=[];checks=0
def check(ok,message):
 global checks
 checks+=1
 if not ok:errors.append(message)
class Resources(HTMLParser):
 def __init__(self):super().__init__();self.urls=[]
 def handle_starttag(self,tag,attrs):
  for k,v in attrs:
   if k in ['src','href'] and v:self.urls.append(v)
for html in DIST.rglob('*.html'):
 text=html.read_text(encoding='utf-8');parser=Resources();parser.feed(text)
 check(text.count('</html>')==text.count('</body>')==1,f'Duplicate closing tags: {html}')
 for url in parser.urls:
  path=urlsplit(url)
  if path.scheme or path.netloc or not path.path:continue
  target=(html.parent/unquote(path.path)).resolve()
  check(target.exists(),f'Missing HTML asset: {target}')
stories=json.loads((DIST/'data/stories.json').read_text(encoding='utf-8'))
for lesson,scenes in stories.items():
 for lang in ['zh','en']:
  folder=DIST/'media'/lesson;timing=json.loads((folder/f'{lang}.json').read_text(encoding='utf-8'))
  check(len(timing['scenes'])==len(scenes),f'Timing scene mismatch {lesson}/{lang}')
  expected=hashlib.sha256(json.dumps([s['say'][lang] for s in scenes],ensure_ascii=False).encode()).hexdigest()
  check(timing['scriptHash']==expected,f'Narration stale {lesson}/{lang}')
  last=0
  for i,scene in enumerate(timing['scenes']):
   check(abs(scene['start']-last)<.001 and scene['start']<scene['speechEnd']<scene['end'],f'Timeline gap/overlap {lesson}/{lang}/{i}')
   check(scene['alignment']=='measured-word-boundary' and len(scene['words'])>0,f'No measured words {lesson}/{lang}/{i}')
   check(scene['start']<=scene['animate']<scene['speechEnd'],f'Bad animation anchor {lesson}/{lang}/{i}')
   last=scene['end']
  check(abs(last-timing['duration'])<.001,f'Timeline duration {lesson}/{lang}')
  for suffix in ['m4a','vtt','-translation.vtt']:
   f=folder/(lang+suffix if suffix.startswith('-') else lang+'.'+suffix)
   check(f.is_file() and f.stat().st_size>0,f'Missing media {f}')
  for suffix in ['.vtt','-translation.vtt']:
   cues=(folder/(lang+suffix)).read_text(encoding='utf-8')
   check(cues.count(' --> ')==len(scenes),f'Caption count {lesson}/{lang}{suffix}')
  if lesson!='intro':
   check((DIST/f'downloads/lesson-{lesson}-{lang}.md').is_file(),f'Missing notes {lesson}/{lang}')
for lesson in ['02','03','04','05','06','07','08']:
 folder=ROOT/'build/python-exercises'/lesson
 for source in ['reference.py','starter.py']:
  run=subprocess.run([sys.executable,'check.py',source],cwd=folder,capture_output=True,text=True)
  check(run.returncode==(0 if source=='reference.py' else 1),f'Exercise outcome {lesson}/{source}: {run.stdout} {run.stderr}')
  check(('PASS' in run.stdout and 'FAIL' not in run.stdout) if source=='reference.py' else 'INCOMPLETE' in run.stdout,f'Exercise status {lesson}/{source}')
for filename in ['source-audit.md','THIRD_PARTY_NOTICES.md','python-exercises.zip','course-notes-zh.md','course-notes-en.md']:
 check((DIST/'downloads'/filename).is_file(),f'Missing download {filename}')
report={'checks':checks,'passed':checks-len(errors),'errors':errors}
(ROOT/'build/site-checks.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2));raise SystemExit(bool(errors))
