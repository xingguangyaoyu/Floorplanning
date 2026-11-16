# 04 · 切片树与后缀表达式

一串字母和 H、V，怎么变回矩形？

切片表示把布局递归分成两个区域。叶子是模块，内部节点是贯穿当前区域的一刀。用后序遍历写成后缀表达式，就能用一个栈重新拼出区域。树结构给出相对关系，坐标由组合规则算出。

## 先定 H/V 约定

本课 H 表示水平切线：第一个区域在下、第二个在上，宽取最大、高相加。V 表示垂直切线：第一个在左、第二个在右，宽相加、高取最大。字母命名的是切线，不是模块移动的方向。

## 栈顶先弹出的是第二个孩子

读 A 就压入 A，读 D 就压入 D。遇到 H，先弹出 D，再弹出 A，因此是 A 在下、D 在上，得到 3×3。继续读 B V C V E V，最后得到 9×3。把两个孩子弹出的顺序搞反，会得到另一张布局。

## 不是所有布局都能切

表达式只剩一个栈元素，说明组合结构完成，不代表 A—E 都恰好出现一次，也不代表装得进外框。还要检查完整性和几何。某些风车形布局不存在避开全部模块内部的第一条贯穿切线，不能由切片树表达。

## 算法步骤

```text
for token in postfix:
  if block: push(block)
  else:
    second = pop(); first = pop()
    push(combine(first, second, token))
require one_region and every_block_once
check_geometry(result)
```

## 易错点

语法合法的表达式也会越界。把标准表达式的第一个 H 改成 V，得到宽 12 的一行，超过宽 10 的外框。

## 检查理解

1. A 为 3×2，D 为 3×1。A D H 的尺寸？

   A. 3×3
   B. 6×2
   C. 3×2

   答案: A. H：宽取 max(3,3)，高为 2+1。

2. 先压 A、再压 D，遇到 H 先弹谁？

   A. A
   B. D

   答案: B. 后进先出；D 是第二个孩子。

3. 最后栈中只剩一个元素，能保证装进外框吗？

   A. 能
   B. 不能，还要查几何

   答案: B. 结构和几何是两道独立检查。

## Python 练习

实现完整解码器 decode_postfix(tokens, catalog)：解析后缀表达式，生成切片树，自下而上算尺寸、自上而下算坐标；返回树、尺寸、坐标与可读错误。已提供 combine 与 Lab2 的 validate_layout 作辅助。约定：H 的第一区域在下、第二区域在上；V 的第一区域在左、第二区域在右；先弹出的是第二区域。错误码：underflow:X、leftover:N、unknown:X、duplicate:X、missing:清单。

```python
def combine(a, b, op):
    if op == 'H': return (max(a[0], b[0]), a[1] + b[1])
    if op == 'V': return (a[0] + b[0], max(a[1], b[1]))
    raise ValueError('Unknown operator')


def decode_postfix(tokens, catalog):
    # Phase 1 (reading): push leaves; on H/V pop two regions and push the combined
    #   node with its size (max/add rule). Check: at least two regions, unknown,
    #   duplicate. Phase 2 (after reading): every catalog id seen exactly once and
    #   exactly one region left, then propagate coordinates from the root (0,0).
    # Return {'ok':bool,'errors':[...],'tree':node,'size':(w,h),'coords':{id:(x,y,w,h)},'rows':[[id,x,y,w,h],...]}
    raise NotImplementedError('Implement the complete postfix decoder')

# Provided helpers: combine above and the Lab2 checker below.
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
新教材：谭星宇，CC BY 4.0。原作贡献: GateUltra
