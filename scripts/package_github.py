"""Build a curated GitHub source/runtime archive locally; never upload or deploy."""
import argparse,hashlib,json,zipfile,shutil
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
TARGET=ROOT/'floorplanning-studio-github-2026-11-16.zip'
parser=argparse.ArgumentParser();parser.add_argument('--output');parser.add_argument('--directory');args=parser.parse_args()
if args.output:TARGET=ROOT/args.output
ROOT_FILES=['HANDOFF.md','README.md','GITHUB_UPLOAD.md','LICENSE','THIRD_PARTY_NOTICES.md','package.json','requirements-dev.txt','.gitignore','start-preview.ps1','打开本地预览.cmd']
SCRIPTS=['build.mjs','serve.py','package_python.py','package_github.py','check_site.py','check_http.py','check_complete_interactive.py','prepare_v3.mjs','build_complete_interactive.py']
SCRIPTS+=['voice_pipeline.py','voice_checks.py','build_teaching_labels.py','build_page_locale.py']
for n in range(2,8):
 SCRIPTS += [f'prepare_lab{n:02}.mjs',f'build_lab{n:02}_audio.py',f'check_lab{n:02}.py']
DOCS=['DEVELOPMENT.md','VERIFICATION.md','source-audit.md','verification/verify-representation-domains.mjs','verification/representation-domains.json','verification/verify-shape-state.mjs','verification/shape-state-results.json']
for n in range(2,8):DOCS.append(f'lab{n:02}/transcript.md')
BUILD=['python.json','complete-interactive-manifest.json','complete-interactive-checks.json','site-checks.json','http-checks.json']
BUILD+=['voice-repair-2026-11-16/plan.json','voice-repair-2026-11-16/checks.json']
BUILD+=['voice-repair-2026-11-16/browser-seek.json','voice-repair-2026-11-16/lab08-geometry-browser.json','voice-repair-2026-11-16/remaining-teaching-labels.json']
DOCS+=['voice-repair-2026-11-16/HANDOFF.md','page-i18n-2026-11-17/HANDOFF.md','page-i18n-2026-11-17/browser-final-samples.json','page-i18n-2026-11-17/lab04-workbench-english.jpg','page-i18n-2026-11-17/lab02-mobile-english.jpg']
for n in range(2,8):
 for name in ['authoring.json','provenance.json','checks.json']:BUILD.append(f'lab{n:02}/{name}')

files=[ROOT/n for n in ROOT_FILES]+[ROOT/'scripts'/n for n in SCRIPTS]+[ROOT/'docs'/n for n in DOCS]+[ROOT/'build'/n for n in BUILD]
files += [p for p in (ROOT/'build/voice-repair-2026-11-16/clips').rglob('*') if p.is_file() and p.suffix in ['.mp3','.json']]
for folder in ['dist','content','tests']:
 files += [p for p in (ROOT/folder).rglob('*') if p.is_file() and '__pycache__' not in p.parts and p.suffix not in ['.pyc','.log']]
files=sorted(set(files));missing=[str(p.relative_to(ROOT))for p in files if not p.is_file()]
if missing:raise SystemExit('Missing release files: '+', '.join(missing))

manifest={'schema':1,'release':'2026-11-17','kind':'github-source-and-local-runtime','entry':'dist/index.html','localOnly':True,
 'files':[{'path':p.relative_to(ROOT).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}for p in files]}
for item in manifest['files']:
 rel=item['path'];parts=Path(rel).parts
 if any(x in parts for x in ['research','cache','__pycache__','.git']) or rel.endswith(('.mp4','.wav','.log')):raise SystemExit('Unexpected release file: '+rel)

if args.directory:
 target=(ROOT/args.directory).resolve()
 if not target.is_relative_to(ROOT) or target==ROOT:raise SystemExit('Output folder must be inside project and separate from source')
 target.mkdir(parents=True,exist_ok=True)
 for p in files:
  out=target/p.relative_to(ROOT);out.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,out)
 (target/'PACKAGE_MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=1)+'\n',encoding='utf8')
 for item in manifest['files']:
  data=(target/item['path']).read_bytes()
  assert len(data)==item['bytes'] and hashlib.sha256(data).hexdigest()==item['sha256'],item['path']
 print(json.dumps({'directory':str(target),'files':len(files)+1,'bytes':sum(i['bytes']for i in manifest['files'])},ensure_ascii=False));raise SystemExit(0)

with zipfile.ZipFile(TARGET,'w',zipfile.ZIP_DEFLATED,compresslevel=4)as z:
 for p in files:z.write(p,'floorplanning-studio/'+p.relative_to(ROOT).as_posix())
 z.writestr('floorplanning-studio/PACKAGE_MANIFEST.json',json.dumps(manifest,ensure_ascii=False,indent=1)+'\n')
with zipfile.ZipFile(TARGET)as z:
 assert z.testzip()is None
 for item in manifest['files']:
  data=z.read('floorplanning-studio/'+item['path'])
  assert len(data)==item['bytes'] and hashlib.sha256(data).hexdigest()==item['sha256'],item['path']
 assert not any('/.github/workflows/'in n for n in z.namelist())
print(json.dumps({'archive':str(TARGET),'files':len(files)+1,'bytes':TARGET.stat().st_size,
 'largestFileBytes':max(i['bytes']for i in manifest['files']),
 'sha256':hashlib.sha256(TARGET.read_bytes()).hexdigest()},ensure_ascii=False))
