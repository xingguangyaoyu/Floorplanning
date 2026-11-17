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

Implement the complete layout auditor audit_layout(rows, integer=True, area=6, low=0.5, high=2). Each row is (id,x,y,w,h). Check missing, duplicate and unknown names; finite positive dimensions; A's area and aspect ratio; the other fixed dimensions with rotation forbidden; the integer grid; containment in 10×8; and positive-area overlap for every module pair. Return legal, sorted errors, bbox_area, packing_density and dead_space. The last two fields must be None for an infeasible layout. Error codes are specified below; the area tolerance is 1e−8.

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
