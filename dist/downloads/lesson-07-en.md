# 07 · Simulated annealing

Why accept a temporarily worse layout?

A representation encodes a layout; search chooses among encodings. Here a neighbor swaps two names in one permutation. Energy is bounding-box area plus an overflow penalty. Each proposal may be accepted or rejected, while the best legal solution is stored separately.

## Make the energy explicit

The teaching energy is box area +100×(width overflow+height overflow). It excludes wirelength, timing and congestion. Sequence-pair decoding prevents overlap. Overflowing candidates can be explored but cannot become the best legal solution.

## Acceptance probability is not success probability

Let ΔE=candidate−current energy. Accept non-increasing moves. Otherwise use p=exp(−ΔE/T), draw u in [0,1), and accept when u<p. Higher temperature tolerates the same uphill move more often. Cooling makes the search more selective; it does not guarantee an optimum.

## Reproduce a search

Reproduction needs the input, neighbor rule, RNG, seed, temperature, cooling rate and step count. One attractive run does not establish reliability. Compare settings under the same budget and distinguish individual runs from repeated-run statistics.

## Pseudocode

```text
current = decode(initial_pair); best_legal = None
repeat for a fixed budget:
  candidate = decode(random_swap(current_pair))
  delta = E(candidate)-E(current)
  accept if delta<=0 or random()<exp(-delta/T)
  update best_legal if current is legal and better
  T = T*cooling
```

## Pitfall

The current solution may get worse. Do not label current energy as best-so-far. The best legal area never increases.

## Check understanding

1. ΔE=4. Raise T from 1 to 10. Acceptance probability…

   A. increases
   B. decreases
   C. stays constant

   Answer: A. exp(−4/10) exceeds exp(−4).

2. Accept a worse candidate. Overwrite the best-so-far?

   A. Yes
   B. No

   Answer: B. Acceptance updates current; the incumbent changes only for a better legal layout.

3. Does a fixed seed guarantee global optimality?

   A. Yes
   B. No, it helps reproducibility

   Answer: B. The seed controls the random trajectory, not an optimality guarantee.

## Python exercise

Implement the generic annealing state machine anneal(initial, neighbor, decode, score, feasible, rng, schedule, budget): current/candidate/best-legal are stored separately; accept downhill always and uphill when u < exp(-delta/T); a rejected candidate must not touch current; the best legal solution only improves; the log records T, candidate energy, delta, u, acceptance, current and best energy per step; exactly budget evaluations. The Lab6 decoder and score/feasible/neighbor/rng/schedule builders are provided - the state machine is yours.

```python
# Provided Lab6 decoder (already complete), plus score/feasible/neighbor helpers.
import math

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

def decode_sequence_pair(pos, neg, modules):
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


def anneal(initial, neighbor, decode, score, feasible, rng, schedule, budget):
    # State machine: decode the initial encoding, keep current / candidate /
    # best-legal apart, apply the acceptance rule exactly, log every step,
    # and stop after exactly the given budget evaluations.
    # Return {'best_legal','best_energy','final','final_energy','log',
    #         'accepted','evals'}
    raise NotImplementedError('Implement the complete annealing state machine')

```

---
New material: Xingyu Tan, CC BY 4.0. Original contributor: thy031
