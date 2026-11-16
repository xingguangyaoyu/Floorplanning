# 05 · B*-tree 与轮廓线

右孩子一定直接坐在父节点上吗？

B*-tree 把每块模块放进二叉树。左孩子从父模块右边缘开始，右孩子与父模块左边缘对齐。但高度不是从父模块直接抄来：模块会落到自身整个宽度下方的最高轮廓线上。这个细节决定了算法是否正确。

## 遍历顺序是算法的一部分

先放当前节点，再处理整个左子树，最后处理右子树。标准树 A(B(C(E,-),-),D) 的顺序是 A、B、C、E、D。若在左子树完成前先放右孩子，已有轮廓线不同，结果也可能不同。

## 交换 A 与 C，看 D 被谁托住

标准树里 D 在 (0,2)，恰好坐在 A 上。交换 A 与 C 的名称后，D 的左边缘仍为 x=0，但它宽 3，跨过了高度为 3 的 B。于是 D 落在 y=3，而不是根模块 C 顶部的 y=2。轮廓线必须检查整个区间。

## 可复现的反例比背规则有用

本课固定尺寸、禁止旋转时，一共有 Catalan(5)×5!=5040 棵有标号二叉树。穷举得到 4680 棵装得下，所有解均无内部重叠，最小包围盒面积为 24。这些结论只对本课五块数据和规则成立，不是任意芯片的最优性保证。

## 算法步骤

```text
walk(node,x):
  y = maximum_skyline(x, x+node.width)
  place(node,x,y)
  raise_skyline(x,x+node.width,y+node.height)
  walk(node.left, x+node.width)
  walk(node.right,x)
```

## 易错点

只跑标准树抓不出“直接抄父模块高度”的错误：标准树恰好能算对。必须再跑 lift 等反例。

## 检查理解

1. 交换 A、C 后，D 的 y 坐标？

   A. 2
   B. 3
   C. 0

   答案: B. D 的宽度跨到 B 上；B 的顶部是 3。

2. 标准树的遍历顺序？

   A. ABCDE
   B. ABCED
   C. ADBCE

   答案: B. 整个左子树要在右孩子 D 之前完成。

3. B*-tree 不重叠，是否一定装进 10×8？

   A. 是
   B. 否，仍可能越界

   答案: B. 轮廓线避免内部重叠，但不保证外框约束。

## Python 练习

实现完整打包器 pack_bstar(tree, modules)：先序遍历树，左孩子从父块右边缘开始、右孩子与父块同 x；每个模块落到整个覆盖区间 [x,x+w) 下最高的轮廓线上。放块后拆分旧区间、保留两侧残段、合并相邻等高段。返回 order/coords/rows/contour/trace。错误码：unknown:X、duplicate:X、missing:清单。tree 是 (id, left, right) 嵌套元组，叶子可写 (id,None,None) 或直接写 id 字符串。

```python
def pack_bstar(tree, modules):
    # Phase 1: walk the tree (preorder), reject unknown/duplicate/missing ids.
    # Phase 2: place each node: query the highest segment under [x, x+w),
    #   split old segments keeping residuals, merge equal neighbours.
    # Return {'ok','errors','order','coords','rows','contour','trace'}
    # coords: {id: (x, y, w, h)}; rows: [[id,x,y,w,h],...] sorted by id.
    raise NotImplementedError('Implement the complete B*-tree packer')

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
新教材：谭星宇，CC BY 4.0。原作贡献: Capeur
