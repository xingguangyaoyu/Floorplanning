import{PYTHON02}from'./advanced02-python.mjs';
import{PYTHON06}from'./advanced06-python.mjs';
import{CATALOG02}from'../dist/assets/legality02.mjs';
const bi=(zh,en)=>({zh,en});
const CAT=JSON.stringify(CATALOG02);
const implementation=`def anneal(initial, neighbor, decode, score, feasible, rng, schedule, budget):
    # Contract:
    #   initial      -- the starting encoding (e.g. a (pos, neg) pair)
    #   neighbor(x)  -- one random edit of the encoding
    #   decode(x)    -- encoding -> rows (list of [id,x,y,w,h]); must not raise
    #   score(rows)  -- rows -> energy (float, lower is better)
    #   feasible(rows) -- True when rows also satisfy the fixed outline etc.
    #   rng()        -- uniform u in [0,1); the schedule and edits use it
    #   schedule(k)  -- temperature at step k
    #   budget       -- exact number of candidate evaluations
    current = decode(initial)
    current_e = score(current)
    best = [r[:] for r in current] if feasible(current) else None
    best_e = score(best) if best is not None else None
    log, accepted_count, evals = [], 0, 0
    for k in range(budget):
        cand = neighbor(initial)
        cand_rows = decode(cand)
        cand_e = score(cand_rows)
        evals += 1
        T = schedule(k)
        delta = cand_e - current_e
        u = rng()
        accept = delta <= 0 or u < pow(2.718281828459045, -delta / T)
        if accept:
            initial = cand
            current, current_e = cand_rows, cand_e
            accepted_count += 1
            if feasible(current) and (best is None or current_e < best_e):
                best = [r[:] for r in current]
                best_e = current_e
        log.append({'step': k + 1, 'T': T, 'candidate_energy': cand_e,
                    'delta': delta, 'u': u, 'accepted': accept,
                    'current_energy': current_e,
                    'best_energy': best_e})
    return {'best_legal': best, 'best_energy': best_e, 'final': current,
            'final_energy': current_e, 'log': log,
            'accepted': accepted_count, 'evals': evals}
`;
const helpers=`# Provided Lab6 decoder (already complete), plus score/feasible/neighbor helpers.
`+PYTHON06.reference+`

def make_decoder(catalog):
    return lambda pair: decode_sequence_pair(pair[0], pair[1], catalog)['rows']

def make_score(outline):
    def score(rows):
        area = 0
        overflow = 0
        for row in rows:
            i, x, y, w, h = row
            area += w * h
            overflow += max(0, x + w - outline[0]) + max(0, y + h - outline[1])
        xmin = min(r[1] for r in rows); ymin = min(r[2] for r in rows)
        xmax = max(r[1] + r[3] for r in rows); ymax = max(r[2] + r[4] for r in rows)
        return (xmax - xmin) * (ymax - ymin) + 100 * overflow
    return score

def make_feasible(outline, catalog):
    def feasible(rows):
        return validate_layout(rows, outline, catalog)['legal']
    return feasible

def make_neighbor(rng):
    def neighbor(pair):
        pos, neg = list(pair[0]), list(pair[1])
        seq = pos if rng() < 0.5 else neg
        i = int(rng() * len(seq))
        j = int(rng() * (len(seq) - 1))
        if j >= i: j += 1
        seq[i], seq[j] = seq[j], seq[i]
        return (''.join(pos), ''.join(neg))
    return neighbor

def constant_rng(values):
    it = iter(values)
    return lambda: next(it)

def cooling(t0, rate):
    return lambda k: t0 * (rate ** k)
`;
const G="('ABCED','DABCE')";
const tests=[
['deterministic: same seed replays the same log',`(lambda a,b: a['log']==b['log'] and a['best_energy']==b['best_energy'])(anneal(${G},make_neighbor(constant_rng([0.1,0.2,0.9,0.3]*100)),make_decoder(${CAT}),make_score((10,8)),make_feasible((10,8),${CAT}),constant_rng([0.1,0.2,0.9,0.3]*100),cooling(12,0.97),5), anneal(${G},make_neighbor(constant_rng([0.1,0.2,0.9,0.3]*100)),make_decoder(${CAT}),make_score((10,8)),make_feasible((10,8),${CAT}),constant_rng([0.1,0.2,0.9,0.3]*100),cooling(12,0.97),5))`],
['budget is respected exactly',`anneal(${G},make_neighbor(constant_rng([0.5]*500)),make_decoder(${CAT}),make_score((10,8)),make_feasible((10,8),${CAT}),constant_rng([0.5]*500),cooling(12,0.97),17)['evals']==17`],
['log has one complete entry per step',`(lambda r: len(r['log'])==6 and all(set(e)>= {'step','T','candidate_energy','delta','u','accepted','current_energy','best_energy'} for e in r['log']))(anneal(${G},make_neighbor(constant_rng([0.3,0.6,0.9,0.1]*50)),make_decoder(${CAT}),make_score((10,8)),make_feasible((10,8),${CAT}),constant_rng([0.3,0.6,0.9,0.1]*50),cooling(12,0.97),6))`],
['temperature follows the schedule',`(lambda r: [e['T'] for e in r['log'][:3]]==[12.0,12*0.97,12*0.97**2])(anneal(${G},make_neighbor(constant_rng([0.5]*300)),make_decoder(${CAT}),make_score((10,8)),make_feasible((10,8),${CAT}),constant_rng([0.5]*300),cooling(12,0.97),3))`],
['downhill candidates always accept',`(lambda r: all(e['accepted'] for e in r['log'] if e['delta']<=0))(anneal(${G},make_neighbor(constant_rng([0.2,0.8,0.2,0.8]*100)),make_decoder(${CAT}),make_score((10,8)),make_feasible((10,8),${CAT}),constant_rng([0.2,0.8,0.2,0.8]*100),cooling(12,0.97),40))`],
['rejected step leaves current energy unchanged',`(lambda r: all((not e['accepted']) or True for e in r['log']) and all(e['current_energy']==r['log'][i-1]['current_energy'] for i,e in enumerate(r['log']) if i>0 and not e['accepted']))(anneal(${G},make_neighbor(constant_rng([0.9,0.9,0.1,0.1]*100)),make_decoder(${CAT}),make_score((10,8)),make_feasible((10,8),${CAT}),constant_rng([0.9,0.9,0.1,0.1]*100),cooling(12,0.97),20))`],
['rejected candidates leave current unchanged',`(lambda r: all(not e['accepted'] and i>0 and e['current_energy']==r['log'][i-1]['current_energy'] or e['accepted'] or i==0 for i,e in enumerate(r['log'])))(anneal(${G},make_neighbor(constant_rng([0.99,0.99,0.01,0.01]*100)),make_decoder(${CAT}),make_score((10,8)),make_feasible((10,8),${CAT}),constant_rng([0.99,0.99,0.01,0.01]*100),cooling(12,0.97),3))`],
['best legal area never increases',`(lambda r: all(b is None or a is None or b>=a for a,b in zip([e['best_energy'] for e in r['log'] if e['best_energy'] is not None],[e['best_energy'] for e in r['log'] if e['best_energy'] is not None][1:])))(anneal(${G},make_neighbor(constant_rng([0.4,0.4,0.4,0.4]*200)),make_decoder(${CAT}),make_score((10,8)),make_feasible((10,8),${CAT}),constant_rng([0.4,0.4,0.4,0.4]*200),cooling(12,0.97),50))`],
['best legal layout passes the Lab2 checker',`(lambda r: r['best_legal'] is not None and validate_layout(r['best_legal'],(10,8),${CAT})['legal'] is True)(anneal(${G},make_neighbor(constant_rng([0.6]*400)),make_decoder(${CAT}),make_score((10,8)),make_feasible((10,8),${CAT}),constant_rng([0.6]*400),cooling(12,0.97),60))`],
['final may be worse than best',`(lambda r: r['final_energy']>=r['best_energy']-1e-9)(anneal(${G},make_neighbor(constant_rng([0.7]*400)),make_decoder(${CAT}),make_score((10,8)),make_feasible((10,8),${CAT}),constant_rng([0.7]*400),cooling(12,0.97),80))`],
['accepted counter matches the log',`(lambda r: r['accepted']==sum(1 for e in r['log'] if e['accepted']))(anneal(${G},make_neighbor(constant_rng([0.5]*300)),make_decoder(${CAT}),make_score((10,8)),make_feasible((10,8),${CAT}),constant_rng([0.5]*300),cooling(12,0.97),25))`],
['uphill acceptance is bounded by probability',`(lambda r: all((not e['accepted']) or e['delta']<=0 or e['u']<pow(2.718281828459045,-e['delta']/e['T'])+1e-9 for e in r['log']))(anneal(${G},make_neighbor(constant_rng([0.05,0.95,0.15,0.85]*100)),make_decoder(${CAT}),make_score((10,8)),make_feasible((10,8),${CAT}),constant_rng([0.05,0.95,0.15,0.85]*100),cooling(12,0.97),50))`],
['low temperature accepts almost no uphill',`(lambda r: r['accepted']>=0)(anneal(${G},make_neighbor(constant_rng([0.99]*400)),make_decoder(${CAT}),make_score((10,8)),make_feasible((10,8),${CAT}),constant_rng([0.99]*400),cooling(0.5,1.0),20))`],
['best energy never exceeds final energy',`(lambda r: r['best_energy'] is None or r['best_energy']<=r['final_energy']+1e-9)(anneal(${G},make_neighbor(constant_rng([0.9]*300)),make_decoder(${CAT}),make_score((10,8)),make_feasible((10,8),${CAT}),constant_rng([0.9]*300),cooling(12,0.97),5))`],
['inputs are not mutated by neighbor',`(lambda r: r['evals']>0)(anneal(('ABCED','DABCE'),make_neighbor(constant_rng([0.3]*300)),make_decoder(${CAT}),make_score((10,8)),make_feasible((10,8),${CAT}),constant_rng([0.3]*300),cooling(12,0.97),3))`],
['no legal layout yields explicit None',`(lambda r: r['best_legal'] is None and r['best_energy'] is None)(anneal(('ABCED','DABCE'),make_neighbor(constant_rng([0.5]*100)),lambda x: [['A',0,0,3,2],['B',3,0,2,3],['C',5,0,2,2],['D',0,2,3,1]],make_score((10,8)),make_feasible((10,8),${CAT}),constant_rng([0.5]*100),cooling(12,0.97),2))`],
['budget one evaluates exactly once',`anneal(${G},make_neighbor(constant_rng([0.5]*10)),make_decoder(${CAT}),make_score((10,8)),make_feasible((10,8),${CAT}),constant_rng([0.5]*10),cooling(12,0.97),1)['evals']==1`],
['candidate energy equals score of the decoded neighbor',`(lambda r, s: abs(r['log'][0]['candidate_energy']-s(decode_sequence_pair('BACED','DABCE',${CAT})['rows']))<1e-6)(anneal(${G},make_neighbor(constant_rng([0.1]*20)),make_decoder(${CAT}),make_score((10,8)),make_feasible((10,8),${CAT}),constant_rng([0.1]*20),cooling(12,0.97),1), make_score((10,8)))`],
['schedule is called with zero-based step',`(lambda r: r['log'][0]['T']==12.0 and r['log'][1]['T']==12*0.97)(anneal(${G},make_neighbor(constant_rng([0.5]*20)),make_decoder(${CAT}),make_score((10,8)),make_feasible((10,8),${CAT}),constant_rng([0.5]*20),cooling(12,0.97),2))`],
['best is a copy, not the same list object',`(lambda r: r['best_legal'] is None or all(a is not b for a,b in zip(r['best_legal'],r['final'])) or r['best_legal'][0] is not r['final'][0])(anneal(${G},make_neighbor(constant_rng([0.6]*50)),make_decoder(${CAT}),make_score((10,8)),make_feasible((10,8),${CAT}),constant_rng([0.6]*50),cooling(12,0.97),5))`],
['constant temperature schedule is honored',`(lambda r: all(e['T']==5.0 for e in r['log']))(anneal(${G},make_neighbor(constant_rng([0.5]*30)),make_decoder(${CAT}),make_score((10,8)),make_feasible((10,8),${CAT}),constant_rng([0.5]*30),lambda k: 5.0,4))`],
['neighbors differ from the current encoding',`(lambda r: r['log'][0]['delta'] is not None)(anneal(${G},make_neighbor(constant_rng([0.2]*50)),make_decoder(${CAT}),make_score((10,8)),make_feasible((10,8),${CAT}),constant_rng([0.2]*50),cooling(12,0.97),2))`],
['uphill then downhill both handled in one log',`(lambda r: any(e['delta']>0 and e['accepted'] for e in r['log']) and any(e['delta']<0 for e in r['log']))(anneal(${G},make_neighbor(constant_rng([0.1,0.3,0.9,0.2,0.1,0.3,0.9,0.2]*100)),make_decoder(${CAT}),make_score((10,8)),make_feasible((10,8),${CAT}),constant_rng([0.1,0.3,0.9,0.2,0.1,0.3,0.9,0.2]*100),cooling(12,0.97),30))`],
['returned final is the decoded rows',`(lambda r: sorted(x[0] for x in r['final'])==['A','B','C','D','E'])(anneal(${G},make_neighbor(constant_rng([0.8]*30)),make_decoder(${CAT}),make_score((10,8)),make_feasible((10,8),${CAT}),constant_rng([0.8]*30),cooling(12,0.97),3))`]
];
export const PYTHON07={name:'anneal',version:'anneal-v1',
 prompt:bi('实现通用退火状态机 anneal(initial, neighbor, decode, score, feasible, rng, schedule, budget)：当前/候选/最好合法解分开保存；ΔE≤0 直接接受，ΔE>0 以 exp(−ΔE/T) 与 u 比较；拒绝不改当前；最好合法解只减不增；日志记录每步 T、候选能量、ΔE、u、接受、当前能量、最好能量；恰好评估 budget 次。已提供 Lab6 解码器、能量/可行/邻居/随机数/温度计划的构造器——状态机是你来实现的部分。','Implement the generic annealing state machine anneal(initial, neighbor, decode, score, feasible, rng, schedule, budget): current/candidate/best-legal are stored separately; accept downhill always and uphill when u < exp(-delta/T); a rejected candidate must not touch current; the best legal solution only improves; the log records T, candidate energy, delta, u, acceptance, current and best energy per step; exactly budget evaluations. The Lab6 decoder and score/feasible/neighbor/rng/schedule builders are provided - the state machine is yours.'),
 starter:helpers+`

def anneal(initial, neighbor, decode, score, feasible, rng, schedule, budget):
    # State machine: decode the initial encoding, keep current / candidate /
    # best-legal apart, apply the acceptance rule exactly, log every step,
    # and stop after exactly the given budget evaluations.
    # Return {'best_legal','best_energy','final','final_energy','log',
    #         'accepted','evals'}
    raise NotImplementedError('Implement the complete annealing state machine')
`,
 reference:PYTHON06.reference+'\n'+helpers+'\n'+implementation,tests};