import json,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];tasks=json.loads((ROOT/'build/python.json').read_text(encoding='utf-8'))
folder=ROOT/'build/python-exercises';folder.mkdir(parents=True,exist_ok=True)
for key,task in tasks.items():
 p=folder/key;p.mkdir(exist_ok=True);(p/'starter.py').write_text(task['starter'],encoding='utf-8');(p/'reference.py').write_text(task['reference'],encoding='utf-8')
 check='''import importlib.util,math,sys\nfrom pathlib import Path\np=Path(sys.argv[1] if len(sys.argv)>1 else "starter.py")\nspec=importlib.util.spec_from_file_location("student",p);student=importlib.util.module_from_spec(spec);spec.loader.exec_module(student)\nscope=dict(vars(student));scope["math"]=math\ndef raises_value_error(f):\n    try:f()\n    except ValueError:return True\n    return False\nscope["raises_value_error"]=raises_value_error\nfailed=0\n'''
 for name,expr in task['tests']:
  check+=f'''try:\n    ok=bool(eval({expr!r},scope))\n    print(("PASS" if ok else "FAIL"),{name!r})\n    failed+=not ok\nexcept NotImplementedError:\n    print("INCOMPLETE",{name!r});failed+=1\nexcept Exception as e:\n    print("FAIL",{name!r},str(e));failed+=1\n'''
 check+='raise SystemExit(1 if failed else 0)\n';(p/'check.py').write_text(check,encoding='utf-8');(p/'README.md').write_text(f'# Lesson {key}\n\n{task["prompt"]["zh"]}\n\n{task["prompt"]["en"]}\n\nRun from this folder:\n\n```\npython check.py starter.py\npython check.py reference.py\n```\n',encoding='utf-8')
with zipfile.ZipFile(ROOT/'dist/downloads/python-exercises.zip','w',zipfile.ZIP_DEFLATED)as z:
 for f in folder.rglob('*'):
  if f.is_file() and '__pycache__' not in str(f):z.write(f,f.relative_to(folder))
print(f'Packaged {len(tasks)} runnable Python exercises.')
