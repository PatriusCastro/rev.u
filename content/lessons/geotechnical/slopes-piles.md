subject: hgeo
area: Geotechnical
name: Slope stability and pile foundations
minutes: 14
order: 8

## Infinite slope
A long slope at angle $\beta$ with a failure plane parallel to the surface at depth $H$.

- Dry, $c = 0$: $FS = \dfrac{\tan\phi}{\tan\beta}$. Depth does not matter.
- With cohesion: $FS = \dfrac{c}{\gamma H\cos^2\beta\tan\beta} + \dfrac{\tan\phi}{\tan\beta}$
- Seepage parallel to the slope, water at the surface, $c = 0$: $FS = \dfrac{\gamma'}{\gamma_{sat}}\cdot\dfrac{\tan\phi}{\tan\beta}$, with $\gamma' = \gamma_{sat} - 9.81$. This is roughly half the dry value.

## Planar failure (Culmann wedge)
A slope of height $H$ and face angle $\beta$ slides on a plane at angle $\theta$ through the toe. Per metre of slope:

$$W = \dfrac{1}{2}\gamma H^2\,\dfrac{\sin(\beta - \theta)}{\sin\beta\,\sin\theta}, \qquad L = \dfrac{H}{\sin\theta}$$

$$FS = \dfrac{cL + W\cos\theta\tan\phi}{W\sin\theta}$$

## Vertical cut in clay
Critical (unsupported) height: $H_{cr} = \dfrac{4c}{\gamma}$.

## Single pile in clay
$Q_u = Q_p + Q_s$ with

- End bearing: $Q_p = 9c_u A_p$ ($c_u$ at the tip)
- Skin friction ($\alpha$ method): $Q_s = \alpha c_u p L$, $p$ = perimeter

Allowable load $Q_a = Q_u / FS$.

## Single pile in sand
- Skin friction: $f_s = K\sigma'_v\tan\delta$ with $\sigma'_v$ averaged over the length (midpoint for a uniform layer). $Q_s = f_s\,p\,L$.
- End bearing: $Q_p = q' N_q A_p$, $q'$ = effective stress at the tip.

## Pile groups
Converse–Labarre efficiency for $m$ rows of $n$ piles, diameter $d$, spacing $s$:

$$E = 1 - \theta\,\dfrac{(n-1)m + (m-1)n}{90mn}, \qquad \theta = \tan^{-1}\dfrac{d}{s}\ \text{in degrees}$$

Group capacity $= E \times$ (number of piles) $\times Q_u$.

Block failure in clay: treat the group as one block $B_g \times L_g$ of depth $L$, with full $c_u$ on the sides:

$$Q_{block} = 9c_u B_g L_g + 2(B_g + L_g)c_u L$$

Take the smaller of $Q_{block}$ and the sum of single-pile capacities.

## Negative skin friction
A fill that settles drags the pile down. For a fill of height $H_f$ and unit weight $\gamma_f$:

$$Q_n = \dfrac{p K \gamma_f H_f^2\tan\delta}{2}$$

This load adds to the pile load; it does not help carry it.

## Worked example
A 0.30 m square pile is driven 12 m into clay with $c_u = 40$ kPa and $\alpha = 0.80$. Find the allowable load with FS = 2.5.

- $Q_p = 9(40)(0.09) = 32.4$ kN.
- $Q_s = 0.80(40)(1.2)(12) = 460.8$ kN.
- $Q_a = (32.4 + 460.8)/2.5 = 197.3$ kN.

## Common slips
- Using $\gamma_{sat}$ in place of $\gamma'$ in the seepage formula, or forgetting the $\gamma'/\gamma_{sat}$ factor.
- Using the tip stress, not the average, for skin friction in sand.
- Forgetting $\alpha$ in clay, or using area where perimeter belongs.
- Leaving $\theta$ in radians in Converse–Labarre.
- Reporting the block capacity when the sum of single piles is smaller.
- Measuring the slip plane length with $\sin\beta$ instead of $\sin\theta$.
