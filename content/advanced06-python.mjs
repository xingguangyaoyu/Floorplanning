import{PYTHON02}from'./advanced02-python.mjs';
import{CATALOG02}from'../dist/assets/legality02.mjs';
const bi=(zh,en)=>({zh,en});
const CAT=JSON.stringify(CATALOG02);
const STD="('ABCED','DABCE')";
const implementation=`def decode_sequence_pair(pos, neg, modules):
    # Validate both permutations up front.
    ids = list(modules)
    for label, seq in (('pos', pos), ('neg', neg)):
        if sorted(seq) != sorted(ids) or len(set(seq)) != len(seq):
            return {'ok': False, 'errors': [f'permutation:{label}'], 'graph': None,
                    'order': [], 'coords': None, 'rows': [], 'key': None}

    # 1) Classify every ordered pair exactly once.
    H, V = [], []
    for i in range(len(pos)):
        for j in range(i + 1, len(pos)):
            a, b = pos[i], pos[j]
            if neg.index(a) < neg.index(b):
                H.append((a, b))      # same order -> horizontal, a left of b
            else:
                V.append((a, b))      # reversed -> vertical, a below b

    # 2) pos is a topological order for both graphs: walk it once.
    coords, key = {}, {}
    for nid in pos:                    # pos is a topological order
        w, h = modules[nid]
        hx = [((coords[p][0] + modules[p][0]), p) for (p, q) in H if q == nid]
        hy = [((coords[p][1] + modules[p][1]), p) for (p, q) in V if q == nid]
        x = max([0] + [v for v, _ in hx])   # satisfy EVERY lower bound: max
        y = max([0] + [v for v, _ in hy])
        coords[nid] = (x, y, w, h)
        key[nid] = {'x': max(hx)[1] if hx else None, 'y': max(hy)[1] if hy else None}

    rows = [[i, *coords[i]] for i in sorted(coords)]
    return {'ok': True, 'errors': [], 'graph': {'H': H, 'V': V}, 'order': list(pos),
            'coords': coords, 'rows': rows, 'key': key}
`;
const tests=[
['standard encoding decodes legally',`decode_sequence_pair(*${STD},${CAT})['ok'] is True and validate_layout(decode_sequence_pair(*${STD},${CAT})['rows'],(10,8),${CAT})['legal'] is True`],
['standard coordinates',`(lambda r: r['coords']['A']==(0,0,3,2) and r['coords']['B']==(3,0,2,3) and r['coords']['C']==(5,0,2,2) and r['coords']['E']==(7,0,2,2) and r['coords']['D']==(0,3,3,1))(decode_sequence_pair(*${STD},${CAT}))`],
['ten pairs classified once',`(lambda r: len(r['graph']['H'])+len(r['graph']['V'])==10 and r['graph']['H']==[('A','B'),('A','C'),('A','E'),('B','C'),('B','E'),('C','E')])(decode_sequence_pair(*${STD},${CAT}))`],
['pos itself is the topological order',`decode_sequence_pair(*${STD},${CAT})['order']==list('ABCED')`],
['D has four vertical predecessors',`(lambda r: r['graph']['V']==[('A','D'),('B','D'),('C','D'),('E','D')])(decode_sequence_pair(*${STD},${CAT}))`],
['B is the key vertical predecessor of D',`decode_sequence_pair(*${STD},${CAT})['key']['D']['y']=='B'`],
['C has no vertical predecessor',`decode_sequence_pair(*${STD},${CAT})['key']['C']['y'] is None`],
['max not sum for coordinates',`decode_sequence_pair(*${STD},${CAT})['coords']['D'][1]==3`],
['row encoding overflows to width 12',`(lambda r: r['coords']['E']==(10,0,2,2) and max(x+w for i,x,y,w,h in r['rows'])==12)(decode_sequence_pair('ABCDE','ABCDE',${CAT}))`],
['row encoding is not a legal layout',`validate_layout(decode_sequence_pair('ABCDE','ABCDE',${CAT})['rows'],(10,8),${CAT})['legal'] is False`],
['bad permutation is rejected',`decode_sequence_pair('ABCED','DABCE','DABCE') if False else decode_sequence_pair('ABCED','DABC',${CAT})['ok'] is False and 'permutation:neg' in decode_sequence_pair('ABCED','DABC',${CAT})['errors'][0]`],
['duplicate in a row is rejected',`decode_sequence_pair('ABCED','DABCC',${CAT})['ok'] is False`],
['unknown module is rejected',`decode_sequence_pair('ABCED','DABCF',${CAT})['ok'] is False`],
['multi-encoding: two encodings agree exactly',`(lambda a,b: a['coords']==b['coords'] and a['coords']['C']==(3,3,2,2) and a['coords']['E']==(5,3,2,2))(decode_sequence_pair('ABDCE','DACEB',${CAT}), decode_sequence_pair('ABDCE','DCAEB',${CAT}))`],
['multi-encoding layout is legal',`validate_layout(decode_sequence_pair('ABDCE','DACEB',${CAT})['rows'],(10,8),${CAT})['legal'] is True`],
['key x predecessor of C in the multi encoding',`decode_sequence_pair('ABDCE','DACEB',${CAT})['key']['C']['x'] in ('A','D')`],
['horizontal bounds bind x and vertical bounds bind y',`(lambda r, mc: all(r['coords'][q][0]>=r['coords'][p][0]+mc[p][0] for (p,q) in r['graph']['H']) and all(r['coords'][q][1]>=r['coords'][p][1]+mc[p][1] for (p,q) in r['graph']['V']))(decode_sequence_pair(*${STD},${CAT}), ${CAT})`],
['coords are minimal: dropping below any key bound breaks a constraint',`(lambda r: r['coords']['D'][1]==max(r['coords'][p][1]+${CAT}[p][1] for (p,q) in r['graph']['V'] if q=='D'))(decode_sequence_pair(*${STD},${CAT}))`],
['decimal modules keep precision',`decode_sequence_pair('PQ','PQ',{'P':(1.5,2),'Q':(1,2)})['coords']['Q']==(1.5,0,1,2)`],
['inputs are not mutated',`(lambda p,n: (decode_sequence_pair(p,n,${CAT}), ''.join(p)=='ABCED' and ''.join(n)=='DABCE')[1])(list('ABCED'),list('DABCE'))`],
['two-module catalog works independently',`decode_sequence_pair('PQ','PQ',{'P':(3,2),'Q':(1,2)})['coords']['Q']==(3,0,1,2)`],
['vertical constraint lifts the later module',`decode_sequence_pair('PQ','QP',{'P':(3,2),'Q':(1,2)})['coords']['Q']==(0,2,1,2)`],
['graph is acyclic by construction: edges follow pos order',`(lambda r: all(r['order'].index(a)<r['order'].index(b) for (a,b) in r['graph']['H']+r['graph']['V']))(decode_sequence_pair(*${STD},${CAT}))`],
['rows are sorted and complete',`(lambda r: [row[0] for row in r['rows']]==['A','B','C','D','E'])(decode_sequence_pair(*${STD},${CAT}))`]
];
export const PYTHON06={name:'decode_sequence_pair',version:'sp-v1',
 prompt:bi('实现完整解码器 decode_sequence_pair(pos, neg, modules)：校验两行排列，把全部有序对分类成水平/竖直约束（同序→水平，反序→竖直），按拓扑序（pos 本身）对每个模块取所有前驱下界的最大值，返回图、顺序、坐标、关键前驱与rows。边权用前驱的尺寸。错误码：permutation:pos / permutation:neg。','Implement the full decoder decode_sequence_pair(pos, neg, modules): validate both permutations, classify every ordered pair (same order -> horizontal, reversed -> vertical), then walk pos as a topological order taking the maximum of all predecessor bounds. Edge weight is the predecessor size. Return graph, order, coords, key predecessors and rows. Error code: permutation:pos / permutation:neg.'),
 starter:`def decode_sequence_pair(pos, neg, modules):
    # 1) Validate both permutations (same multiset as modules, no duplicates).
    # 2) Classify every ordered pair (i before j in pos): same order in neg ->
    #    horizontal edge (a,b); reversed -> vertical edge (a,b).
    # 3) Walk pos as a topological order; x = max over horizontal predecessors
    #    of (x_p + w_p), y likewise with heights. Edge weight = predecessor size.
    # Return {'ok','errors','graph':{'H':[...] ,'V':[...]},'order','coords','rows','key'}
    # coords: {id:(x,y,w,h)}; key: {id:{'x':argmaxId,'y':argmaxId}}.
    raise NotImplementedError('Implement the complete sequence-pair decoder')

# Provided Lab2 checker below; use it to cross-check decoded rows.
`+PYTHON02.reference,
 reference:PYTHON02.reference+'\n'+implementation,tests};