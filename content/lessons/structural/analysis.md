subject: struct
area: Structural
name: Indeterminate beams, influence lines and frames
minutes: 15
order: 6

## Propped cantilever, uniform load
Fixed at one end, roller at the other, span $L$, uniform load $w$:

- Roller reaction $R = \dfrac{3wL}{8}$. Fixed-end reaction $\dfrac{5wL}{8}$.
- Fixed-end moment $M = \dfrac{wL^2}{8}$ (hogging).
- Largest sagging moment $\dfrac{9wL^2}{128}$, at $\dfrac{3L}{8}$ from the roller.

## Fixed–fixed beam
- Uniform load $w$: end moments $\dfrac{wL^2}{12}$, midspan moment $\dfrac{wL^2}{8} - \dfrac{wL^2}{12} = \dfrac{wL^2}{24}$.
- Point load $P$ at midspan: end moments $\dfrac{PL}{8}$, midspan moment $\dfrac{PL}{4} - \dfrac{PL}{8} = \dfrac{PL}{8}$.

## Two equal spans, uniform load
Two spans $L$ each on three simple supports, $w$ on both spans:

- End reactions $0.375wL$, middle reaction $1.25wL$.
- Moment over the middle support $\dfrac{wL^2}{8}$ (hogging).

## Moment distribution
1. Lock every joint and write the fixed-end moments.
2. Member stiffness $K = \dfrac{4EI}{L}$ when the far end is fixed. Distribution factor $DF = \dfrac{K}{\sum K}$ at the joint.
3. Release the joint: distribute the unbalanced moment, with opposite sign, by the DFs.
4. Carry half of each distributed moment to the far fixed end (carry-over factor $\tfrac{1}{2}$).

When the middle joint is the only free joint and both far ends are fixed, one cycle gives the exact answer.

## Influence lines, simple beam
- Reaction at the left support: a straight line from 1 at that support to 0 at the other. Area $\dfrac{L}{2}$.
- Midspan moment: a triangle with peak $\dfrac{L}{4}$ at midspan. Area $\dfrac{L^2}{8}$.
- Effect = (point load × peak ordinate) + (uniform load × area under the loaded part).

## Two-axle moving load
The absolute maximum moment occurs under the heavier axle when midspan bisects the distance between that axle and the resultant of both axles.

## Cantilever deflection
Tip deflection: $\dfrac{PL^3}{3EI}$ for a tip load, $\dfrac{wL^4}{8EI}$ for a uniform load. They add.

## Determinacy
- Beam: compare the unknown reactions $r$ with 3 equations (plus 1 for each internal hinge).
- Plane truss: compare $b + r$ with $2j$. Less: unstable. Equal: determinate, if the layout is stable. More: indeterminate to the degree $b + r - 2j$.

## Worked example
A fixed–fixed beam spans 6 m and carries 10 kN/m.

- End moments $\dfrac{10(6)^2}{12} = 30$ kN·m, hogging.
- Midspan moment $\dfrac{10(6)^2}{24} = 15$ kN·m, sagging.

## Common slips
- Mixing up $\dfrac{wL^2}{8}$ (propped or simple) and $\dfrac{wL^2}{12}$ (fixed–fixed).
- Taking the middle reaction of a two-span beam as $wL$ instead of $1.25wL$.
- Forgetting the carry-over, or carrying the full moment instead of half.
- Multiplying the uniform load by the span instead of the area of the influence line.
- Using simple-beam deflection formulas for a cantilever.
- EI in kN·m²: E in GPa × 10⁶ gives kPa, I in mm⁴ × 10⁻¹² gives m⁴.
