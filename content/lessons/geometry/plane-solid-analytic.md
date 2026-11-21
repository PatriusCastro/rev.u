subject: math
area: Geometry
name: Plane, solid and analytic geometry
minutes: 14
order: 5

## Triangles
Three sides known: Heron's formula, with $s$ the half-perimeter.

$$A = \sqrt{s(s-a)(s-b)(s-c)}$$

Circles touching each other from outside: the distance between two centres is the sum of their radii.

## Quadrilaterals and circles
Cyclic quadrilateral (all corners on a circle), sides $a, b, c, d$: Brahmagupta's formula.

$$A = \sqrt{(s-a)(s-b)(s-c)(s-d)}$$

Two chords crossing inside a circle: $ab = cd$ (products of their pieces). From a point outside, tangent $t$ and secant: $t^2 = (\text{outside part})(\text{whole secant})$.

A line parallel to the bases $a$ and $b$ of a trapezoid that splits its area in half has length $\sqrt{\dfrac{a^2 + b^2}{2}}$.

## Regular polygons
$n$ sides of length $s$, apothem $a$ (radius of the inscribed circle), circumradius $R$:

$$A = \tfrac{1}{2}(ns)a = n a^2 \tan\dfrac{180°}{n} = \tfrac{1}{2} n R^2 \sin\dfrac{360°}{n}$$

$$s = 2R\sin\dfrac{180°}{n}$$

## Solids
- Cone or pyramid: $V = \tfrac{1}{3}A_{\text{base}}h$.
- Frustum of a cone: $V = \dfrac{\pi h}{3}(R^2 + Rr + r^2)$.
- Regular tetrahedron, edge $a$: $V = \dfrac{a^3\sqrt{2}}{12}$.
- Sphere: $V = \tfrac{4}{3}\pi R^3$. Segment of height $h$: $V = \dfrac{\pi h^2(3R - h)}{3}$. Zone of height $h$: $A = 2\pi R h$.
- Similar solids: lengths scale by $k$, areas by $k^2$, volumes by $k^3$. Water in a cone with the tip down is a smaller similar cone.

## Parabolas
With the vertex at the origin and opening up or down, use $y = ax^2$ and fit $a$ from one known point. In the form $x^2 = 4fy$, $f$ is the distance from vertex to focus. A dish of rim radius $r$ and depth $d$ has $f = \dfrac{r^2}{4d}$.

## Worked example
A parabolic arch spans 12 m and rises 6 m. How high is it 2 m from one foot?

- Put the vertex at the top: $y = -ax^2$. The feet are at $x = \pm 6$, $y = -6$, so $a = \dfrac{6}{36} = \dfrac{1}{6}$.
- 2 m from a foot is $x = 4$: $y = -\dfrac{16}{6} = -2.67$.
- Height above the ground: $6 - 2.67 = 3.33$ m.

## Common slips
- Measuring from the wrong place. Arch and dish formulas put $x = 0$ at the vertex, not at a support.
- Averaging the two end areas of a frustum. That overstates the volume; use $R^2 + Rr + r^2$.
- Scaling volume by the ratio of depths instead of its cube.
- Using the circumradius where the formula needs the apothem.
