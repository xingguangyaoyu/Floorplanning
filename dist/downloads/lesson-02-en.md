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
