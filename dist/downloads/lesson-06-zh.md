# 06 · 序列对与约束图

关系已经给定，坐标为什么要取最大值？

序列对使用两个模块排列记录相对关系。两个排列中先后顺序相同，较早的模块在左；顺序相反，则在本课约定中较早的模块在下。把所有关系写成坐标不等式，再按拓扑顺序做最长路径计算。

## 先写清方向约定

若 i 在 pos、neg 中都先于 j，建立水平边 i→j，要求 xj≥xi+wi。若 i 在 pos 中先、neg 中后，建立竖直边 i→j，要求 yj≥yi+hi。有些资料的竖直约定相反，不能只抄箭头，必须同时检查坐标和不等式。

## 满足所有前驱，所以取最大

一个模块可能有多个左侧前驱。只满足其中一个会与另一个相撞。因此 xj=max(xi+wi)，对所有水平前驱取最大；y 同理。边的权重使用前驱尺寸，因为要跨过的是前驱占用的空间。pos 本身就是两张图的拓扑序。

## 同一数据，不同表示

标准序列 ABCED / DABCE 得到 D(0,3)，包围盒 9×4=36；标准 B*-tree 则得到 D(0,2)，包围盒 27。这里比较的是两份指定编码，不代表序列对算法一定比 B*-tree 差。要看表示能力得穷举编码空间：本课五块固定尺寸、禁旋转时，B*-tree 的 5040 棵树与序列对的 14400 个编码都能表达面积 24 的布局；切片表示做不到——26880 份切片编码穷举下来最小只到 25，一份 24 都没有。注意两句证据要分开：上一课那张 24 布局没有任何一条贯穿的第一刀，所以它自己写不成切片树，但这只否定了那一张布局；“所有切片编码都到不了 24”是靠上面这次完备穷举得出的，不能由一个反例推出来，也不适用于别的规模或别的工程模型。

## 算法步骤

```text
validate_two_permutations(pos,neg)
for each ordered pair i,j in pos:
  if neg[i] < neg[j]: add_horizontal(i,j)
  else: add_vertical(i,j)
for j in pos:
  x[j] = max(x[i]+w[i] for horizontal predecessors)
  y[j] = max(y[i]+h[i] for vertical predecessors)
```

## 易错点

两个完整排列保证相对关系一致，解码不重叠；它们没有替你检查固定外框。全部按同一顺序排列会排成宽 12 的一行。

## 检查理解

1. i 在两个排列中都先于 j。i 在 j 的哪边？

   A. 左边
   B. 下边
   C. 上边

   答案: A. 相同顺序对应水平约束。

2. xj 的两个下界为 3 和 5，最小可行 xj？

   A. 3
   B. 5
   C. 8

   答案: B. 要同时满足两个下界，所以取 max=5。

3. 标准序列对里的 D 位于哪里？

   A. (0,2)
   B. (0,3)
   C. (3,0)

   答案: B. A、B、C、E 都在 D 下方，其中 B 高 3。

## Python 练习

实现完整解码器 decode_sequence_pair(pos, neg, modules)：校验两行排列，把全部有序对分类成水平/竖直约束（同序→水平，反序→竖直），按拓扑序（pos 本身）对每个模块取所有前驱下界的最大值，返回图、顺序、坐标、关键前驱与rows。边权用前驱的尺寸。错误码：permutation:pos / permutation:neg。

```python
def decode_sequence_pair(pos, neg, modules):
    # 1) Validate both permutations (same multiset as modules, no duplicates).
    # 2) Classify every ordered pair (i before j in pos): same order in neg ->
    #    horizontal edge (a,b); reversed -> vertical edge (a,b).
    # 3) Walk pos as a topological order; x = max over horizontal predecessors
    #    of (x_p + w_p), y likewise with heights. Edge weight = predecessor size.
    # Return {'ok','errors','graph':{'H':[...] ,'V':[...]},'order','coords','rows','key'}
    # coords: {id:(x,y,w,h)}; key: {id:{'x':argmaxId,'y':argmaxId}}.
    raise NotImplementedError('Implement the complete sequence-pair decoder')

# Provided Lab2 checker below; use it to cross-check decoded rows.
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

```

---
新教材：谭星宇，CC BY 4.0。原作贡献: Su3037
