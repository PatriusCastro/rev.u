subject: struct
area: Structural
name: Prestressed concrete
minutes: 14
order: 4

## Sign convention
In this lesson **compression is negative and tension is positive**. Sagging moment $M$ compresses the top fibre and stretches the bottom. A tendon below the centroid at eccentricity $e$ does the opposite.

## Fibre stresses
For a section with area $A$, moment of inertia $I$ and distance $c$ from the centroid to the fibre:

$$f_{top} = -\dfrac{P}{A} + \dfrac{Pe\,c_t}{I} - \dfrac{M c_t}{I}$$

$$f_{bot} = -\dfrac{P}{A} - \dfrac{Pe\,c_b}{I} + \dfrac{M c_b}{I}$$

For a rectangle $b \times h$: $A = bh$, $I = bh^3/12$, $c = h/2$, and $I/c = bh^2/6$.

## Transfer and service
- **At transfer**: use the initial force $P_i$ and the self-weight moment only. This is when the bottom is most compressed and the top may crack in tension.
- **At service**: use the effective force $P_e = P_i(1 - \text{loss})$ and the full moment from self-weight plus superimposed loads.

Self-weight $w = \gamma b h$, with $\gamma = 23.5$ or $24$ kN/m³ as stated. Midspan moment of a simple span: $M = wL^2/8$.

## Zero tension and the kern
Setting $f_{bot} = 0$ for a rectangle gives the eccentricity that just avoids tension:

$$e = \dfrac{M}{P} - \dfrac{h}{6}$$

The kern distances mark where the force can sit with no tension anywhere: $r^2 = I/A$, upper kern $k_t = r^2/c_b$, lower kern $k_b = r^2/c_t$. For a rectangle both equal $h/6$.

A concentric force with no tension at the bottom resists $M = P\,k_t$. Moving it down by $e$ adds $Pe$, so the same force carries more load.

## Load balancing
A parabolic tendon with sag $e$ at midspan (zero at the ends) pushes up on the concrete with a uniform load

$$w_b = \dfrac{8Pe}{L^2}$$

If $w_b$ equals the applied load, the beam carries uniform compression $P/A$ and does not deflect.

## Losses, cracking and strength
- **Elastic shortening** (pretensioned): $\Delta f_{p} = n\,f_{cgs}$, where $n = E_s/E_c$ and $f_{cgs}$ is the concrete stress at the tendon level from prestress and self-weight.
- **Cracking moment**: the bottom reaches the modulus of rupture $f_r$ (for example $0.62\sqrt{f'_c}$): $M_{cr} = S_b\left(f_r + \dfrac{P}{A}\right) + Pe$.
- **Ultimate strength** with a given $f_{ps}$: $a = \dfrac{A_{ps}f_{ps}}{0.85 f'_c b}$, $M_n = A_{ps}f_{ps}\left(d_p - \dfrac{a}{2}\right)$, then $\phi M_n$ with $\phi = 0.90$ for a tension-controlled section.

## Worked example
A 300 mm × 500 mm simple beam spans 8 m and carries $P_e = 900$ kN at $e = 120$ mm. The total service load is 15 kN/m. Find the bottom fibre stress at midspan.

- $A = 150\,000$ mm², $S = 300(500)^2/6 = 12.5 \times 10^6$ mm³.
- $M = 15(8)^2/8 = 120$ kN·m.
- $f_{bot} = -\dfrac{900\,000}{150\,000} - \dfrac{900\,000(120)}{12.5 \times 10^6} + \dfrac{120 \times 10^6}{12.5 \times 10^6} = -6.00 - 8.64 + 9.60 = -5.04$ MPa.
- The bottom is in compression, 5.04 MPa.

## Common slips
- Using the initial force at service. Apply the losses first.
- Mixing up which fibre gets the plus sign. Draw the tendon below the centroid: it lifts the beam, so it compresses the bottom.
- Forgetting self-weight, or leaving it out at transfer.
- Using $c$ instead of $e$ when finding the stress at the tendon level for elastic shortening.
- Mixing units: keep N and mm so stresses come out in MPa.
