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
