# Floorplanning Studio

从约束到表示，再到搜索。统一坐标：左下角原点；宽×高；外框 10×8；模块 A—E 总面积 23。

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

4. 检查器查了包含性和重叠。一个布局要通过，至少几项检查必须同时通过？

   A. 只查包含性
   B. 两项都通过
   C. 取决于模块顺序

   答案: B. 任何一项失败都拒绝；合法性是门槛，不是分数。

5. 一个布局已经重叠，但密度仍算出 28.75%。这个数能当占用率报告吗？

   A. 能，数值算出来了
   B. 不能，先修合法性
   C. 只看密度就够

   答案: B. 指标只有在包含性和非重叠都通过后才有意义。

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


# 03 · 面积、死区与密度

挪动模块后，为什么密度完全没变？

面积和是 23，固定外框面积是 80，所以外框死区是 57，外框密度是 28.75%。这些数不会因为挪动模块而改变。真正反映压紧程度的是围住模块的最小矩形。使用密度之前，先说清楚分母是哪一个面积。

## 先把账算清

A=6、B=6、C=4、D=3、E=4，总和 23。外框 10×8=80。合法布局的外框死区是 80−23=57，密度为 23/80。非法布局仍能算出这个算式，但它不能作为有效布局的占用率报告。

## 包围盒会跟着布局变化

标准摆法的包围盒是 9×3=27，内部空余 4，包围盒密度约 85.19%。另一种合法摆法可以达到 6×4=24，内部空余 1。两种布局的外框密度仍完全相同，不能据此判断哪个更紧凑。

## 紧凑只是一个目标

真实设计还要为连线、电源、引脚、时序及布线通道留空间。本课不把较小的包围盒称为生产设计的“全面更优”。我们只在相同模块、相同外框和相同规则下比较面积，并把目标函数写出来。

## 算法步骤

```text
require legal(pack)
module_area = sum(w*h for each module)
outline_density = module_area / (W*H)
bbox = enclosing_rectangle(pack)
packing_density = module_area / bbox.area
```

## 易错点

不要把空余量比例 γ=空余/模块面积，与外框空余比例=空余/外框面积混为一谈；“15% 空余”必须注明分母。

## 检查理解

1. 把标准摆法压紧，外框仍为 10×8。外框密度？

   A. 28.75%
   B. 85.19%
   C. 95.83%

   答案: A. 23/80 不随模块位置变化。

2. 标准包围盒 9×3 的内部空余？

   A. 57
   B. 4
   C. 23

   答案: B. 包围盒空余=27−23=4。57 是外框死区。

3. 把包围盒从 27 降到 24，哪项改变？

   A. 模块面积和
   B. 外框密度
   C. 包围盒密度

   答案: C. 分母由 27 变为 24，模块面积和仍为 23。

4. 外框 10×8，模块面积和 23。外框死区是多少？

   A. 57
   B. 23
   C. 80

   答案: A. 80−23=57；这是固定外框内部的空余。

5. 只把模块在框内挪动，不改变外框和模块面积。外框密度会怎样？

   A. 不变
   B. 变大
   C. 变小

   答案: A. 分子与分母都不变；改变的是包围盒密度。

## Python 练习

实现完整评价报告 metrics_report(rows, outline, catalog)。已提供Lab2的validate_layout，无需重写。先检查合法性，再计算真实包围盒、两个密度和两种空余；非法布局只留诊断几何，不给有效分数。

```python
import math

def metrics_report(rows, outline, catalog):
    # First call validate_layout, provided below.
    # module_area comes from the full catalog, not an incomplete input list.
    # Return legal, errors, module_area, outline_area, bbox,
    # outline_density, packing_density, outline_dead, bbox_dead.
    # bbox has xmin,ymin,xmax,ymax,width,height,area, or is None.
    # Scores are ratios (0..1), not percentages. Withhold all four scores if illegal.
    raise NotImplementedError('Implement the complete metrics report')

# Provided Lab2 checker. You may use it directly.
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
新教材：谭星宇，CC BY 4.0。原作贡献: 原提交者（压缩包未署名）


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

4. 表达式最后只剩一个栈元素，能保证每个模块恰好出现一次吗？

   A. 能
   B. 不能，还要查完整性

   答案: B. 栈归约成功只说明组合结构完成；重复和缺失要单独查。

5. 是否存在一些布局，完全没有可用的贯穿第一刀？

   A. 不存在
   B. 存在，风车形就是例子

   答案: B. 没有贯穿第一刀，就不能写成切片树；这正是切片表示的局限。

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

4. 左孩子的 y 坐标一定和父节点相同吗？

   A. 一定相同
   B. 不一定，y 由轮廓线决定

   答案: B. 左孩子只继承 x；高度要看它整个宽度下方的最高轮廓线。

5. 五块总面积 23。5040 棵有标号二叉树中，最小包围盒面积是多少？

   A. 23
   B. 24
   C. 27

   答案: B. 23 只能排成 1×23，B 高 3 放不下；最小是 6×4=24。

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

4. 一个模块有多个左侧前驱，xj 应取哪个值？

   A. 最小下界
   B. 最大下界
   C. 任意一个

   答案: B. 要同时满足全部前驱，所以取所有 xi+wi 的最大值。

5. 两个完整排列保证解码不重叠，是否也保证装进 10×8？

   A. 保证
   B. 不保证，还要查外框

   答案: B. 序列对只保证相对关系一致；外框包含性仍需单独检查。

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


# 08 · 软模块形状优化

A 变窄了，为什么布局反而非法？

硬模块的长宽由实现决定；软模块在教学模型中面积固定、形状可调。A 的面积为 6，宽高比 w/h 限制在 0.5 到 2。变窄会同时变高，所以改变 A 后必须重新检查邻居。形状优化的完整动作是“选形状—重摆—评判”。

## 1. 先确定哪些量可以改变

软模块是早期规划中的一种抽象：面积给定，宽和高可以在指定范围内调整。它不是“任何电路都可以任意拉伸”的承诺。硬模块的尺寸来自已有实现，不能为了让示意图更整齐而随意改动。本例中只有 A 可以变形；B、C、D、E 的尺寸固定，所有模块都不能仅因动画需要而增减面积。形状由宽 w、高 h 描述，位置由左下角坐标 (x,y) 描述。修改形状和修改位置是两类操作，必须分别记录。即使 A 的某个新形状通过检查，把它放回原位置也可能与邻居冲突。因此，检查一个矩形本身的形状，不能代替检查整个布局。

## 2. 面积与宽高比必须同时满足

A 的约束是 w>0、h>0、wh=6、0.5≤w/h≤2。宽高比始终定义为宽除以高，不在不同页面交换分子、分母。原形状 3×2 的面积为6、比例为1.5；新形状 2×3 的面积也为6、比例约0.667，两者都允许。1×6 虽然面积正确，但比例约0.167；6×1 的比例为6，二者都被比例约束排除。不要用面积正确来推断形状正确，也不要把“形状正确”写成“布局合法”。在程序中，先处理非正尺寸，避免在 h=0 时计算比例；再检查面积误差，最后检查包含端点的比例范围。显示为0.67只是舍入，内部计算仍应保留真实值。

## 3. 整数模型与连续模型不要混用

整数实验要求宽、高都是正整数。先枚举面积6的因数对，再用比例条件筛选，才能得出只剩2×3和3×2。连续模型允许非整数尺寸，候选远不止两个。若选择宽度w，可令h=6/w；代入比例条件得到0.5≤w²/6≤2，所以√3≤w≤√12。动画从3×2变到2×3时，采用宽度过渡后由面积恢复高度的方式，避免中间帧面积漂移。这里的中间尺寸用于说明连续变形，不新增整数实验选项。不要分别线性变化宽和高，也不要分别取整，再声称面积恒定。若实际实现必须落到离散网格，应重新检查取整后的形状是否可行。

## 4. 用坐标读出占用区间

左下角是原点，x向右增加，y向上增加。一个(x,y,w,h)矩形占横向区间[x,x+w]、纵向区间[y,y+h]。原始A=(0,0,3,2)，D=(0,2,3,1)，因此A的顶部和D的底部都在y=2。两者共享边界，却没有共享内部面积。其余模块为B=(3,0,2,3)、C=(5,0,2,2)、E=(7,0,2,2)。最右边缘9、最高边缘3，最小坐标都为0，所以包围盒为9×3=27。一般公式必须使用最大右边缘减最小x、最大上边缘减最小y；不能只乘两个最大边界，否则整体平移会错误改变包围盒面积。

## 5. 把碰撞面积算出来

A变成(0,0,2,3)后，与D的横向公共区间是0到2，纵向公共区间是2到3，重叠面积为2×1=2。两个方向都必须有正长度，才是正面积重叠。通用重叠宽度为max(0,min(x1+w1,x2+w2)−max(x1,x2))，高度同理；二者相乘得到面积。若某一方向的公共长度为0，则只是贴边或角点接触。本次失败不是A面积增加，而是面积固定时它新增了上方占用区域。检查器应指出A/D，而不是给一个不解释原因的红色失败标志。把“变窄所以更安全”的直觉改为逐方向检查，才能在新的布局上继续使用。

## 6. 局部修复也可能制造新冲突

把D从(0,2)移到(2,2)，虽然消除了A/D冲突，却与B在x=3…5、y=2…3重叠。只检查原来的那一对模块不够，每次改动后都要检查完整布局。再把D移到(2,3)，它的底部与B顶部贴合，恢复合法。但这时包围盒是9×4=36，比原来的27更大。这不是检查器出错，而是两个目标本来就不同：修复的任务是恢复可行性，优化的任务是在可行解之间比较明确的目标。动画里的位置过渡用于说明端点变化，并不保证搬运路径上的每个中间帧都无重叠；变化中不提前颁发合法判定。

## 7. 为什么要逐块重新摆放

从合法但松散的布局开始，先把B左移到(2,0)，贴住A；再把C左移到(4,0)，贴住B。最后把D放到(4,2)，让它位于C上方、B右边、E左侧。检查D与三个邻居的区间，确认只有边界接触。新布局为9×3=27，说明一次合法重摆也可能只是回到原有面积。继续优化时，观察是谁决定包围盒的最右边界：E在(7,0)，宽2，所以右边缘为9。要真正缩小宽度，必须为E找到更靠内的位置。这里不是让学生背一组神奇坐标，而是识别限制边界，再安排邻居腾出空间。

## 8. 压紧到24需要怎样的空间交换

先把D放到(0,3)，腾出C上方的2×2区域。这时最右边仍有E，包围盒暂时为36；中间状态不是最终优化结果。再把E从(7,0)移到(4,2)。它贴在C上方、B右侧，与D没有内部交叠。现在最大右边缘为6、最大上边缘为4，得到6×4=24。模块面积和为23，所以合法包围盒内只剩1单位空余，位于x=3…4、y=3…4。应说“这是一份面积24的合法见证”。本课没有证明连续软模块模型的全局最优，也没有把它推广到不同面积、连线或约束的实例。

## 9. 报告指标时，写清楚分母

固定外框面积为80，模块面积和为23，故固定外框密度为23/80=28.75%。对所有面积和不变、使用同一外框的合法摆法，该比例相同；它不能证明压紧操作有效。包围盒密度则用当前包围盒面积作分母，从23/27≈85.19%提高到23/24≈95.83%。两个比例回答不同的问题。非法布局中仍能写23/80，却不能把它当成通过约束的有效得分；模块面积相加也不等于被占区域的并集面积。只有先确认无重叠，才能用包围盒面积减23解释盒内空余。外框死区57与盒内空余1也不能混称为同一个量。

## 10. 在新例子上验证自己真的会了

把单个模块面积改为8，比例范围仍含端点0.5与2。正整数因数对为1×8、2×4、4×2、8×1；筛选后留下2×4与4×2。它们刚好处在两个比例边界，代码不能把≤误写成<。3×3虽然形状看着规整，却因面积为9而失败。回到公共五模块实验，先独立把A设为2×3并修复全部冲突，再尝试包围盒不超过24。记录形状、所有坐标、合法性与面积，解释关键移动；不要只提交一张绿色截图。查看答案、装入演示与独立完成分别记录。真实设计还需要线长、拥塞等目标，本课的几何优化结论不能替代这些检查。

## 11. Python检查应怎样拆开

本课Python函数valid_shape只检查一个矩形的形状，不负责读取五块坐标或判定邻居。对w=0或h=0应直接返回False，不能先除以h。用明确的小误差容限检查面积乘积，再检查宽高比的上下界。用2×3、3×2作为正常例子，用2×2、1×6、零宽作为反例，并加入面积8的2×4、4×2边界例子。不要只测试返回True的情况。形状函数通过后，再把新尺寸交给完整布局检查器，检查名称、框内包含与全部模块对。浏览器的停止和超时只限制运行时间，不证明你的算法正确；所有测试通过也只证明这些用例通过，需要能解释每条条件。

## 12. 独立练习的提交证据

做实验时保留自己的输入与每次关键改变。先完成形状筛选，再制造一次碰撞并用区间解释它，最后修复并比较包围盒。扩展挑战要求A保持2×3、完整布局合法且包围盒不超过24，可以用不同于讲解的操作顺序；不要求模仿动画中的搬动轨迹。若看过提示或答案，应如实标记，不把“已显示答案”记成独立求解。解释应包括一个失败原因、一次修复的依据，以及实际改善的指标。看到28.75%不变时，要能指出它使用固定外框80作分母。这些证据比只给出最终截图更能证明你掌握了方法。

## 13. 整数网格下，为什么24已经最优

先明确模型：宽、高取正整数，左下角坐标也是整数，轴对齐、禁止旋转，A—E完整放入10×8外框且内部不重叠，A满足面积6和宽高比0.5到2。包围盒的宽是最大右边缘减最小x，高是最大上边缘减最小y，因此两者都是正整数。无重叠时，包围盒面积至少是模块面积和23。若面积恰为23，由于23是质数，整数边长只能是1×23或23×1；任一种都容不下固定2×2的C。因此面积23不可行，整数面积至少24。合法见证A=(0,0,2,3)、B=(2,0,2,3)、C=(4,0,2,2)、D=(0,3,3,1)、E=(4,2,2,2)达到6×4=24，下界与见证相等，才证明此整数模型的最优值是24。底层几何检查函数能处理小数；上述质数分解排除法不直接证明连续模型最优。A维持原来的3×2也存在面积24的合法布局，例如A=(0,0,3,2)、B=(4,1,2,3)、C=(0,2,2,2)、D=(3,0,3,1)、E=(2,2,2,2)。所以本例不证明软变形优于固定形状最优，也不证明所有改进路径都必须先变差。

## 算法步骤

```text
choose shape (w,h)
require w*h == 6 and 0.5 <= w/h <= 2
repack neighboring blocks
require completeness, containment, non_overlap
compare bounding_box_area with baseline
```

## 易错点

变窄不等于占地变少。面积固定时，宽度减少必须由高度增加补回来；冲突可能从右边转移到上边。

## 检查理解

1. A 从 3×2 改成 2×3，面积如何变化？

   A. 由 6 变 5
   B. 保持 6
   C. 变为 9
   D. 取决于摆放位置

   答案: B. 两种尺寸乘积都为 6。

2. A 变成 2×3，其他模块不动，撞到谁？

   A. B
   B. D
   C. E
   D. 没有冲突

   答案: B. D 占据 y=2 到 3 的一条带。

3. 1×6 面积也是 6，为什么不允许？

   A. 面积错误
   B. 宽高比超出界限
   C. 形状必须为正方形
   D. 不允许竖放模块

   答案: B. 1/6 小于宽高比下界 0.5。

4. 外框 10×8，五块面积和 23。死区和外框密度分别是多少？

   A. 57，28.75%
   B. 57，23%
   C. 53，28.75%

   答案: A. 80−23=57；23/80=0.2875。

5. E 在 x=9、宽 2，其余模块都在框内且互不重叠。这个布局合法吗？

   A. 合法
   B. 不合法，E 越界

   答案: B. 9+2=11>10；合法性要求每个模块都在框内，且互不重叠。

6. A=(0,0,2,3)，D=(0,2,3,1)，重叠面积是多少？

   A. 0
   B. 1
   C. 2
   D. 6

   答案: C. 共同横向区间0…2，宽2；纵向2…3，高1，所以为2。0误把内部交叠当贴边，6是A的总面积。

7. A变为2×3后，只把D移到(2,2)，为什么仍失败？

   A. 与B重叠
   B. A面积变大
   C. D越过右边界
   D. 只有贴边，检查器误报

   答案: A. B/D共享x=3…5、y=2…3，正面积为2。A面积仍6，D的右边缘5未越界。

8. D移到(2,3)后合法，包围盒变为36。应怎样评价？

   A. 合法就必然优于27
   B. 修复成功，但面积目标变差
   C. 密度28.75%证明最优
   D. 只要36大于23就非法

   答案: B. 合法性回答能否这样摆；36>27说明包围盒目标变差。固定外框密度不变，不能证明最优。

9. 从包围盒27压到24，哪个密度提高？

   A. 固定外框密度
   B. 包围盒密度
   C. 两者都提高
   D. 两者都不变

   答案: B. 23/80不变；23/27提高到23/24。分母决定了比例回答的问题。

10. 单独一块面积8、比例范围0.5≤w/h≤2，哪些整数形状允许？

   A. 只有2×4
   B. 只有4×2
   C. 2×4和4×2
   D. 1×8和8×1

   答案: C. 比例0.5和2都在包含端点的范围内；1/8和8超界。3×3也不行，因为面积为9。

## Python 练习

实现完整布局审计器 audit_layout(rows, integer=True, area=6, low=0.5, high=2)。rows每项为(id,x,y,w,h)。检查名称完整/重复/未知、有限正尺寸、A面积与比例、其它固定尺寸且禁旋转、整数网格、10×8包含及全部模块对的正面积重叠。返回legal、排序errors、bbox_area、packing_density、dead_space；非法布局后两项为None。错误码见下方接口说明，面积容差1e−8。

```python
import math

def audit_layout(rows, integer=True, area=6, low=0.5, high=2):
    # rows: [(id, x, y, width, height), ...]
    # errors: sorted strings, e.g. 'missing:E', 'overlap:A/D'.
    # Return {'legal': bool, 'errors': list, 'bbox_area': number_or_None,
    #         'packing_density': number_or_None, 'dead_space': number_or_None}
    # 1. Validate names/numbers and each shape contract.
    # 2. Check containment and every pair (shared edges are allowed).
    # 3. Subtract minima when computing the enclosing box.
    # 4. Only a legal layout has valid density/dead-space scores.
    raise NotImplementedError('Implement the full layout audit')

```

---
新教材：谭星宇，CC BY 4.0。原作贡献: xingguangyaoyu


