"""Compile the maintained, reviewed page catalog. No translation service calls."""
import hashlib,json,re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'content/page-locale-en.json').read_text(encoding='utf8'))
for zh,en in data.items():
    assert isinstance(en,str) and (en.strip() or zh=='课'),zh
    assert not re.search('[\u4e00-\u9fff]',en),(zh,en)
    assert sorted(re.findall(r'\{\d+\}',zh))==sorted(re.findall(r'\{\d+\}',en)),(zh,en)
target=root/'dist/assets/page-locale-data.mjs'
target.write_text('export default '+json.dumps(data,ensure_ascii=False)+';\n',encoding='utf8')
version=hashlib.sha256(target.read_bytes()).hexdigest()[:12]
module=root/'dist/assets/page-locale.mjs';text=module.read_text(encoding='utf8')
module.write_text(re.sub(r'\./page-locale-data\.mjs(?:\?v=[a-f0-9]+)?','./page-locale-data.mjs?v='+version,text),encoding='utf8')
print('Compiled',len(data),'page-localization entries;',version)
