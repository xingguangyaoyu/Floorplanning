# 04 · Slicing trees & postfix

How do letters, H and V become rectangles?

A slicing representation recursively combines two regions. Leaves are blocks and internal nodes specify full cuts. Postorder produces a postfix expression that a stack can reconstruct. Structure describes relationships; combination rules compute the coordinates.

## Fix the H/V convention

Here H names a horizontal cut: first region below second, maximum width and summed heights. V names a vertical cut: first left of second, summed widths and maximum height. The letter names the cut, not a movement direction.

## The first pop is the second child

Push A, then D. At H, pop D first and A second: A goes below D, yielding 3×3. Continue with B V C V E V to obtain 9×3. Reversing the popped operands changes the layout.

## Not every arrangement is slicing

A single stack item proves only that the combinations reduce to one region. Check block completeness and outline containment separately. Some pinwheel arrangements have no first through-cut avoiding all interiors, so slicing trees cannot represent them.

## Pseudocode

```text
for token in postfix:
  if block: push(block)
  else:
    second = pop(); first = pop()
    push(combine(first, second, token))
require one_region and every_block_once
check_geometry(result)
```

## Pitfall

A syntactically valid expression can overflow. Change the reference’s first H to V and the row becomes 12 wide, exceeding the outline width of 10.

## Check understanding

1. A is 3×2; D is 3×1. Size of A D H?

   A. 3×3
   B. 6×2
   C. 3×2

   Answer: A. H takes max(3,3) for width and 2+1 for height.

2. Push A then D. Who is popped first at H?

   A. A
   B. D

   Answer: B. Last in, first out. D is the second child.

3. Does one final stack item guarantee outline fit?

   A. Yes
   B. No, geometry still needs checking

   Answer: B. Structure and geometry are separate checks.

## Python exercise

Implement the full decoder decode_postfix(tokens, catalog): parse the postfix expression, build the slicing tree, aggregate sizes bottom-up and propagate coordinates top-down. Helpers combine and the Lab2 validate_layout are provided. Convention: H places the first region below the second; V places the first left of the second; the first pop is the second region. Error codes: underflow:X, leftover:N, unknown:X, duplicate:X, missing:list.

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
New material: Xingyu Tan, CC BY 4.0. Original contributor: GateUltra
