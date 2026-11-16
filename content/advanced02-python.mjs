import{BASE02,CATALOG02}from'../dist/assets/legality02.mjs';
const bi=(zh,en)=>({zh,en}),base=JSON.stringify(BASE02),catalog=JSON.stringify(CATALOG02),call=r=>`validate_layout(${r}, (10,8), ${catalog})`;
const reference=`import math

def validate_layout(rows, outline, catalog):
    errors, seen, good, overlaps = set(), set(), [], []
    width, height = outline
    for row in rows:
        name, x, y, w, h = row
        if name in seen: errors.add('duplicate:' + name)
        seen.add(name)
        if name not in catalog: errors.add('unknown:' + name)
        if not all(isinstance(v,(int,float)) and not isinstance(v,bool) and math.isfinite(v) for v in (x,y,w,h)) or w <= 0 or h <= 0:
            errors.add('number:' + name)
            continue
        good.append(row)
        if name in catalog and (w,h) != tuple(catalog[name]): errors.add('shape:' + name)
        if x < 0 or y < 0 or x+w > width or y+h > height: errors.add('outside:' + name)
    for name in catalog:
        if name not in seen: errors.add('missing:' + name)
    for i,(a,x,y,w,h) in enumerate(good):
        for b,X,Y,W,H in good[i+1:]:
            dx = max(0, min(x+w,X+W)-max(x,X))
            dy = max(0, min(y+h,Y+H)-max(y,Y))
            if dx > 0 and dy > 0:
                ids = sorted([a,b])
                errors.add('overlap:' + '/'.join(ids))
                overlaps.append({'ids':ids, 'area':dx*dy})
    overlaps.sort(key=lambda item:(item['ids'], item['area']))
    return {'legal':not errors, 'errors':sorted(errors), 'overlaps':overlaps}
`;
const tests=[
['all five with shared edges',`${call(base)} == {'legal': True, 'errors': [], 'overlaps': []}`],
['positive overlap illegal',`${call(base.slice(0,-1)+', ["F",0,0,1,1]]')}['legal'] is False`],
['missing is not a count check',`'missing:B' in ${call(`${base}[:1]+${base}[2:]`)}['errors']`],
['duplicate and missing together',`'duplicate:A' in ${call(`[['A',0,0,3,2],['A',3,0,2,3]]+${base}[2:]`)}['errors'] and 'missing:B' in ${call(`[['A',0,0,3,2],['A',3,0,2,3]]+${base}[2:]`)}['errors']`],
['unknown name',`'unknown:F' in ${call(`${base} + [['F',8,6,1,1]]`)}['errors']`],
['right boundary',`'outside:E' in ${call(`${base}[:-1]+[['E',9,0,2,2]]`)}['errors']`],
['top boundary',`'outside:E' in ${call(`${base}[:-1]+[['E',7,7,2,2]]`)}['errors']`],
['negative origin',`'outside:A' in ${call(`[['A',-1,0,3,2]]+${base}[1:]`)}['errors']`],
['hard module rotation disallowed',`'shape:A' in ${call(`[['A',0,0,2,3]]+${base}[1:]`)}['errors']`],
['zero height',`'number:A' in ${call(`[['A',0,0,3,0]]+${base}[1:]`)}['errors']`],
['negative dimensions',`'number:A' in ${call(`[['A',0,0,-3,-2]]+${base}[1:]`)}['errors']`],
['nan coordinates',`'number:A' in ${call(`[['A',float('nan'),0,3,2]]+${base}[1:]`)}['errors']`],
['infinite coordinates',`'number:A' in ${call(`[['A',0,float('inf'),3,2]]+${base}[1:]`)}['errors']`],
['booleans are not coordinates',`'number:A' in ${call(`[['A',False,0,3,2]]+${base}[1:]`)}['errors']`],
['not only the first pair',`'overlap:C/E' in ${call(`${base}[:-1]+[['E',6,0,2,2]]`)}['errors']`],
['report actual intersection area',`any(p['ids']==['C','E'] and p['area']==2 for p in ${call(`${base}[:-1]+[['E',6,0,2,2]]`)}['overlaps'])`],
['multiple conflicts',`all(e in ${call(`${base}[:3]+[['D',2,1,3,1],['E',9,1,2,2]]`)}['errors'] for e in ['overlap:A/D','overlap:B/D','outside:E'])`],
['cross without contained corners',`validate_layout([['P',3,1,2,6],['Q',1,3,6,2]],(8,8),{'P':(2,6),'Q':(6,2)})['overlaps']==[{'ids':['P','Q'],'area':4}]`],
['full containment overlap',`validate_layout([['P',0,0,5,5],['Q',1,1,1,1]],(8,8),{'P':(5,5),'Q':(1,1)})['legal'] is False`],
['corner contact allowed',`validate_layout([['P',0,0,2,2],['Q',2,2,2,2]],(4,4),{'P':(2,2),'Q':(2,2)})['legal'] is True`],
['x projection alone insufficient',`validate_layout([['P',0,0,3,1],['Q',1,2,3,1]],(5,4),{'P':(3,1),'Q':(3,1)})['legal'] is True`],
['new outline is respected',`'outside:E' in validate_layout(${base},(8,8),${catalog})['errors']`],
['catalog does not assume five modules',`validate_layout([['P',0,0,1,1],['Q',1,0,1,1],['R',2,0,1,1]],(3,1),{'P':(1,1),'Q':(1,1),'R':(1,1)})['legal'] is True`],
['six modules are supported',`validate_layout(${base} + [['F',0,5,1,1]],(10,8),dict(${catalog},F=(1,1)))['legal'] is True`],
['order does not change report',`${call(`${base}[::-1]`)} == ${call(base)}`],
['input remains unchanged',`(lambda rows: (lambda before: (validate_layout(rows,(10,8),${catalog}), rows==before)[1])([r[:] for r in rows]))(${base})`],
['decimal edge contact',`validate_layout([['P',0.5,0,1,1],['Q',1.5,0,1,1]],(3,2),{'P':(1,1),'Q':(1,1)})['legal'] is True`],
['errors sorted with strict illegal flag',`(lambda r: r['legal'] is False and r['errors']==sorted(set(r['errors'])))(${call(`${base}[:3]+[['D',2,1,3,1],['E',9,1,2,2]]`)})`]
];
export const PYTHON02={name:'validate_layout',version:'validate-v1',prompt:bi('实现完整布局检查器 validate_layout(rows, outline, catalog)。rows每项为(id,x,y,w,h)，outline为(宽,高)，catalog把名称映射到固定(宽,高)。返回legal、排序去重errors和带真实交叠面积的overlaps；共边和共角允许，禁止旋转。','Implement a complete hard-module layout validator. Check identity, finite positive dimensions, fixed shapes, containment and every module pair; report all errors and actual intersection areas.'),starter:`import math

def validate_layout(rows, outline, catalog):
    # rows: [(id, x, y, width, height), ...]
    # outline: (width, height); catalog: {id: (width, height)}
    # Return {'legal': bool, 'errors': sorted_unique_codes,
    #         'overlaps': [{'ids': ['A','D'], 'area': number}, ...]}
    # All input row shapes, outline and catalog formats are already parsed.
    # Check actual numeric values, identities and geometry here.
    raise NotImplementedError('Implement the complete layout validator')
`,reference,tests};
