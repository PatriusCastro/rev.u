subject: hgeo
area: Hydraulics
name: Fluid properties and hydrostatics
minutes: 12
order: 1

## Unit weight, density, specific gravity
$$\gamma = \rho g \qquad s = \dfrac{\gamma}{\gamma_w} = \dfrac{\rho}{\rho_w}$$

Use $\gamma_w = 9.81$ kN/m³ and $\rho_w = 1000$ kg/m³ unless told otherwise. Mercury has $s = 13.6$.

## Pressure at depth
$$p = \gamma h$$

This is gauge pressure. Absolute pressure adds the atmosphere: $p_{abs} = p_{atm} + \gamma h$, with $p_{atm} \approx 101.3$ kPa.

## Manometers
Start at one end and walk through the tube. Add $\gamma h$ going down, subtract going up. Set the sum equal to the pressure at the other end (zero gauge for an open end).

For a differential manometer between two points at the same level, with deflection $R$:

$$p_A - p_B = R(\gamma_m - \gamma_f)$$

## Force on a plane surface
$$F = \gamma \bar{h} A$$

$\bar{h}$ is the depth of the centroid. Measured along the plane from the surface line, the centre of pressure lies below the centroid by

$$e = \dfrac{I_g}{A\bar{y}}$$

where $\bar{y}$ is the slant distance to the centroid. For a rectangle, $I_g = \dfrac{bh^3}{12}$.

## Force on a curved surface
- Horizontal part: the force on the vertical projection of the surface, $F_H = \gamma \bar{h} A_{proj}$.
- Vertical part: the weight of water (real or imagined) between the surface and the free surface.
- Resultant: $F = \sqrt{F_H^2 + F_V^2}$.

## Buoyancy and floating
The buoyant force equals the weight of fluid displaced: $B = \gamma_f V_{sub}$.

- Apparent weight in the fluid is $W - B$.
- A floating body sinks until $B$ equals its total weight.

## Stability
$$BM = \dfrac{I}{V_{sub}} \qquad GM = BM - BG$$

$I$ is the second moment of the waterline area about the tilting axis. $GM > 0$ is stable.

## Worked example
A vertical square gate 2 m by 2 m has its top edge 1 m below the water surface. Find the force and the depth of the centre of pressure.

- $\bar{h} = 1 + 1 = 2$ m and $A = 4$ m².
- $F = 9.81(2)(4) = 78.48$ kN.
- $e = \dfrac{2(2^3)/12}{4(2)} = 0.167$ m, so the centre of pressure is 2.167 m deep.

## Common slips
- Using the depth of the top or bottom edge instead of the centroid in $F = \gamma\bar{h}A$.
- Forgetting the atmosphere when absolute pressure is asked, or adding it when gauge is asked.
- Using vertical depth instead of slant distance in $e = I_g/(A\bar{y})$ on inclined gates.
- Taking $I$ about the wrong axis for metacentric height. A barge rolls about its long axis, so cube the width.
