const bi=(zh,en)=>({zh,en});
const reference=`import math

def audit_layout(rows, integer=True, area=6, low=0.5, high=2):
    expected = {'A': (3,2), 'B': (2,3), 'C': (2,2), 'D': (3,1), 'E': (2,2)}
    errors, seen, valid = set(), set(), []
    for name, x, y, w, h in rows:
        if name in seen: errors.add('duplicate:' + name)
        seen.add(name)
        if name not in expected: errors.add('unknown:' + name)
        numbers = (x,y,w,h)
        if not all(isinstance(v,(int,float)) and not isinstance(v,bool) and math.isfinite(v) for v in numbers) or w <= 0 or h <= 0:
            errors.add('number:' + name)
            continue
        valid.append((name,x,y,w,h))
        if integer and not all(float(v).is_integer() for v in numbers): errors.add('grid:' + name)
        if name == 'A':
            if abs(w*h-area) > 1e-8: errors.add('area:A')
            if not low <= w/h <= high: errors.add('aspect:A')
        elif name in expected and (w,h) != expected[name]: errors.add('shape:' + name)
        if x < 0 or y < 0 or x+w > 10+1e-8 or y+h > 8+1e-8: errors.add('outside:' + name)
    for name in expected:
        if name not in seen: errors.add('missing:' + name)
    for i,(a,x,y,w,h) in enumerate(valid):
        for b,X,Y,W,H in valid[i+1:]:
            if x < X+W-1e-9 and X < x+w-1e-9 and y < Y+H-1e-9 and Y < y+h-1e-9:
                errors.add('overlap:' + '/'.join(sorted((a,b))))
    box = None
    if len(valid) == len(rows) and valid:
        box = (max(x+w for _,x,y,w,h in valid)-min(x for _,x,y,w,h in valid)) * (max(y+h for _,x,y,w,h in valid)-min(y for _,x,y,w,h in valid))
    legal = not errors
    return {'legal': legal, 'errors': sorted(errors), 'bbox_area': box,
            'packing_density': (area+17)/box if legal else None,
            'dead_space': box-area-17 if legal else None}
`;
const base="[('A',0,0,3,2),('B',3,0,2,3),('C',5,0,2,2),('D',0,2,3,1),('E',7,0,2,2)]";
const soft="[('A',0,0,2,3),('B',2,0,2,3),('C',4,0,2,2),('D',0,3,3,1),('E',4,2,2,2)]";
const continuous="[('A',0,0,2.5,2.4),('B',3,0,2,3),('C',5,0,2,2),('D',0,3,3,1),('E',7,0,2,2)]";
const tests=[
 ['baseline contact',`audit_layout(${base})['legal'] is True and audit_layout(${base})['errors']==[] and audit_layout(${base})['bbox_area']==27`],
 ['compact witness',`audit_layout(${soft})['legal'] and audit_layout(${soft})['bbox_area']==24`],
 ['packing denominator',`abs(audit_layout(${soft})['packing_density']-23/24)<1e-10 and audit_layout(${soft})['dead_space']==1`],
 ['translated box',`audit_layout([(n,x+2,y+1,w,h) for n,x,y,w,h in ${soft}])['bbox_area']==24`],
 ['all neighbors',`'overlap:A/D' in audit_layout([('A',0,0,2,3)]+${base}[1:])['errors']`],
 ['new conflict',`'overlap:B/D' in audit_layout([('A',0,0,2,3),('B',3,0,2,3),('C',5,0,2,2),('D',2,2,3,1),('E',7,0,2,2)])['errors']`],
 ['invalid scores withheld',`audit_layout([('A',0,0,2,3)]+${base}[1:])['legal'] is False and audit_layout([('A',0,0,2,3)]+${base}[1:])['packing_density'] is None and audit_layout([('A',0,0,2,3)]+${base}[1:])['dead_space'] is None`],
 ['non A/B pair overlap',`audit_layout([('A',0,0,2,3),('B',2,0,2,3),('C',4,0,2,2),('D',0,3,3,1),('E',5.5,1,2,2)],integer=False)['legal'] is False and 'overlap:C/E' in audit_layout([('A',0,0,2,3),('B',2,0,2,3),('C',4,0,2,2),('D',0,3,3,1),('E',5.5,1,2,2)],integer=False)['errors']`],
 ['missing module',`'missing:E' in audit_layout(${base}[:-1])['errors']`],
 ['duplicate module',`'duplicate:A' in audit_layout(${base}+[('A',8,6,3,2)])['errors']`],
 ['unknown module',`'unknown:F' in audit_layout(${base}+[('F',8,6,1,1)])['errors']`],
 ['containment',`'outside:E' in audit_layout(${base}[:-1]+[('E',9,0,2,2)])['errors']`],
 ['area tolerance',`'area:A' in audit_layout([('A',0,0,2,3.01)]+${base}[1:])['errors']`],
 ['negative dimensions',`'number:A' in audit_layout([('A',0,0,-2,-3)]+${base}[1:])['errors']`],
 ['zero height',`'number:A' in audit_layout([('A',0,0,2,0)]+${base}[1:])['errors']`],
 ['nonfinite values',`'number:A' in audit_layout([('A',float('nan'),0,3,2)]+${base}[1:])['errors']`],
 ['no hard rotation',`'shape:B' in audit_layout([${base}[0],('B',3,0,3,2)]+${base}[2:])['errors']`],
 ['continuous allowed',`audit_layout(${continuous},integer=False)['legal']`],
 ['grid rejected',`'grid:A' in audit_layout(${continuous},integer=True)['errors']`],
 ['ratio parameters respected',`'aspect:A' in audit_layout(${base},low=.9,high=1.1)['errors']`],
 ['area-eight endpoint',`audit_layout([('A',0,0,2,4),('B',2,0,2,3),('C',4,0,2,2),('D',0,4,3,1),('E',4,2,2,2)],area=8)['legal']`],
 ['area-eight totals',`audit_layout([('A',0,0,2,4),('B',2,0,2,3),('C',4,0,2,2),('D',0,4,3,1),('E',4,2,2,2)],area=8)['dead_space']==5`]
];
export const PYTHON08={name:'audit_layout',version:'audit-v1',prompt:bi('实现完整布局审计器 audit_layout(rows, integer=True, area=6, low=0.5, high=2)。rows每项为(id,x,y,w,h)。检查名称完整/重复/未知、有限正尺寸、A面积与比例、其它固定尺寸且禁旋转、整数网格、10×8包含及全部模块对的正面积重叠。返回legal、排序errors、bbox_area、packing_density、dead_space；非法布局后两项为None。错误码见下方接口说明，面积容差1e−8。','Implement the complete layout auditor audit_layout(rows, integer=True, area=6, low=0.5, high=2). Each row is (id,x,y,w,h). Check missing, duplicate and unknown names; finite positive dimensions; A\'s area and aspect ratio; the other fixed dimensions with rotation forbidden; the integer grid; containment in 10×8; and positive-area overlap for every module pair. Return legal, sorted errors, bbox_area, packing_density and dead_space. The last two fields must be None for an infeasible layout. Error codes are specified below; the area tolerance is 1e−8.'),starter:`import math

def audit_layout(rows, integer=True, area=6, low=0.5, high=2):
    # rows: [(id, x, y, width, height), ...]
    # errors: sorted strings, e.g. 'missing:E', 'overlap:A/D'.
    # Return {'legal': bool, 'errors': list, 'bbox_area': number_or_None,
    #         'packing_density': number_or_None, 'dead_space': number_or_None}
    # 1. Validate names/numbers and each shape contract.
    # 2. Check containment and every pair (shared edges are allowed).
    # 3. Subtract minima when computing the enclosing box.
    # 4. Only a legal layout has valid density/dead-space scores.
    raise NotImplementedError('Implement the full layout audit')
`,reference,tests};
