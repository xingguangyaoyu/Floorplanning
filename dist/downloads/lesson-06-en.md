# 06 · Sequence pairs & graphs

Why do coordinates use a maximum?

A sequence pair uses two permutations. If a pair has the same order in both, the earlier block goes left. If the order is reversed, the earlier block in pos goes below under this course’s convention. Turn relationships into inequalities and solve longest paths.

## State the vertical convention

If i precedes j in both orders, add horizontal edge i→j with xj≥xi+wi. If i precedes j in pos but follows it in neg, add vertical edge i→j with yj≥yi+hi. Other texts may reverse the vertical convention; keep inequalities and coordinates consistent.

## Take the maximum to satisfy every predecessor

A block can have several predecessors. Satisfying just one may collide with another. Thus xj=max(xi+wi) over horizontal predecessors, and similarly for y. Use the predecessor’s dimension because its occupied space must be cleared. pos is a topological order for both graphs.

## Same data, different representation

The reference ABCED / DABCE gives D(0,3) and box 9×4=36, while the reference B*-tree gives D(0,2) and area 27. These are two chosen encodings, not evidence that one representation is worse. Capability has to be judged by enumerating the encoding space: for these five fixed blocks and no rotation, the 5040 B*-tree packings and all 14400 sequence pairs contain an area-24 layout, while all 26880 slicing encodings bottom out at 25 with none at 24. Keep the two pieces of evidence apart: the 24 layout from the previous lesson has no through first cut, so that single layout cannot be written as a slicing tree; the claim that no slicing encoding reaches 24 rests on the complete enumeration above, not on one counterexample, and it does not extend to other sizes or other floorplanning models.

## Pseudocode

```text
validate_two_permutations(pos,neg)
for each ordered pair i,j in pos:
  if neg[i] < neg[j]: add_horizontal(i,j)
  else: add_vertical(i,j)
for j in pos:
  x[j] = max(x[i]+w[i] for horizontal predecessors)
  y[j] = max(y[i]+h[i] for vertical predecessors)
```

## Pitfall

Two complete permutations produce consistent, non-overlapping constraints. They do not check the fixed outline. Identical orders produce a row 12 wide.

## Check understanding

1. i precedes j in both permutations. i is…

   A. left
   B. below
   C. above

   Answer: A. The same order yields a horizontal constraint.

2. Two lower bounds for xj are 3 and 5. Minimum feasible xj?

   A. 3
   B. 5
   C. 8

   Answer: B. Both bounds must hold; take max=5.

3. Where is D in the reference sequence pair?

   A. (0,2)
   B. (0,3)
   C. (3,0)

   Answer: B. A,B,C,E precede D vertically; B reaches height 3.

## Python exercise

Implement the full decoder decode_sequence_pair(pos, neg, modules): validate both permutations, classify every ordered pair (same order -> horizontal, reversed -> vertical), then walk pos as a topological order taking the maximum of all predecessor bounds. Edge weight is the predecessor size. Return graph, order, coords, key predecessors and rows. Error code: permutation:pos / permutation:neg.

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
New material: Xingyu Tan, CC BY 4.0. Original contributor: Su3037
