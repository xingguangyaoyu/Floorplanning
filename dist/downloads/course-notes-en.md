# Floorplanning Studio

From constraints to representations to search. Shared conventions: lower-left origin; width×height; 10×8 outline; A–E total area 23.

# 02 · Fixed outline & legality

Do touching edges count as overlap?

Think of the chip outline as a box whose size is already fixed. Every rectangular block must appear exactly once, remain inside the box and avoid overlapping another block. A neat-looking drawing is not proof. Establish these checks before comparing quality.

## Three separate questions

Completeness checks the IDs: A through E exactly once. Containment checks x≥0, y≥0, x+w≤10 and y+h≤8. Non-overlap checks every pair of interiors. An area sum of 23 does not prove that all blocks are present or separate.

## Contact is not overlap

C ends at x=7 and E starts at x=7. They share a boundary line with zero area. Move E to x=6 and their interiors share a 1-by-2 region. The overlap test uses strict inequalities so touching edges remain legal.

## Make errors actionable

An “illegal” badge alone does not explain the repair. Report “E crosses the right boundary” or “C overlaps E.” The lab lets you make mistakes, highlights the actual blocks and recomputes after every change.

## Pseudocode

```text
for each required id: require exactly one occurrence
for each block: require inside_outline(block)
for each pair (a,b): require no_positive_area_overlap(a,b)
return all_checks_pass
```

## Pitfall

Counting blocks is insufficient. A,A,C,D,E still contains five entries but duplicates A and omits B. Check IDs and their multiplicity.

## Check understanding

1. E starts at x=9 and is 2 wide. Where is its right edge?

   A. 10
   B. 11
   C. 9

   Answer: B. 9+2=11, beyond the outline at 10.

2. C ends at x=7; E starts at x=7.

   A. Legal contact
   B. Positive-area overlap
   C. Always overflow

   Answer: A. A shared edge has zero area. The other boundaries still need checking.

3. Does A,A,C,D,E pass completeness?

   A. Yes, five blocks
   B. No: B is missing and A repeats

   Answer: B. Each required ID must occur exactly once.

4. The checker tests containment and overlap. How many must pass together?

   A. 只查包含性
   B. 两项都通过
   C. 取决于模块顺序

   Answer: B. Either failure rejects the layout. Legality is a gate, not a score.

5. An overlapping layout still computes 28.75% density. Is that a valid occupancy report?

   A. 能，数值算出来了
   B. 不能，先修合法性
   C. 只看密度就够

   Answer: B. Metrics are meaningful only after containment and non-overlap both pass.

## Python exercise

Implement a complete hard-module layout validator. Check identity, finite positive dimensions, fixed shapes, containment and every module pair; report all errors and actual intersection areas.

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
New material: Xingyu Tan, CC BY 4.0. Original contributor: muranfei


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

4. Outline 10×8, total block area 23. What is the outline deadspace?

   A. 57
   B. 23
   C. 80

   Answer: A. 80−23=57: unused area inside the fixed outline.

5. Move blocks inside the same outline; areas stay fixed. Outline density…

   A. stays the same
   B. increases
   C. decreases

   Answer: A. Numerator and denominator are unchanged. Packing density may change.

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

4. One final stack item remains. Does that prove each block appears exactly once?

   A. Yes
   B. No, completeness still needs checking

   Answer: B. Reduction to one region proves structure, not uniqueness or completeness.

5. Can some layouts have no valid first through-cut?

   A. No
   B. Yes, a pinwheel is one example

   Answer: B. Without a first through-cut, the layout is non-slicing. That is the limit of slicing trees.

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

4. A block has several left predecessors. Which xj do you take?

   A. The smallest bound
   B. The largest bound
   C. Any one

   Answer: B. Every predecessor must be cleared, so take the maximum xi+wi.

5. Two complete permutations decode without overlap. Do they also guarantee fitting 10×8?

   A. Yes
   B. No; outline fit is separate

   Answer: B. The pair only fixes relative order; containment is still a separate check.

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


# 07 · Simulated annealing

Why accept a temporarily worse layout?

A representation encodes a layout; search chooses among encodings. Here a neighbor swaps two names in one permutation. Energy is bounding-box area plus an overflow penalty. Each proposal may be accepted or rejected, while the best legal solution is stored separately.

## Make the energy explicit

The teaching energy is box area +100×(width overflow+height overflow). It excludes wirelength, timing and congestion. Sequence-pair decoding prevents overlap. Overflowing candidates can be explored but cannot become the best legal solution.

## Acceptance probability is not success probability

Let ΔE=candidate−current energy. Accept non-increasing moves. Otherwise use p=exp(−ΔE/T), draw u in [0,1), and accept when u<p. Higher temperature tolerates the same uphill move more often. Cooling makes the search more selective; it does not guarantee an optimum.

## Reproduce a search

Reproduction needs the input, neighbor rule, RNG, seed, temperature, cooling rate and step count. One attractive run does not establish reliability. Compare settings under the same budget and distinguish individual runs from repeated-run statistics.

## Pseudocode

```text
current = decode(initial_pair); best_legal = None
repeat for a fixed budget:
  candidate = decode(random_swap(current_pair))
  delta = E(candidate)-E(current)
  accept if delta<=0 or random()<exp(-delta/T)
  update best_legal if current is legal and better
  T = T*cooling
```

## Pitfall

The current solution may get worse. Do not label current energy as best-so-far. The best legal area never increases.

## Check understanding

1. ΔE=4. Raise T from 1 to 10. Acceptance probability…

   A. increases
   B. decreases
   C. stays constant

   Answer: A. exp(−4/10) exceeds exp(−4).

2. Accept a worse candidate. Overwrite the best-so-far?

   A. Yes
   B. No

   Answer: B. Acceptance updates current; the incumbent changes only for a better legal layout.

3. Does a fixed seed guarantee global optimality?

   A. Yes
   B. No, it helps reproducibility

   Answer: B. The seed controls the random trajectory, not an optimality guarantee.

4. ΔE stays positive. Lower the temperature. The chance of accepting the worse candidate…

   A. increases
   B. decreases
   C. stays the same

   Answer: B. p=exp(−ΔE/T); a smaller T makes the exponent more negative, so p falls.

5. When is the best legal solution updated?

   A. On every acceptance
   B. When the current solution is legal and better
   C. When the current solution gets worse

   Answer: B. Acceptance changes the current solution. The incumbent changes only for a better legal layout.

## Python exercise

Implement the generic annealing state machine anneal(initial, neighbor, decode, score, feasible, rng, schedule, budget): current/candidate/best-legal are stored separately; accept downhill always and uphill when u < exp(-delta/T); a rejected candidate must not touch current; the best legal solution only improves; the log records T, candidate energy, delta, u, acceptance, current and best energy per step; exactly budget evaluations. The Lab6 decoder and score/feasible/neighbor/rng/schedule builders are provided - the state machine is yours.

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
New material: Xingyu Tan, CC BY 4.0. Original contributor: thy031


# 08 · Soft module sizing

A becomes narrower. Why does the layout become illegal?

Hard blocks have fixed dimensions. In this teaching model a soft block keeps its area but can change shape. A has area 6 and aspect ratio w/h between 0.5 and 2. Making it narrower also makes it taller, so recheck its neighbors. The full loop is reshape, repack, evaluate.

## 1. Establish what may change

A soft block is an early-planning abstraction: its area is specified while its dimensions can vary within stated limits. This does not mean that every finished circuit can be stretched freely. A hard block has dimensions determined by an existing implementation. In this example, only A may reshape. B, C, D, and E keep their given dimensions. No block may gain or lose area simply to make the picture look better. Describe a shape using width w and height h, and describe its position using lower-left coordinates (x,y). These are separate decisions. A shape checker can examine A without reading any neighbor coordinates. A placement checker must examine the complete set of rectangles. Consequently, an allowed new shape can still produce an illegal placement at the old coordinates. Always record which dimensions changed and which coordinates changed before interpreting the result.

## 2. Enforce area and aspect ratio together

A must satisfy w>0, h>0, wh=6, and 0.5≤w/h≤2. Keep the definition of aspect ratio consistent: width divided by height. The original 3×2 shape has area 6 and ratio 1.5. The alternative 2×3 shape also has area 6 and ratio about 0.667. Both satisfy the shape contract. However, 1×6 has ratio about 0.167, and 6×1 has ratio 6. Correct area does not rescue either extreme. Implement the checks in a deliberate order. Reject nonpositive dimensions before division, then check area with an explicit numerical tolerance, and finally check the inclusive ratio bounds. Use full numerical precision internally. A displayed ratio such as 0.67 is a rounded label, not a replacement for the actual ratio. Passing these shape checks says nothing about overlap, completeness, or outline containment.

## 3. Separate integer and continuous models

The integer experiment requires both dimensions to be positive integers. Enumerate the factor pairs of 6 and then apply the ratio bounds; only 2×3 and 3×2 remain. A continuous model permits noninteger dimensions and therefore has many more candidates. If width is selected first, use h=6/w. Substitution gives 0.5≤w²/6≤2, or √3≤w≤√12. These continuous bounds explain why width cannot approach zero or grow without limit. The animation varies width and calculates height from the fixed area, so intermediate frames also preserve area. Those intermediate dimensions illustrate a continuous transition; they are not extra buttons in the integer lab. Independently interpolating or rounding both dimensions generally changes the product. If a physical or software implementation requires discrete dimensions, apply its discretization rule and run the complete shape check again rather than assuming feasibility survives rounding.

## 4. Read occupied intervals from coordinates

Coordinates use a lower-left origin, with x increasing rightward and y upward. A rectangle (x,y,w,h) occupies horizontal interval [x,x+w] and vertical interval [y,y+h]. Initially A=(0,0,3,2) and D=(0,2,3,1). A’s top and D’s bottom both lie at y=2, so they share a boundary without sharing interior area. The other blocks are B=(3,0,2,3), C=(5,0,2,2), and E=(7,0,2,2). The rightmost edge is 9 and the highest edge is 3. Because both minimum coordinates are zero here, the baseline bounding box is 9×3=27. In the general formula, subtract minimum x from maximum right edge and minimum y from maximum top edge. Multiplying only the maximum edges incorrectly makes bounding-box area depend on translation. Coordinate intervals also provide a direct way to justify contact and overlap.

## 5. Calculate the collision area

After A becomes (0,0,2,3), its shared horizontal interval with D runs from 0 to 2. Their shared vertical interval runs from 2 to 3. The overlap area is therefore 2×1=2. Both shared lengths must be positive for an interior overlap. In general, overlap width is max(0,min(x1+w1,x2+w2)−max(x1,x2)); compute height the same way and multiply them. If either length is zero, the rectangles only touch along an edge or at a corner. A’s total area did not increase. Its occupied region moved upward as its width decreased, which is exactly why the old neighbor became a conflict. A useful checker identifies A and D and gives the reason. Replace the vague intuition that narrower means safer with explicit horizontal and vertical interval checks; the same method then transfers to other dimensions and coordinates.

## 6. A local repair can create another conflict

Moving D from (0,2) to (2,2) removes the A/D collision but creates a B/D collision. The new shared region spans x=3…5 and y=2…3. Checking only the original conflicting pair would miss this new failure. Recheck the complete placement after each edit. Moving D again to (2,3) puts its bottom against B’s top and restores legality. Yet the box becomes 9×4=36, which is larger than the baseline 27. The checker is not contradicting itself. Repair asks whether a placement satisfies the constraints; optimization compares a stated objective among feasible placements. Both questions matter. The animated motion illustrates a change between endpoint placements, not a proof that a physical transport path remains collision-free. During motion, the interface withholds a final legality result and evaluates the settled endpoint. Use the final coordinates to explain the judgment.

## 7. Explain each repacking decision

Starting from the legal but loose placement, move B to (2,0), touching A. Move C to (4,0), touching B. Then place D at (4,2), above C, right of B, and left of E. Check D against all three neighbors and confirm that the contacts have zero overlap area. This placement returns to 9×3=27. It is legal, but reshaping and repacking have not yet beaten the baseline. To improve further, identify which block determines the limiting boundary. E starts at (7,0) and has width 2, so its right edge fixes the current width at 9. Reducing the box width requires finding a destination for E farther inward. This reasoning is more useful than memorizing a set of special coordinates: inspect the boundary, identify the responsible block, and arrange its neighbors to make a feasible destination.

## 8. Make room before moving E inward

Move D to (0,3) first. This frees a 2×2 destination above C. E still extends to the right, so the intermediate box temporarily has area 36. An intermediate edit is not the final optimization result. Next move E from (7,0) to (4,2). It touches C’s top and B’s right edge without sharing interior space with D. The maximum right edge is now 6 and the maximum top edge is 4, giving 6×4=24. Total block area remains 23, so this legal box contains one empty unit, located at x=3…4 and y=3…4. Call this a verified legal witness with area 24. The lesson does not prove a global optimum over all continuous soft shapes, and this witness does not establish results for different blocks, connections, or placement constraints.

## 9. State the denominator when reporting density

The outline has area 80 and the blocks have total area 23, giving fixed-outline density 23/80=28.75%. This ratio is identical for legal placements with the same total area and outline. It cannot demonstrate that compaction succeeded. Packing density instead divides by the current bounding-box area, changing from 23/27≈85.19% to 23/24≈95.83%. The two ratios answer different questions. An illegal placement still permits the arithmetic expression 23/80, but that expression is not a certificate that constraints passed. Also, adding block areas does not equal occupied union area when blocks overlap. Confirm non-overlap before interpreting box area minus 23 as empty area. The fixed outline has 57 unoccupied units in any legal placement here, while the compact bounding box has only 1. Name the reference rectangle each time so that different kinds of empty area are not silently conflated.

## 10. Transfer the checks to another example

For a separate block of area 8 with inclusive ratio bounds 0.5 and 2, enumerate 1×8, 2×4, 4×2, and 8×1. Filtering leaves 2×4 and 4×2. Their ratios are exactly the allowed endpoints, so code must not replace inclusive comparisons with strict ones. A visually tidy 3×3 shape fails because its area is 9. Return to the shared five-block lab and independently keep A at 2×3 while repairing every conflict. Then attempt a legal box of area at most 24. Record the shape, all coordinates, legality, and box area, and explain the key moves rather than submitting only a green screenshot. Viewing an answer, loading a demonstration, and solving independently are different outcomes. Finally, remember that real designs also involve wirelength, routing congestion, and other objectives. Geometric compactness in this small instance does not replace those additional checks.

## 11. Separate the Python checks

The Python function valid_shape checks one rectangle, not the positions of all five blocks. For zero width or height, return False before performing division. Use an explicit small tolerance for the area product, then test the lower and upper ratio bounds. Include ordinary positive examples such as 2×3 and 3×2, but also wrong-area examples, an excessively tall shape, and zero width. Add the area-8 endpoint cases 2×4 and 4×2. A suite containing only successful shapes cannot reveal a function that always returns True. After the shape function passes, submit its dimensions to the separate placement checker, which examines names, containment, and every pair of modules. The browser’s stop button and time limit control execution; they do not establish correctness. Passing the available tests supports those cases, and you should still explain why each condition is required.

## 12. Evidence for an independent solution

Keep your own inputs and the important edits while working through the lab. First filter shapes, then create and explain one collision using intervals, and finally repair it and compare the box. The extended challenge keeps A at 2×3, requires a complete legal placement, and targets box area at most 24. Different edit sequences are acceptable; you do not need to imitate the animation’s movement path. If you use a hint or reveal an answer, record that honestly rather than treating the displayed solution as an independent result. Your explanation should identify one actual failure, justify one repair, and name the metric that improved. When 28.75% remains unchanged, explain that its denominator is the fixed outline area 80. These observations, together with the final coordinates and checker result, provide stronger evidence of understanding than a final screenshot alone.

## 13. Why 24 is optimal on the integer grid

Fix the model first: positive integer dimensions, integer lower-left coordinates, axis alignment, no rotation, all five blocks inside the ten-by-eight outline without interior overlap, and A with area six and ratio between one half and two. Bounding-box width is the maximum right edge minus minimum x; height is defined analogously, so both are positive integers. Non-overlap gives an area lower bound of twenty-three. Since twenty-three is prime, a box of that exact area with integer sides can only be one by twenty-three or twenty-three by one. Neither contains the fixed two-by-two C. Thus integer box area is at least twenty-four. The legal witness A=(0,0,2,3), B=(2,0,2,3), C=(4,0,2,2), D=(0,3,3,1), E=(4,2,2,2) has box six by four, attaining that bound. This proves optimality only for the stated integer model; the checker also accepts decimal inputs, where this factorization argument is insufficient. Keeping A at three by two also permits area twenty-four: A=(0,0,3,2), B=(4,1,2,3), C=(0,2,2,2), D=(3,0,3,1), E=(2,2,2,2). Hence this example establishes neither a benefit over the best fixed-shape solution nor a necessary temporary worsening on every improvement path.

## Pseudocode

```text
choose shape (w,h)
require w*h == 6 and 0.5 <= w/h <= 2
repack neighboring blocks
require completeness, containment, non_overlap
compare bounding_box_area with baseline
```

## Pitfall

Narrower does not mean less area. At fixed area, reduced width requires greater height. A collision can move from the side to the top.

## Check understanding

1. A changes from 3×2 to 2×3. Its area…

   A. drops from 6 to 5
   B. stays 6
   C. becomes 9
   D. It depends on the position

   Answer: B. Both products equal 6.

2. A becomes 2×3; others stay still. It collides with…

   A. B
   B. D
   C. E
   D. No conflict

   Answer: B. D occupies the strip from y=2 to 3.

3. 1×6 also has area 6. Why is it disallowed?

   A. Wrong area
   B. Aspect ratio outside bounds
   C. Must be square
   D. Tall blocks are forbidden

   Answer: B. 1/6 is below the lower aspect bound of 0.5.

4. Outline 10×8, block area 23. What are deadspace and outline density?

   A. 57，28.75%
   B. 57，23%
   C. 53，28.75%

   Answer: A. 80−23=57; 23/80=0.2875.

5. E starts at x=9 and is 2 wide; all other checks pass. Is the layout legal?

   A. Legal
   B. Illegal: E crosses the boundary

   Answer: B. 9+2=11>10. Legality requires both containment and non-overlap.

6. A=(0,0,2,3), D=(0,2,3,1). What is their overlap area?

   A. 0
   B. 1
   C. 2
   D. 6

   Answer: C. Shared width is 2 and height is 1, giving 2. Zero confuses overlap with contact; 6 is A’s full area.

7. After A becomes 2×3, why does moving D only to (2,2) still fail?

   A. It overlaps B
   B. A’s area increased
   C. D exceeds the right boundary
   D. Only contact; the checker is wrong

   Answer: A. B and D share x=3…5 and y=2…3, area 2. A still has area 6; D’s right edge 5 is inside the outline.

8. D at (2,3) restores legality but gives box area 36. How should it be judged?

   A. Legal always beats area 27
   B. Successful repair, worse area objective
   C. Density 28.75% proves optimality
   D. Any box above area 23 is illegal

   Answer: B. Legality asks whether placement is allowed. Since 36>27, the box objective worsened. Fixed-outline density does not prove optimality.

9. Compacting the box from 27 to 24 increases which density?

   A. Fixed-outline density
   B. Packing density
   C. Both
   D. Neither

   Answer: B. 23/80 stays fixed, while 23/27 increases to 23/24. The denominator determines what the ratio measures.

10. For a separate area-8 block with 0.5≤w/h≤2, which integer shapes are allowed?

   A. Only 2×4
   B. Only 4×2
   C. 2×4 and 4×2
   D. 1×8 and 8×1

   Answer: C. Ratios 0.5 and 2 are included endpoints. Ratios 1/8 and 8 fail. A 3×3 shape also fails because its area is 9.

## Python exercise

Implement a complete layout auditor: names, finite positive dimensions, shape contracts, integer grid, containment, all-pairs overlap, true bounding box, and legal-only scores. Return the specified report; do not substitute a single shape check.

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
New material: Xingyu Tan, CC BY 4.0. Original contributor: xingguangyaoyu


