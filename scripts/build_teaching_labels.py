"""Compile reviewed diagram labels; keep translations out of renderer logic."""
import html,json
from pathlib import Path
root=Path(__file__).resolve().parents[1]; result={}
for line in (root/'content/teaching-labels-en.tsv').read_text(encoding='utf8').splitlines():
    if line.strip():
        key,value=line.split('|');key=html.unescape(key)
        if key in result and result[key]!=value: raise ValueError('Conflicting label: '+key)
        result[key]=value
(root/'dist/assets/teaching-labels-en.mjs').write_text('export default '+json.dumps(result,ensure_ascii=False)+';\n',encoding='utf8')
print('Compiled',len(result),'diagram labels.')
