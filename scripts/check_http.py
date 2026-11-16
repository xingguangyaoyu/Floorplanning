"""Verify the actual local listener, asset responses and media byte ranges."""
import json,urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];DIST=ROOT/'dist';BASE='http://127.0.0.1:8830/'
opener=urllib.request.build_opener(urllib.request.ProxyHandler({}))
results=[]
for path in sorted(DIST.rglob('*')):
 if not path.is_file():continue
 url=BASE+path.relative_to(DIST).as_posix()
 try:
  with opener.open(urllib.request.Request(url,method='HEAD'),timeout=4)as response:
   assert response.status==200
   assert int(response.headers['Content-Length'])==path.stat().st_size
   results.append({'path':path.relative_to(DIST).as_posix(),'status':response.status})
 except Exception as error:raise RuntimeError(f'{url}: {error}')from error
ranges=[]
for name in ['media/08/en.m4a','lessons/08/teaching/narration.m4a','lessons/02/teaching/narration.m4a','lessons/03/teaching/narration.m4a','lessons/04/teaching/narration.m4a','lessons/05/teaching/narration.m4a','lessons/06/teaching/narration.m4a','lessons/07/teaching/narration.m4a']:
 if not (DIST/name).is_file():continue
 size=(DIST/name).stat().st_size
 probes=[('head',0,127),(('mid',size//2,min(size//2+127,size-1))),(('tail',max(0,size-128),size-1))]
 for label,start,end in probes:
  expect=end-start+1
  with opener.open(urllib.request.Request(BASE+name,headers={'Range':f'bytes={start}-{end}'}),timeout=6)as response:
   data=response.read();assert response.status==206 and len(data)==expect,f'{name} {label}: status {response.status} bytes {len(data)} of {expect}'
   assert response.headers['Content-Range']==f'bytes {start}-{end}/{size}',f'{name} {label}: {response.headers["Content-Range"]}'
   ranges.append({'path':name,'probe':label,'status':206,'bytes':len(data),'total':size})
report={'base':BASE,'assetCount':len(results),'assets':results,'ranges':ranges}
(ROOT/'build/http-checks.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(f'HTTP PASS: {len(results)} files returned 200 with correct lengths; {len(ranges)} range checks returned 206.')
