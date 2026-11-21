subject: hgeo
area: Hydraulics
name: Gravity dams, wells and runoff
minutes: 14
order: 6

## Gravity dam forces
Work per metre length of dam. For a dam with a vertical upstream face, top width $a$, base $B$ and height $H$, split the concrete into a rectangle and a triangle. Concrete weighs about 23.5 kN/m³ unless given.

- Rectangle: $W_1 = \gamma_c aH$, arm from the toe $B - \tfrac{a}{2}$.
- Triangle: $W_2 = \tfrac{1}{2}\gamma_c (B - a)H$, arm from the toe $\tfrac{2}{3}(B - a)$.
- Water thrust on the vertical face, depth $h$: $P = \tfrac{1}{2}\gamma h^2$, acting $h/3$ above the base.
- Uplift, triangular from $\gamma h$ at the heel to zero at the toe: $U = \tfrac{1}{2}\gamma hB$, acting $\tfrac{2B}{3}$ from the toe. If only a percentage acts, scale the heel intensity.

## Stability checks
Net vertical force $R_y = \Sigma W - U$.

$$FS_{sliding} = \dfrac{\mu R_y}{P}, \qquad FS_{overturning} = \dfrac{\Sigma M_R}{\Sigma M_O}$$

Take moments about the toe. Weights resist; thrust and uplift overturn.

## Resultant and foundation pressure
Distance of the resultant from the toe and its eccentricity from the base centre:

$$\bar{x} = \dfrac{\Sigma M_R - \Sigma M_O}{R_y}, \qquad e = \dfrac{B}{2} - \bar{x}$$

$$q = \dfrac{R_y}{B}\left(1 \pm \dfrac{6e}{B}\right)$$

The plus sign gives the toe, the minus sign the heel. If $e \le B/6$ the resultant is in the middle third and the heel stays in compression.

## Wells
Steady flow to a fully penetrating well, with heads measured from the bottom of the aquifer at two radii $r_1 < r_2$:

- Unconfined (Dupuit–Thiem): $Q = \dfrac{\pi k (h_2^2 - h_1^2)}{\ln(r_2/r_1)}$
- Confined, thickness $b$: $Q = \dfrac{2\pi k b (h_2 - h_1)}{\ln(r_2/r_1)}$

## Rainfall and runoff
- Rational method: $Q = \dfrac{CiA}{360}$, with $Q$ in m³/s, $i$ in mm/h and $A$ in hectares. For mixed land use, use the area-weighted $C$.
- Arithmetic mean rainfall: the plain average of the gauges.
- Thiessen mean: $\bar{P} = \dfrac{\Sigma P_iA_i}{\Sigma A_i}$, each gauge weighted by its polygon area.
- Runoff volume = rainfall excess depth × catchment area. Excess is rainfall minus losses.

## Worked example
A dam 10 m high, 2 m top, 7 m base, vertical upstream face, holds 9 m of water. Full triangular uplift, $\mu = 0.6$.

- $W_1 = 23.5(2)(10) = 470$ kN, $W_2 = \tfrac{1}{2}(23.5)(5)(10) = 587.5$ kN.
- $P = \tfrac{1}{2}(9.81)(9)^2 = 397.31$ kN, $U = \tfrac{1}{2}(9.81)(9)(7) = 309.02$ kN.
- $R_y = 470 + 587.5 - 309.02 = 748.49$ kN, so $FS_s = \dfrac{0.6(748.49)}{397.31} = 1.13$.
- $\Sigma M_R = 470(6) + 587.5(3.333) = 4778.3$, $\Sigma M_O = 397.31(3) + 309.02(4.667) = 2634.0$, $FS_o = 1.81$.
- $\bar{x} = \dfrac{4778.3 - 2634.0}{748.49} = 2.865$ m, $e = 0.635$ m $< B/6$.
- $q_{toe} = \dfrac{748.49}{7}(1 + 0.544) = 165.1$ kPa, $q_{heel} = 48.7$ kPa.

## Common slips
- Leaving out uplift, or subtracting it from the weights but forgetting its overturning moment.
- Triangle centroid: $\tfrac{2}{3}(B - a)$ from the toe, not $\tfrac{1}{3}$.
- Giving $\bar{x}$ measured from the heel when the moments were taken about the toe.
- Using $\log_{10}$ in the well formulas; they need $\ln$.
- Squaring the drawdown difference, $(h_2 - h_1)^2$, instead of $h_2^2 - h_1^2$.
- Rational method with $A$ in km² but dividing by 360; that form needs hectares.
