import{PYTHON02}from'./advanced02-python.mjs';
import{CATALOG02}from'../dist/assets/legality02.mjs';
const bi=(zh,en)=>({zh,en});
const CAT=JSON.stringify(CATALOG02);
const G="('A',('B',('C',('E',None,None),None),None),('D',None,None))";
const LIFT="('C',('B',('A',('E',None,None),None),None),('D',None,None))";
const RES="('A',('D',None,('C',('B',('E',None,None),None),None)),None)";
const EDIT="('A',('B',('C',('E',None,None),('D',None,None)),None),None)";
const implementation=`def pack_bstar(tree, modules):
    # Normalize: a bare string counts as a leaf node.
    def node_id(n):
        return n if isinstance(n, str) else n[0]
    def child(n, i):
        return None if isinstance(n, str) else n[i]
    seen = set()
    order = []
    def collect(n):
        if n is None: return
        nid = node_id(n)
        if nid in seen:
            raise ValueError(f'duplicate:{nid}')
        if nid not in modules:
            raise ValueError(f'unknown:{nid}')
        seen.add(nid); order.append(nid)
        collect(child(n, 1)); collect(child(n, 2))
    try:
        collect(tree)
    except ValueError as e:
        return {'ok': False, 'errors': [str(e)], 'order': [], 'coords': None,
                'rows': [], 'contour': None, 'trace': []}
    missing = [i for i in modules if i not in seen]
    if missing:
        return {'ok': False, 'errors': ['missing:' + ','.join(missing)], 'order': [],
                'coords': None, 'rows': [], 'contour': None, 'trace': []}

    contour = []          # (x1, x2, height), sorted by x1, equal neighbours merged
    coords = {}
    trace = []

    def place(nid, x, parent_top):
        w, h = modules[nid]
        # Query the WHOLE footprint [x, x+w); the max is the landing height.
        y = max([0] + [seg_h for (x1, x2, seg_h) in contour if x2 > x and x1 < x + w])
        coords[nid] = (x, y, w, h)
        kept = []
        for (x1, x2, seg_h) in contour:
            if x2 <= x or x1 >= x + w:
                kept.append((x1, x2, seg_h)); continue
            if x1 < x: kept.append((x1, x, seg_h))          # keep left residual
            if x2 > x + w: kept.append((x + w, x2, seg_h))  # keep right residual
        kept.append((x, x + w, y + h))
        kept.sort()
        merged = []
        for seg in kept:
            if merged and merged[-1][1] == seg[0] and merged[-1][2] == seg[2]:
                merged[-1] = (merged[-1][0], seg[1], seg[2])  # merge equal neighbours
            else:
                merged.append(seg)
        contour[:] = merged
        trace.append({'id': nid, 'x': x, 'y': y, 'parent_top': parent_top,
                      'contour': list(contour)})

    def walk(n, x, parent_top):
        if n is None: return
        nid = node_id(n)
        place(nid, x, parent_top)
        pw, ph = modules[nid]
        walk(child(n, 1), x + pw, coords[nid][1] + ph)   # left child: parent's right edge
        walk(child(n, 2), x, coords[nid][1] + ph)        # right child: parent's x

    walk(tree, 0, 0)
    rows = [[i, *coords[i]] for i in sorted(coords)]
    return {'ok': True, 'errors': [], 'order': order, 'coords': coords, 'rows': rows,
            'contour': list(contour), 'trace': trace}
`;
const tests=[
['golden tree walks in preorder',`pack_bstar(${G},${CAT})['order']==['A','B','C','E','D']`],
['golden coordinates match the taught layout',`(lambda r: r['coords']['A']==(0,0,3,2) and r['coords']['B']==(3,0,2,3) and r['coords']['C']==(5,0,2,2) and r['coords']['E']==(7,0,2,2) and r['coords']['D']==(0,2,3,1))(pack_bstar(${G},${CAT}))`],
['golden rows pass the Lab2 checker',`validate_layout(pack_bstar(${G},${CAT})['rows'],(10,8),${CAT})['legal'] is True`],
['final contour merges equal neighbours',`pack_bstar(${G},${CAT})['contour']==[(0,5,3),(5,9,2)]`],
['D rests on the highest segment under its footprint',`pack_bstar(${G},${CAT})['trace'][4]['y']==2 and pack_bstar(${G},${CAT})['trace'][4]['contour']==[(0,5,3),(5,9,2)]`],
['left child starts at the parent right edge',`pack_bstar(${G},${CAT})['coords']['B'][0]==pack_bstar(${G},${CAT})['coords']['A'][0]+3`],
['right child shares the parent x',`pack_bstar(${G},${CAT})['coords']['D'][0]==pack_bstar(${G},${CAT})['coords']['A'][0] and pack_bstar(${LIFT},${CAT})['coords']['D'][0]==pack_bstar(${LIFT},${CAT})['coords']['C'][0]`],
['right child is not always on the parent top',`pack_bstar(${LIFT},${CAT})['coords']['D'][1]==3 and pack_bstar(${LIFT},${CAT})['trace'][4]['parent_top']==2`],
['lift tree boxes 9x4',`(lambda r: r['coords']['C']==(0,0,2,2) and r['coords']['B']==(2,0,2,3) and r['coords']['A']==(4,0,3,2) and validate_layout(r['rows'],(10,8),${CAT})['legal'] is True)(pack_bstar(${LIFT},${CAT}))`],
['residual segment lifts the next block',`pack_bstar(${RES},${CAT})['coords']['B']==(5,1,2,3) and pack_bstar(${RES},${CAT})['coords']['C']==(3,1,2,2)`],
['residual tree stays legal and keeps D segment',`(lambda r: validate_layout(r['rows'],(10,8),${CAT})['legal'] is True and (5,6,1) not in r['contour'] and (0,3,2) in r['contour'])(pack_bstar(${RES},${CAT}))`],
['moving D to the right child of C',`(lambda r: r['coords']['D']==(5,2,3,1) and r['order']==['A','B','C','E','D'])(pack_bstar(${EDIT},${CAT}))`],
['edit tree keeps bbox 27',`(lambda r: validate_layout(r['rows'],(10,8),${CAT})['legal'] is True and max(x+w for i,x,y,w,h in r['rows'])*max(y+h for i,x,y,w,h in r['rows'])==27)(pack_bstar(${EDIT},${CAT}))`],
['bare string leaf is accepted',`pack_bstar('P',{'P':(3,2)})['ok'] is True and pack_bstar('P',{'P':(3,2)})['coords']['P']==(0,0,3,2)`],
['lift rows reflect the swapped names',`pack_bstar(${LIFT},${CAT})['rows']==[['A',4,0,3,2],['B',2,0,2,3],['C',0,0,2,2],['D',0,3,3,1],['E',7,0,2,2]]`],
['unknown module is rejected before packing',`'unknown:F' in pack_bstar(('F',None,None),${CAT})['errors']`],
['duplicate module is rejected',`'duplicate:A' in pack_bstar(('A',('A',None,None),None),${CAT})['errors']`],
['missing module is rejected',`pack_bstar(('A',None,None),${CAT})['errors'][0].startswith('missing:')`],
['wrong shape tree is rejected as unknown',`pack_bstar((42,None,None),${CAT})['ok'] is False`],
['trace has one entry per placement with contour snapshots',`(lambda r: len(r['trace'])==5 and r['trace'][0]['contour']==[(0,3,2)] and r['trace'][-1]['contour']==r['contour'])(pack_bstar(${G},${CAT}))`],
['bad tree decodes legally to 10x4',`(lambda r: r['coords']['E']==(0,2,2,2) and validate_layout(r['rows'],(10,8),${CAT})['legal'] is True)(pack_bstar(('A',('B',('C',('D',None,None),None),None),('E',None,None)),${CAT}))`],
['decimal modules keep precision',`pack_bstar(('P',None,None),{'P':(1.5,2)})['coords']['P']==(0,0,1.5,2)`],
['input tree is not mutated',`(lambda t: (pack_bstar(t,${CAT}), t==('A',('B',('C',('E',None,None),None),None),('D',None,None)))[1])((('A'),('B'),('C'),('E'),('D')) if False else ('A',('B',('C',('E',None,None),None),None),('D',None,None)))`],
['every placement is non-overlapping by construction',`(lambda r: all(0<=v[0] and v[0]+v[2]<=10 for v in r['coords'].values()))(pack_bstar(${G},${CAT}))`],
['tree legality does not mean outline fit',`(lambda r: r['ok'] is True and validate_layout(r['rows'],(8,8),${CAT})['legal'] is False)(pack_bstar(${G},${CAT}))`]
];
export const PYTHON05={name:'pack_bstar',version:'bstar-v1',
 prompt:bi('实现完整打包器 pack_bstar(tree, modules)：先序遍历树，左孩子从父块右边缘开始、右孩子与父块同 x；每个模块落到整个覆盖区间 [x,x+w) 下最高的轮廓线上。放块后拆分旧区间、保留两侧残段、合并相邻等高段。返回 order/coords/rows/contour/trace。错误码：unknown:X、duplicate:X、missing:清单。tree 是 (id, left, right) 嵌套元组，叶子可写 (id,None,None) 或直接写 id 字符串。','Implement the full packer pack_bstar(tree, modules): preorder walk, left child at the parent right edge, right child at the parent x; each block lands on the highest skyline under its whole footprint [x,x+w). Split old segments, keep residuals, merge equal neighbours. Return order/coords/rows/contour/trace. Error codes: unknown:X, duplicate:X, missing:list. tree is nested (id,left,right) tuples; leaves may be (id,None,None) or the bare id string.'),
 starter:`def pack_bstar(tree, modules):
    # Phase 1: walk the tree (preorder), reject unknown/duplicate/missing ids.
    # Phase 2: place each node: query the highest segment under [x, x+w),
    #   split old segments keeping residuals, merge equal neighbours.
    # Return {'ok','errors','order','coords','rows','contour','trace'}
    # coords: {id: (x, y, w, h)}; rows: [[id,x,y,w,h],...] sorted by id.
    raise NotImplementedError('Implement the complete B*-tree packer')

# Provided Lab2 checker below; use it to cross-check decoded rows.
`+PYTHON02.reference,
 reference:PYTHON02.reference+'\n'+implementation,tests};