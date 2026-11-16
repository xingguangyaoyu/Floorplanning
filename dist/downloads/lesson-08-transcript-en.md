# Soft blocks: from shape constraints to stepwise repacking

9 chapters · 48 narration cues · concise full teaching edition


## 1. Soft blocks: what may change?

1. A has fixed area six. Does making it narrower necessarily improve the placement?

2. Early planning models some logic regions as rectangles with fixed area and adjustable shape: soft blocks.

3. Fixed memory macros cannot stretch arbitrarily; only A may reshape in this example.


## 2. Write the shape contract

1. A’s width and height must be positive, and their product must remain six.

2. Aspect ratio means width divided by height, not the reverse.

3. The allowed aspect ratio is from one half to two, including both endpoints.

4. The original three-by-two shape has area six and aspect ratio one point five, so it is allowed.

5. Two by three also has area six; its aspect ratio is about zero point six seven, within the bounds.

6. On an integer grid, first list every positive integer factor pair of six.

7. One by six is too tall; six by one is too wide, so both fail the aspect-ratio limits.

8. Removing those extremes leaves two by three and three by two for this integer experiment.

9. A continuous model also allows noninteger dimensions; choose a positive width and calculate height as six divided by width.


## 3. Measure the baseline placement

1. The origin is the lower-left corner; x increases rightward and y increases upward.

2. A starts at the origin, three by two; D starts at zero, two, three by one, touching A’s top edge.

3. The legal box is nine by three: area twenty-seven, minus block area twenty-three, leaves four empty units.

4. The fixed outline is ten by eight, with area eighty; it is different from the bounding box.


## 4. Reshaping, overlap, and boundary contact

1. Now change only A to two by three, while leaving every other block in place.

2. Will the placement remain legal after A narrows? First predict where its top edge will end.

**Pause and predict:** A becomes 2×3; neighbors stay fixed. What happens?

3. Watch A’s right edge retreat while its top rises from two to three.

4. The new A spans x from zero to two; D spans zero to three, so their horizontal intervals overlap.

5. Their shared vertical interval is two to three, giving overlap height one and overlap area two.

6. When rectangles only share a boundary, an overlap dimension is zero, so touching is allowed.

7. Repair the conflict first; compare bounding boxes only after confirming legality.


## 5. Repair first; optimize afterward

1. Try a local repair by moving D two grid units to the right.

2. D no longer covers A, but it now enters B’s space, so the repair is incomplete.

3. Move D up one unit to y equals three, touching B without overlapping A or B.

4. However, the top reaches four while the right edge stays nine, so bounding-box area increases to thirty-six.


## 6. Repack one block at a time

1. Keep A at two by three and move B left one unit until it touches A’s right edge.

2. Next, move C left one unit to touch B’s right edge.

3. Move D to four, two: its bottom touches C, and its left edge touches B.

4. The new placement again has a nine-by-three box with area twenty-seven, matching the baseline.

5. To shrink the box further, which block still determines the rightmost edge?

**Pause and predict:** Which block still extends the right boundary to x=9?


## 7. Compact again, explaining each move

1. First move D to zero, three, freeing the space above C.

2. The box temporarily grows at this intermediate step; do not confuse an intermediate move with the final result.

3. Move E to four, two, above C and right of B, without covering D.

4. The rightmost edge is now six and the top is four, giving a six-by-four box with area twenty-four.

5. Total block area remains twenty-three, leaving only one unoccupied unit inside this legal bounding box.


## 8. Two densities, two questions

1. The outline stays eighty, so fixed-outline density remains twenty-three over eighty, or twenty-eight point seven five percent.

2. Packing density uses a different denominator; the baseline is twenty-three over twenty-seven, about eighty-five point two percent.

3. After compaction, packing density becomes twenty-three over twenty-four, about ninety-five point eight percent.

4. Whenever you report a density, state which rectangle supplies the denominator.

**Pause and predict:** Which density increased after compaction?

5. Twenty-four is a verified legal witness here, not a universal result for soft-block problems.


## 9. Transfer the method to a new case

1. Consider a new block of area eight, with the same aspect-ratio bounds from one half to two.

2. Do two by four and four by two pass the shape check? Calculate both area and aspect ratio.

**Pause and predict:** For area 8 with inclusive ratio bounds, which shapes are allowed?

3. Both shapes are allowed: each has area eight, and their aspect ratios equal the two permitted endpoints.

4. Return to the five-block lab: keep A at two by three, repair overlaps, then try reaching box area twenty-four.

5. In code, check positive dimensions, area tolerance, and aspect ratio before running the placement checks.

6. Keep the complete process: choose a shape, repack neighbors, check legality, and then compare the stated objective.

