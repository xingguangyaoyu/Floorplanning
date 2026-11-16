# 05 · B*-tree & skyline

Does a right child sit directly on its parent?

A B*-tree places each block in a binary tree. A left child starts at its parent’s right edge; a right child shares its parent’s left edge. Height is not copied from the parent: the block rests on the highest skyline anywhere under its full width.

## Traversal order is part of the algorithm

Place a node, then its entire left subtree, then its right subtree. The reference A(B(C(E,-),-),D) visits A,B,C,E,D. Moving a right child ahead of the left subtree changes the skyline it sees.

## Swap A and C: who supports D?

In the reference, D is at (0,2), directly on A. Swap the names A and C. D still starts at x=0, but its width of 3 reaches across B, which is 3 high. D lands at y=3, not at C’s top of 2. Inspect the full footprint.

## A counterexample beats memorization

With fixed sizes and no rotation there are Catalan(5)×5!=5040 labelled binary trees. Enumeration finds 4680 that fit, no interior overlaps, and minimum box area 24. These are results for this five-block instance and these rules, not a general optimization guarantee.

## Pseudocode

```text
walk(node,x):
  y = maximum_skyline(x, x+node.width)
  place(node,x,y)
  raise_skyline(x,x+node.width,y+node.height)
  walk(node.left, x+node.width)
  walk(node.right,x)
```

## Pitfall

The reference alone cannot expose a parent-height shortcut: that example happens to work. Include counterexamples such as lift.

## Check understanding

1. After swapping A and C, what is D’s y?

   A. 2
   B. 3
   C. 0

   Answer: B. D’s footprint reaches B, whose top is 3.

2. Walk order of the reference tree?

   A. ABCDE
   B. ABCED
   C. ADBCE

   Answer: B. Finish the entire left subtree before D.

3. A B*-tree is non-overlapping. Must it fit 10×8?

   A. Yes
   B. No, it may still overflow

   Answer: B. Skyline packing avoids overlap but does not enforce outline fit.

4. Must a left child have the same y as its parent?

   A. Always
   B. No; y comes from the skyline

   Answer: B. A left child inherits x only. Its y is the highest skyline under its full width.

5. Total block area is 23. Across 5040 labelled trees, what is the smallest box area?

   A. 23
   B. 24
   C. 27

   Answer: B. Area 23 would require a 1×23 strip, too thin for B. The minimum is 6×4=24.

## Python exercise

Implement the full packer pack_bstar(tree, modules): preorder walk, left child at the parent right edge, right child at the parent x; each block lands on the highest skyline under its whole footprint [x,x+w). Split old segments, keep residuals, merge equal neighbours. Return order/coords/rows/contour/trace. Error codes: unknown:X, duplicate:X, missing:list. tree is nested (id,left,right) tuples; leaves may be (id,None,None) or the bare id string.

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
New material: Xingyu Tan, CC BY 4.0. Original contributor: Capeur
