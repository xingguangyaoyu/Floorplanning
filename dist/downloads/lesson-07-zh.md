# 07 · 模拟退火搜索

为什么接受一个暂时更差的布局？

表示法告诉我们怎样写下一个布局，搜索告诉我们怎样在许多编码之间选择。这里在序列对的某一个排列里交换两个名称作为邻居，用包围盒面积和越界惩罚评分。每一步既可能接受，也可能拒绝，但历史最好合法解始终单独保存。

## 先把能量写明

本实验 E=包围盒面积+100×(宽度超出量+高度超出量)。这是便于教学的面积与越界模型，没有包含线长、时序或布线拥塞。序列对解码保证不重叠；越界候选可以探索，但不能被记录为最好合法解。

## 接受概率不是成功概率

令 ΔE=候选能量−当前能量。若 ΔE≤0，接受；否则用 p=exp(−ΔE/T)，抽 u∈[0,1)，当 u<p 时接受。温度越高，相同变差幅度越容易被接受；冷却后搜索更保守。这不意味着最终一定找到最优解。

## 复现一次搜索

固定输入、邻居操作、随机数生成器、种子、温度、冷却率和步数，才能复现整条轨迹。只展示一次漂亮结果不能证明算法稳定。比较不同参数时要使用相同预算，并区分单次运行与多次运行统计。

## 算法步骤

```text
current = decode(initial_pair); best_legal = None
repeat for a fixed budget:
  candidate = decode(random_swap(current_pair))
  delta = E(candidate)-E(current)
  accept if delta<=0 or random()<exp(-delta/T)
  update best_legal if current is legal and better
  T = T*cooling
```

## 易错点

当前解可能变差，所以不要把“当前能量”当作“历史最好能量”。历史最好合法解的面积只会持平或下降。

## 检查理解

1. ΔE=4，T 从 1 增到 10，接受概率怎样变化？

   A. 升高
   B. 降低
   C. 不变

   答案: A. exp(−4/10) 大于 exp(−4)。

2. 接受了一个更差候选，历史最好解要被覆盖吗？

   A. 要
   B. 不要

   答案: B. 接受更新当前解；历史最好解只在合法且更好时更新。

3. 固定种子能保证全局最优吗？

   A. 能
   B. 不能，只帮助复现

   答案: B. 种子控制随机轨迹，不改变启发式的保证。

4. ΔE 为正且不变，把温度调低，接受这个变差候选的概率会怎样？

   A. 升高
   B. 降低
   C. 不变

   答案: B. p=exp(−ΔE/T)，T 变小，指数更负，接受概率下降。

5. 历史最好合法解在什么时候更新？

   A. 每次接受都更新
   B. 当前解合法且比它更好时
   C. 当前解变差时

   答案: B. 接受只改变当前解；历史最好只在合法且更优时替换。

## Python 练习

实现通用退火状态机 anneal(initial, neighbor, decode, score, feasible, rng, schedule, budget)：当前/候选/最好合法解分开保存；ΔE≤0 直接接受，ΔE>0 以 exp(−ΔE/T) 与 u 比较；拒绝不改当前；最好合法解只减不增；日志记录每步 T、候选能量、ΔE、u、接受、当前能量、最好能量；恰好评估 budget 次。已提供 Lab6 解码器、能量/可行/邻居/随机数/温度计划的构造器——状态机是你来实现的部分。

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
新教材：谭星宇，CC BY 4.0。原作贡献: thy031
