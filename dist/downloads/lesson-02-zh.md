# 02 · 固定边界与合法性

边缘刚好碰上，算不算重叠？

一块芯片的外框像一个尺寸已经定好的收纳盒。模块是必须完整放进去的矩形。把图画得漂亮不够：每块都必须出现一次、留在外框内，而且不能占用同一片内部空间。先建立这道检查关，后面的评分才有意义。

## 三个独立问题

完整性检查名称集合：A—E 每个恰好一次。包含性检查每块的四条边：x≥0、y≥0、x+w≤10、y+h≤8。非重叠检查任意两块的内部。哪怕五块的面积和仍是 23，只要漏放或重叠，布局就不能通过。

## 接触不是重叠

C 的右边界在 x=7，E 的左边界也在 x=7，两者只接触一条线，交叠面积为零。若把 E 移到 x=6，两个内部才共享宽 1、高 2 的区域。比较必须使用严格不等式，不能把贴边判成冲突。

## 错误要能定位

只显示“非法”没有告诉你怎么修。检查器应指出“E 越过右边界”或“C 与 E 重叠”。本实验允许你把模块放错，错误对象会单独标记；修改后重新计算，不会偷偷替你摆回标准答案。

## 算法步骤

```text
for each required id: require exactly one occurrence
for each block: require inside_outline(block)
for each pair (a,b): require no_positive_area_overlap(a,b)
return all_checks_pass
```

## 易错点

只数模块数量不够。A、A、C、D、E 也有五块，却重复 A、缺少 B。要比较名称集合和每个名称的出现次数。

## 检查理解

1. E 位于 x=9，宽为 2，右边界在哪里？

   A. 10
   B. 11
   C. 9

   答案: B. 9+2=11，超过外框右边界 10。

2. C 结束于 x=7，E 从 x=7 开始。

   A. 合法接触
   B. 正面积重叠
   C. 一定越界

   答案: A. 共边的面积为零；还需分别检查其余边界。

3. A、A、C、D、E 能通过完整性检查吗？

   A. 能，一共五块
   B. 不能，缺 B 且 A 重复

   答案: B. 检查的是每个名称恰好一次，而不只是总数。

## Python 练习

实现完整布局检查器 validate_layout(rows, outline, catalog)。rows每项为(id,x,y,w,h)，outline为(宽,高)，catalog把名称映射到固定(宽,高)。返回legal、排序去重errors和带真实交叠面积的overlaps；共边和共角允许，禁止旋转。

```python
import math

def validate_layout(rows, outline, catalog):
    # rows: [(id, x, y, width, height), ...]
    # outline: (width, height); catalog: {id: (width, height)}
    # Return {'legal': bool, 'errors': sorted_unique_codes,
    #         'overlaps': [{'ids': ['A','D'], 'area': number}, ...]}
    # All input row shapes, outline and catalog formats are already parsed.
    # Check actual numeric values, identities and geometry here.
    raise NotImplementedError('Implement the complete layout validator')

```

---
新教材：谭星宇，CC BY 4.0。原作贡献: muranfei
