subject: math
area: Calculus
name: Rates, maxima and integrals
minutes: 15
order: 6

## Related rates
1. Name every quantity that changes with time. Write down the rates you know and the one you want.
2. Write one equation linking the quantities (Pythagoras, a volume formula, similar triangles).
3. Differentiate both sides with respect to $t$.
4. Only now substitute the numbers for the instant asked.

A ladder sliding down a wall: $x^2 + y^2 = L^2$ gives $x\dfrac{dx}{dt} + y\dfrac{dy}{dt} = 0$. A plane passing over a radar works the same way, with its altitude fixed.

## Maxima and minima
1. Write the quantity to optimise in terms of the variables.
2. Use the constraint (fixed perimeter, fixed area, fixed sheet size) to leave one variable.
3. Set the derivative to zero and solve.
4. Check the answer lies in the allowed range, and the endpoints if the range is closed.

For traffic, flow is $q = kv$. With a linear speed-density line $v = v_f\left(1 - \dfrac{k}{k_j}\right)$, the flow is largest at $k = \dfrac{k_j}{2}$, so $q_{max} = \dfrac{v_f k_j}{4}$.

## Work and fluid force
Cut the water into thin horizontal slices.

- Pumping: each slice has weight $\rho g A(y)\,dy$ and is lifted a distance $d(y)$ to the outlet. $W = \int \rho g\, A(y)\, d(y)\,dy$.
- Force on a vertical plate: the pressure at depth $h$ is $\rho g h$. $F = \int \rho g\, h\, w(h)\,dh$, where $w(h)$ is the plate width at that depth. This equals $\rho g \bar{h} A$, with $\bar{h}$ the depth of the centroid.

Use $\rho = 1000$ kg/m³ and $g = 9.81$ m/s², so $\rho g = 9810$ N/m³.

## Area, centroid and distance
- Area between curves: $A = \int_a^b (y_{top} - y_{bottom})\,dx$, with $a$ and $b$ where the curves meet.
- Centroid: $\bar{x} = \dfrac{1}{A}\int x\,(y_{top} - y_{bottom})\,dx$ and $\bar{y} = \dfrac{1}{A}\int \tfrac{1}{2}\left(y_{top}^2 - y_{bottom}^2\right)dx$.
- Distance travelled: $\int |v(t)|\,dt$. Split the interval where $v$ changes sign. Without the absolute value you get displacement.

## Worked example
A farmer fences a rectangular plot along a straight river with 240 m of fence. The river side needs no fence. Find the largest area.

- Let $x$ be each side perpendicular to the river. The side along the river is $240 - 2x$.
- $A = x(240 - 2x) = 240x - 2x^2$.
- $\dfrac{dA}{dx} = 240 - 4x = 0$, so $x = 60$ m and the river side is 120 m.
- $A = 60 \times 120 = 7200$ m².

## Common slips
- Substituting numbers before differentiating. A quantity that changes must stay a variable until after the derivative.
- Forgetting the sign of a rate. A length that is shrinking has a negative rate.
- Lifting every slice the same distance when pumping. Each slice travels from its own depth to the outlet.
- Taking displacement for distance. Find where the velocity is zero first.
