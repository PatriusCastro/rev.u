subject: math
area: Surveying
name: Traverses, areas and earthwork
minutes: 15
order: 9

## Bearings and azimuths
A bearing is an angle of 0° to 90° from north or south, toward east or west, such as N 35°20′ E. An azimuth is measured clockwise from 0° to 360°. Always check the reference: most problems use north, but some (older Philippine practice) use south. Azimuth from south = azimuth from north ± 180°.

- Back bearing: swap both letters, keep the angle. N 35°20′ E becomes S 35°20′ W.
- Back azimuth: add or subtract 180°.
- Next line from an angle at a station: azimuth of BC = azimuth of BA + clockwise angle from BA to BC.
- A closed traverse of $n$ sides has interior angles summing to $(n-2)180°$.

## Magnetic declination
Declination is the angle from true north to magnetic north. With an east declination, true bearing = magnetic + declination for NE and SW lines. With a west declination, subtract. Draw a quick sketch of the two norths when unsure.

## Latitudes and departures
For a course of length $L$ and bearing angle $\theta$:

$$\text{Lat} = L\cos\theta \qquad \text{Dep} = L\sin\theta$$

North and east are positive, south and west negative. For a closed traverse, $\sum\text{Lat} = 0$ and $\sum\text{Dep} = 0$, which lets you find one missing side.

## Error of closure
$$\text{LEC} = \sqrt{\left(\sum\text{Lat}\right)^2 + \left(\sum\text{Dep}\right)^2} \qquad \text{Relative precision} = \dfrac{1}{P/\text{LEC}}$$

where $P$ is the perimeter. Compass rule: each course's correction is proportional to its length, with sign opposite the error.

$$c_{\text{dep}} = -\sum\text{Dep}\cdot\dfrac{L}{P}$$

## Areas
By coordinates (shoelace), listing the corners in order:

$$A = \tfrac{1}{2}\left|\sum (x_i y_{i+1} - x_{i+1} y_i)\right|$$

By DMD: the DMD of the first course is its departure; each next DMD = previous DMD + previous departure + this departure. Then $2A = \left|\sum \text{DMD}\times\text{Lat}\right|$.

From offsets $y_0 \dots y_n$ at equal spacing $d$:

$$A_{\text{trap}} = d\left(\dfrac{y_0 + y_n}{2} + y_1 + \dots + y_{n-1}\right)$$

$$A_{\text{Simpson}} = \dfrac{d}{3}\left(y_0 + 4\sum y_{\text{odd}} + 2\sum y_{\text{even}} + y_n\right)$$

Simpson's one-third rule needs an even number of intervals.

## Earthwork volumes
Between two cross sections $A_1$ and $A_2$ a distance $L$ apart:

$$V_{\text{end}} = \dfrac{L}{2}(A_1 + A_2) \qquad V_{\text{prism}} = \dfrac{L}{6}(A_1 + 4A_m + A_2)$$

$A_m$ is the area of the actual middle section, not the average of the two end areas. The prismoidal correction is $V_{\text{end}} - V_{\text{prism}}$. Average end area usually gives a little too much.

## Worked example
A course is 120.00 m long, bearing N 50°00′ E. Find its latitude and departure.

- Lat $= 120\cos 50° = 77.13$ m, north, so positive.
- Dep $= 120\sin 50° = 91.93$ m, east, so positive.

## Common slips
- Mixing up sine and cosine. Latitude uses cosine when the bearing angle is measured from the north-south line.
- Reading an azimuth from north when the problem says from south.
- Forgetting to halve the shoelace or DMD sum.
- Using Simpson's rule with an odd number of intervals, or swapping the 4 and 2 weights.
- Giving a compass rule correction the same sign as the error.
