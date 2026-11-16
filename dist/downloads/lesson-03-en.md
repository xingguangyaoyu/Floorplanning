# 03 · Area, deadspace & density

Why does moving blocks leave density unchanged?

The blocks sum to 23 and the fixed outline has area 80. Outline deadspace is 57 and outline density is 28.75%. Moving the blocks changes none of these. Compactness instead depends on the smallest enclosing rectangle. Always name the denominator.

## Get the accounting right

The block areas are 6,6,4,3,4, summing to 23. The 10×8 outline has area 80. A legal layout has outline deadspace 80−23=57 and density 23/80. The arithmetic can still run on an illegal layout, but it is not a valid occupancy report.

## The bounding box responds to placement

The reference layout has a 9×3 bounding box, area 27, with 4 empty units and about 85.19% packing density. A legal 6×4 layout has area 24 and 1 empty unit. Both retain the same outline density, so that metric cannot rank their compactness.

## Compactness is one objective

Real designs also need wiring, power, pins, timing and routing space. A smaller teaching bounding box is not a production sign-off. We compare area only under the same blocks, outline and rules, with an explicit objective.

## Pseudocode

```text
require legal(pack)
module_area = sum(w*h for each module)
outline_density = module_area / (W*H)
bbox = enclosing_rectangle(pack)
packing_density = module_area / bbox.area
```

## Pitfall

A whitespace budget γ=empty/module area differs from the empty/outline fraction. “15% whitespace” needs a denominator.

## Check understanding

1. Compact the same blocks inside 10×8. Outline density?

   A. 28.75%
   B. 85.19%
   C. 95.83%

   Answer: A. 23/80 does not depend on positions.

2. Empty area inside the reference 9×3 box?

   A. 57
   B. 4
   C. 23

   Answer: B. 27−23=4. The value 57 belongs to outline deadspace.

3. Reduce box area from 27 to 24. What changes?

   A. Total block area
   B. Outline density
   C. Packing density

   Answer: C. The denominator changes; total block area remains 23.

## Python exercise

Build a complete metrics report on top of the provided Lab2 validator: true extents, explicit denominators and legal-only scores.

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
New material: Xingyu Tan, CC BY 4.0. Original contributor: Original contributor (archive has no author credit)
