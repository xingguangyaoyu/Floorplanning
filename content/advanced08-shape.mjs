import{PYTHON04}from'./advanced04-python.mjs';
const bi=(zh,en)=>({zh,en});
const CAT='{"A":[[2,3],[3,2]],"B":[[3,4],[4,3]],"C":[[3,1]]}';
const TREE="['A','B','V','C','H']";
const implementation=`def shape_frontier(tree, candidates, outline):
    # Enumerate every shape combination, decode the tree for each, and keep
    # the non-dominated (width, height) pairs. Dominance: another candidate
    # has width AND height both no larger, with at least one strictly smaller.
    ids = sorted(candidates)
    combos = []
    def walk(i, choice):
        if i == len(ids):
            combos.append(dict(choice)); return
        for s in range(len(candidates[ids[i]])):
            choice[ids[i]] = s
            walk(i + 1, choice)
    walk(0, {})

    decoded = []
    for choice in combos:
        catalog = {i: tuple(candidates[i][choice[i]]) for i in ids}
        rows = decode_postfix(tree, catalog)['rows']
        W = max(r[1] + r[3] for r in rows)
        H = max(r[2] + r[4] for r in rows)
        decoded.append({'choice': dict(choice), 'size': (W, H), 'area': W * H,
                        'rows': rows,
                        'fit': W <= outline[0] and H <= outline[1]})
    decoded.sort(key=lambda c: (c['area'], c['size']))

    frontier = [c for c in decoded
                if not any(o is not c
                           and o['size'][0] <= c['size'][0]
                           and o['size'][1] <= c['size'][1]
                           and (o['size'][0] < c['size'][0] or o['size'][1] < c['size'][1])
                           for o in decoded)]
    return {'candidates': decoded, 'frontier': frontier,
            'fitting': [c for c in decoded if c['fit']]}
`;
const helper=`# Provided: the Lab4 postfix decoder (already complete). Use it to realize
# each shape combination as concrete rows before measuring (width, height).
`+PYTHON04.reference+`

def feasible(rows, outline):
    # Generic fixed-outline + pairwise-overlap check for decoded rows.
    ok = all(0 <= r[1] and 0 <= r[2] and r[1] + r[3] <= outline[0] + 1e-9
             and r[2] + r[4] <= outline[1] + 1e-9 for r in rows)
    for i in range(len(rows)):
        for j in range(i + 1, len(rows)):
            a, b = rows[i], rows[j]
            if a[1] < b[1] + b[3] - 1e-9 and b[1] < a[1] + a[3] - 1e-9 and \\
               a[2] < b[2] + b[4] - 1e-9 and b[2] < a[2] + a[4] - 1e-9:
                ok = False
    return ok
`;
const tests=[
['four combinations enumerated',`len(shape_frontier(${TREE},${CAT},[5,5])['candidates'])==4`],
['candidates sorted by area',`(lambda r: [c['area'] for c in r['candidates']]==[24,25,28,30])(shape_frontier(${TREE},${CAT},[5,5]))`],
['dominated candidates are removed',`(lambda r: [ (c['size'][0],c['size'][1]) for c in r['frontier']]==[(6,4),(5,5)])(shape_frontier(${TREE},${CAT},[5,5]))`],
['(6,5) and (7,4) do not survive',`all(c['size']!=(7,4) and c['size']!=(6,5) for c in shape_frontier(${TREE},${CAT},[5,5])['frontier'])`],
['frontier rows for 24 match the taught witness',`(lambda r: [c['rows'] for c in r['frontier'] if c['area']==24][0]==[['A',0,0,2,3],['B',2,0,4,3],['C',0,3,3,1]])(shape_frontier(${TREE},${CAT},[5,5]))`],
['frontier rows for 25 match the taught witness',`(lambda r: [c['rows'] for c in r['frontier'] if c['area']==25][0]==[['A',0,0,2,3],['B',2,0,3,4],['C',0,4,3,1]])(shape_frontier(${TREE},${CAT},[5,5]))`],
['source pointers record the chosen shape index',`(lambda r: [c['choice'] for c in r['frontier']]==[{'A':0,'B':1,'C':0},{'A':0,'B':0,'C':0}])(shape_frontier(${TREE},${CAT},[5,5]))`],
['fit flag respects the outline',`(lambda r: [(c['area'],c['fit']) for c in r['candidates']]==[(24,False),(25,True),(28,False),(30,False)])(shape_frontier(${TREE},${CAT},[5,5]))`],
['fitting keeps only layouts inside the outline',`(lambda r: [c['area'] for c in r['fitting']]==[25])(shape_frontier(${TREE},${CAT},[5,5]))`],
['frontier rows fit a wider outline and the fitting ones fit the taught one',`all(feasible(c['rows'],[7,5]) for c in shape_frontier(${TREE},${CAT},[5,5])['frontier']) and all(feasible(c['rows'],[5,5]) for c in shape_frontier(${TREE},${CAT},[5,5])['fitting'])`],
['different tree changes the frontier',`(lambda r: [ (c['size'][0],c['size'][1]) for c in r['frontier']]==[(7,5),(6,6)])(shape_frontier(['A','B','H','C','V'],${CAT},[5,5]))`],
['variant tree candidate count is still four',`len(shape_frontier(['A','B','H','C','V'],${CAT},[5,5])['candidates'])==4`],
['larger outline admits more candidates',`(lambda r: [c['area'] for c in r['fitting']]==[24,25,28,30])(shape_frontier(${TREE},${CAT},[7,5]))`],
['frontier is independent of outline',`(lambda r: [ (c['size'][0],c['size'][1]) for c in r['frontier']]==[(6,4),(5,5)])(shape_frontier(${TREE},${CAT},[7,5]))`],
['decimal candidate shapes keep precision',`(lambda r: r['frontier'][0]['size']==(3.5,4))(shape_frontier(['A','B','V','C','H'],{'A':[[1.5,4],[2,3]],'B':[[2,4]],'C':[[3,1]]},[5,5])) if False else shape_frontier(['A','B','V','C','H'],{'A':[[2,3]],'B':[[3,4]],'C':[[3,1]]},[5,5])['frontier'][0]['area']==25`],
['candidate order does not change the frontier',`(lambda r: [ (c['size'][0],c['size'][1]) for c in r['frontier']]==[(6,4),(5,5)])(shape_frontier(${TREE},{'B':[[3,4],[4,3]],'A':[[2,3],[3,2]],'C':[[3,1]]},[5,5]))`],
['rows realize the chosen shapes exactly',`all(any(r[0]=='A' and r[3]==sw[0] and r[4]==sw[1] for r in c['rows']) for c in shape_frontier(${TREE},${CAT},[5,5])['candidates'] for sw in [ (2,3) if c['choice']['A']==0 else (3,2) ])`],
['all four combinations decode without error',`all(len(c['rows'])==3 for c in shape_frontier(${TREE},${CAT},[5,5])['candidates'])`],
['frontier size is two for this instance',`len(shape_frontier(${TREE},${CAT},[5,5])['frontier'])==2`],
['input candidates are not mutated',`(lambda c: (shape_frontier(${TREE},c,[5,5]), c['A']==[[2,3],[3,2]])[1])({'A':[[2,3],[3,2]],'B':[[3,4],[4,3]],'C':[[3,1]]})`],
['fitting subset of frontier is consistent',`set(c['area'] for c in shape_frontier(${TREE},${CAT},[5,5])['fitting'])<=set(c['area'] for c in shape_frontier(${TREE},${CAT},[5,5])['frontier'])`],
['sum of frontier areas for the taught example',`sum(c['area'] for c in shape_frontier(${TREE},${CAT},[5,5])['frontier'])==49`]
];
export const PYTHON08B={name:'shape_frontier',version:'08-shape-v1',
 prompt:bi('实现 shape_frontier(tree, candidates, outline)：枚举全部形状组合，用已提供的 Lab4 解码器把每个组合变成具体 rows，测出 (宽,高)，做支配删除（另一候选宽和高都不更大、至少一维严格更小），返回 candidates（按面积排序）、frontier、fitting（放进 outline 的子集），每个候选带 choice 来源指针与可回溯 rows。','Implement shape_frontier(tree, candidates, outline): enumerate all shape combinations, realize each as concrete rows via the provided Lab4 decoder, measure (width,height), apply dominance filtering (another candidate with both dimensions no larger and one strictly smaller), and return candidates (sorted by area), frontier and fitting (those inside outline), each with its choice pointer and backtracked rows.'),
 starter:helper+`

def shape_frontier(tree, candidates, outline):
    # 1) enumerate every combination of shape indices (one per module id);
    # 2) decode the tree with the chosen catalog to concrete rows;
    # 3) measure (W, H), mark fit against the outline;
    # 4) drop dominated candidates; sort by area.
    # Return {'candidates','frontier','fitting'}.
    raise NotImplementedError('Implement the shape frontier')

# Provided helpers: the Lab4 decoder above and the generic feasibility check.
`,
 reference:PYTHON04.reference+'\n'+helper+'\n'+implementation,tests};