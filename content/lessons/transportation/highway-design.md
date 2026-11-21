subject: math
area: Transportation
name: Curves, sight distance and superelevation
minutes: 15
order: 10

## Simple horizontal curve
Two tangents meet at the PI with intersection angle $I$. The curve starts at the PC and ends at the PT.

- Degree of curve, 20 m arc basis: $D = \dfrac{1145.916}{R}$ ($D$ in degrees, $R$ in m). Check the basis in every problem: a 100 m arc gives $5729.578/R$.
- Tangent length: $T = R\tan\dfrac{I}{2}$
- Length of curve: $L_c = \dfrac{\pi R I}{180°} = \dfrac{20I}{D}$
- External distance (PI to midpoint of curve): $E = R\left(\sec\dfrac{I}{2} - 1\right)$
- Middle ordinate (midpoint of curve to midpoint of long chord): $M = R\left(1 - \cos\dfrac{I}{2}\right)$
- Long chord: $C = 2R\sin\dfrac{I}{2}$

## Stationing
Stations are written as km + m, so 10+250.00 is 10,250.00 m from the start.

$$\text{PC} = \text{PI} - T \qquad \text{PT} = \text{PC} + L_c$$

PT is found along the curve, not along the tangents, so $\text{PT} \ne \text{PI} + T$.

## Deflection angle
The angle at the PC between the back tangent and the chord to a point an arc length $s$ along the curve is half the central angle:

$$\delta = \dfrac{s}{2R}\ \text{rad} = \dfrac{sD}{40}\ \text{(degrees, 20 m basis)}$$

## Superelevation and minimum radius
With $v$ in km/h and $R$ in m:

$$e + f = \dfrac{v^2}{127R} \qquad R_{min} = \dfrac{v^2}{127(e_{max} + f)}$$

$e$ is the cross slope (m/m) and $f$ the side friction factor.

## Stopping sight distance
Perception-reaction distance plus braking distance, with $t$ in s and grade $G$ as a decimal (plus uphill, minus downhill):

$$S = \dfrac{vt}{3.6} + \dfrac{v^2}{254(f \pm G)}$$

A downgrade makes braking longer: use $f - G$.

## Symmetrical parabolic vertical curve
Grades $g_1$ and $g_2$ in decimal, length $L$ measured horizontally, PVI at mid-length. From the PVC at distance $x$:

$$y = y_{PVC} + g_1x + \dfrac{g_2 - g_1}{2L}x^2$$

- Lowest or highest point: $x = \dfrac{-g_1 L}{g_2 - g_1}$
- Rate of change of grade $r$ per station: $L = \dfrac{g_2 - g_1}{r} \times$ (station length)
- Crest sight distance, when $S < L$: $L = \dfrac{AS^2}{658}$ with $A = |g_2 - g_1|$ in percent. The constant depends on eye and object heights, so use the one the problem gives.

## Worked example
A curve has $R = 400$ m and $I = 30°$, with the PI at 3+500.00. Find the PT station.

- $T = 400\tan 15° = 107.18$ m, so PC = 3+392.82.
- $L_c = \pi(400)(30)/180 = 209.44$ m.
- PT = 3+392.82 + 209.44 = 3+602.26.

## Common slips
- Using the full $I$ instead of $I/2$ in $T$, $E$ and $M$.
- Adding $T$ to the PI to get the PT.
- Mixing the 20 m and 100 m arc bases for $D$.
- Plugging $v$ in m/s into a formula built for km/h.
- Forgetting the reaction distance, or the sign of the grade, in stopping sight distance.
- Using grades as decimals where $A$ must be in percent.
