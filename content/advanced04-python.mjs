import{PYTHON02}from'./advanced02-python.mjs';
import{CATALOG02}from'../dist/assets/legality02.mjs';
const bi=(zh,en)=>({zh,en}),CAT=JSON.stringify(CATALOG02),STD="['A','D','H','B','V','C','V','E','V']";
const pqr="{'P':(3,2),'Q':(2,2),'R':(1,2)}";
const implementation=`def decode_postfix(tokens, catalog):
    stack = []      # each item: (node, (w, h)); node carries its size
    seen = set()
    errors = []

    for token in tokens:
        if token in ('H', 'V'):
            if len(stack) < 2:
                errors.append(f'underflow:{token}')
                break
            b = stack.pop()   # popped first -> second region
            a = stack.pop()   # popped second -> first region
            (wa, ha), (wb, hb) = a[1], b[1]
            size = (max(wa, wb), ha + hb) if token == 'H' else (wa + wb, max(ha, hb))
            node = {'op': token, 'left': a[0], 'right': b[0], 'size': size}
            stack.append((node, size))
        else:
            if token not in catalog:
                errors.append(f'unknown:{token}')
                break
            if token in seen:
                errors.append(f'duplicate:{token}')
                break
            seen.add(token)
            w, h = catalog[token]
            stack.append(({'id': token, 'size': (w, h)}, (w, h)))

    if errors:
        return {'ok': False, 'errors': errors, 'tree': None, 'size': None,
                'coords': None, 'rows': []}
    missing = [i for i in catalog if i not in seen]
    if missing:
        return {'ok': False, 'errors': ['missing:' + ','.join(missing)], 'tree': None,
                'size': None, 'coords': None, 'rows': []}
    if len(stack) != 1:
        return {'ok': False, 'errors': [f'leftover:{len(stack)}'], 'tree': None,
                'size': None, 'coords': None, 'rows': []}

    root, root_size = stack[0]
    coords = {}
    def place(node, x, y):
        if 'id' in node:
            coords[node['id']] = (x, y, *node['size'])
            return
        lw, lh = node['left']['size']
        if node['op'] == 'H':
            place(node['left'], x, y)                  # first region below
            place(node['right'], x, y + lh)            # second region above
        else:
            place(node['left'], x, y)                  # first region left
            place(node['right'], x + lw, y)            # second region right

    place(root, 0, 0)
    rows = [[i, *coords[i]] for i in sorted(coords)]
    return {'ok': True, 'errors': [], 'tree': root, 'size': root_size,
            'coords': coords, 'rows': rows}
`;
const helper=`def combine(a, b, op):
    if op == 'H': return (max(a[0], b[0]), a[1] + b[1])
    if op == 'V': return (a[0] + b[0], max(a[1], b[1]))
    raise ValueError('Unknown operator')
`;
const tests=[
['standard expression decodes to 9x3',`decode_postfix(${STD},${CAT})['size']==(9,3)`],
['standard coordinates match the taught layout',`decode_postfix(${STD},${CAT})['coords']['A']==(0,0,3,2) and decode_postfix(${STD},${CAT})['coords']['D']==(0,2,3,1) and decode_postfix(${STD},${CAT})['coords']['B']==(3,0,2,3) and decode_postfix(${STD},${CAT})['coords']['C']==(5,0,2,2) and decode_postfix(${STD},${CAT})['coords']['E']==(7,0,2,2)`],
['rows are complete, sorted and checkable',`(lambda r: len(r['rows'])==5 and [row[0] for row in r['rows']]==['A','B','C','D','E'] and validate_layout(r['rows'],(10,8),${CAT})['legal'] is True)(decode_postfix(${STD},${CAT}))`],
['tree root and second child',`(lambda r: r['tree']['op']=='V' and r['tree']['right']['id']=='E' and r['tree']['left']['right']['id']=='C' and r['tree']['left']['left']['op']=='V' and r['tree']['left']['left']['left']['op']=='H' and r['tree']['left']['left']['left']['size']==(3,3))(decode_postfix(${STD},${CAT}))`],
['popped-first is the second child',`decode_postfix(['A','D','H'],{'A':(3,2),'D':(3,1)})['coords']['D']==(0,2,3,1)`],
['operand swap keeps size but moves coordinates',`decode_postfix(['D','A','H','B','V','C','V','E','V'],${CAT})['size']==(9,3) and decode_postfix(['D','A','H','B','V','C','V','E','V'],${CAT})['coords']['A']==(0,1,3,2) and decode_postfix(['D','A','H','B','V','C','V','E','V'],${CAT})['coords']['D']==(0,0,3,1)`],
['first H changed to V overflows to width 12',`(lambda r: r['ok'] is True and r['size']==(12,3) and validate_layout(r['rows'],(10,8),${CAT})['legal'] is False)(decode_postfix(['A','D','V','B','V','C','V','E','V'],${CAT}))`],
['overflow row keeps decode-internal consistency',`(lambda r: r['coords']['E']==(10,0,2,2) and r['coords']['B']==(6,0,2,3))(decode_postfix(['A','D','V','B','V','C','V','E','V'],${CAT}))`],
['underflow is reported while reading',`decode_postfix(['A','H'],${CAT})['ok'] is False and 'underflow:H' in decode_postfix(['A','H'],${CAT})['errors']`],
['underflow keeps partial events but no result',`decode_postfix(['A','H'],${CAT})['coords'] is None and decode_postfix(['A','H'],${CAT})['rows']==[]`],
['leftover regions are reported',`'leftover:2' in decode_postfix(['A','D','H','B','V','C','V','E'],${CAT})['errors']`],
['leftover regions with a complete set',`'leftover:5' in decode_postfix(['A','B','C','D','E'],${CAT})['errors']`],
['duplicate module is rejected',`'duplicate:A' in decode_postfix(['A','A','H'],${CAT})['errors']`],
['unknown module is rejected',`'unknown:F' in decode_postfix(['A','F','H'],${CAT})['errors']`],
['missing module is rejected',`'missing:E' in decode_postfix(['A','D','H','B','V','C','V'],${CAT})['errors']`],
['small catalog single leaf decodes',`decode_postfix(['A'],{'A':(3,2)})['ok'] is True and decode_postfix(['A'],{'A':(3,2)})['size']==(3,2)`],
['different catalog decodes independently',`(lambda r: r['ok'] is True and r['size']==(4,4) and r['coords']['Q']==(0,2,2,2) and r['coords']['R']==(3,0,1,2))(decode_postfix(['P','Q','H','R','V'],${pqr}))`],
['decimal catalog keeps precision',`(lambda r: r['ok'] is True and r['coords']['Q']==(1.5,0,1,2) and r['size']==(2.5,2))(decode_postfix(['P','Q','V'],{'P':(1.5,2),'Q':(1,2)}))`],
['stacked region lifts the upper child',`(lambda r: r['size']==(3,5) and r['coords']['E']==(0,3,2,2) and r['coords']['A']==(0,0,3,2) and r['coords']['D']==(0,2,3,1))(decode_postfix(['A','D','H','E','H'],{'A':(3,2),'D':(3,1),'E':(2,2)}))`],
['B below A stacks heights in the other order',`decode_postfix(['B','A','H'],{'A':(3,2),'B':(2,3)})['size']==(3,5) and decode_postfix(['B','A','H'],{'A':(3,2),'B':(2,3)})['coords']['A']==(0,3,3,2)`],
['V children add widths in order',`(lambda r: r['coords']['P']==(0,0,3,2) and r['coords']['Q']==(3,0,2,2) and r['coords']['R']==(5,0,1,2))(decode_postfix(['P','Q','V','R','V'],${pqr}))`],
['H children take the max width',`(lambda r: r['size']==(3,4) and r['coords']['P']==(0,0,3,2) and r['coords']['R']==(0,2,1,2))(decode_postfix(['P','R','H'],{'P':(3,2),'R':(1,2)}))`],
['combined rows always pass Lab2 when inside outline',`validate_layout(decode_postfix(['A','D','H','B','V','C','V','E','V'],${CAT})['rows'],(10,8),${CAT})['errors']==[]`],
['token list is not mutated',`(lambda t: (decode_postfix(t,${CAT}), t==['A','D','H'])[1])(['A','D','H'])`],
['structure and geometry are separate questions',`(lambda r: r['ok'] is True and validate_layout(r['rows'],(8,8),${CAT})['legal'] is False)(decode_postfix(${STD},${CAT}))`],
['empty token list is an error, not a layout',`decode_postfix([],${CAT})['ok'] is False and decode_postfix([],${CAT})['errors']`],
['every coordinate clears its region bounds',`(lambda r: all(0<=v[0] and v[0]+v[2]<=r['size'][0]+1e-9 and 0<=v[1] and v[1]+v[3]<=r['size'][1]+1e-9 for v in r['coords'].values()))(decode_postfix(${STD},${CAT}))`]
];
export const PYTHON04={name:'decode_postfix',version:'slicing-v1',
 prompt:bi('实现完整解码器 decode_postfix(tokens, catalog)：解析后缀表达式，生成切片树，自下而上算尺寸、自上而下算坐标；返回树、尺寸、坐标与可读错误。已提供 combine 与 Lab2 的 validate_layout 作辅助。约定：H 的第一区域在下、第二区域在上；V 的第一区域在左、第二区域在右；先弹出的是第二区域。错误码：underflow:X、leftover:N、unknown:X、duplicate:X、missing:清单。','Implement the full decoder decode_postfix(tokens, catalog): parse the postfix expression, build the slicing tree, aggregate sizes bottom-up and propagate coordinates top-down. Helpers combine and the Lab2 validate_layout are provided. Convention: H places the first region below the second; V places the first left of the second; the first pop is the second region. Error codes: underflow:X, leftover:N, unknown:X, duplicate:X, missing:list.'),
 starter:helper+`

def decode_postfix(tokens, catalog):
    # Phase 1 (reading): push leaves; on H/V pop two regions and push the combined
    #   node with its size (max/add rule). Check: at least two regions, unknown,
    #   duplicate. Phase 2 (after reading): every catalog id seen exactly once and
    #   exactly one region left, then propagate coordinates from the root (0,0).
    # Return {'ok':bool,'errors':[...],'tree':node,'size':(w,h),'coords':{id:(x,y,w,h)},'rows':[[id,x,y,w,h],...]}
    raise NotImplementedError('Implement the complete postfix decoder')

# Provided helpers: combine above and the Lab2 checker below.
`+PYTHON02.reference,
 reference:PYTHON02.reference+'\n'+helper+'\n'+implementation,tests};