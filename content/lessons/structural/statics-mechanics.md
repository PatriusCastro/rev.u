subject: struct
area: Structural
name: Statics and strength of materials
minutes: 15
order: 1

## Equilibrium first
Every statics problem starts with a free-body diagram and three equations: $\sum F_x = 0$, $\sum F_y = 0$, $\sum M = 0$.

- Replace a uniform load $w$ over a length $L$ by its resultant $wL$ at the middle of that length.
- Take moments about one support to find the other reaction in one step.
- Truss members carry axial force only. Method of joints: cut around one joint and balance $x$ and $y$. Method of sections: cut through up to three members and take moments.

## Standard beam results
Simply supported span $L$:

- Uniform load $w$: $M_{max} = \dfrac{wL^2}{8}$ at midspan, $V_{max} = \dfrac{wL}{2}$ at the supports.
- Point load $P$ at midspan: $M_{max} = \dfrac{PL}{4}$, $V_{max} = \dfrac{P}{2}$.
- Midspan deflection: $\delta = \dfrac{5wL^4}{384EI}$ for the uniform load, $\delta = \dfrac{PL^3}{48EI}$ for the midspan point load. Deflections from separate loads add.

## Axial and thermal stress
$$\sigma = \frac{P}{A} \qquad \delta = \frac{PL}{AE}$$

A bar that is free to grow expands $\delta_T = \alpha L \Delta T$. If it is fully restrained, $\sigma = E\alpha\Delta T$. If there is a gap, only the expansion beyond the gap is stopped: $\sigma = \dfrac{E(\delta_T - \text{gap})}{L}$.

## Bending and shear stress
$$\sigma = \frac{Mc}{I} \qquad \tau = \frac{VQ}{Ib}$$

For a rectangle $b \times h$: $I = \dfrac{bh^3}{12}$, $c = \dfrac{h}{2}$, and the largest shear stress, at the neutral axis, is $\tau_{max} = \dfrac{3V}{2A}$.

## Torsion of a solid shaft
$$\tau = \frac{Tc}{J} = \frac{16T}{\pi d^3} \qquad P = 2\pi f T$$

Here $f$ is in revolutions per second: divide rpm by 60.

## Euler buckling
$$P_{cr} = \frac{\pi^2 EI}{(KL)^2}$$

Use the smaller $I$. Effective length factor $K$: 1.0 pinned both ends, 0.5 fixed both ends, 0.7 fixed and pinned, 2.0 fixed and free.

## Worked example
A 5 m simply supported beam carries 8 kN/m over its full span. Find the maximum moment and the maximum shear.

- $M_{max} = \dfrac{8(5)^2}{8} = 25$ kN·m at midspan.
- $V_{max} = \dfrac{8(5)}{2} = 20$ kN at each support.

## Common slips
- Leaving units mixed. Work in N and mm so stresses come out in MPa.
- Using the deeper side as $b$ in $I = bh^3/12$. $h$ is the depth in the direction of bending.
- Using rpm directly as $f$ in $P = 2\pi f T$.
- Forgetting a gap in a thermal problem, or forgetting $K$ in Euler's formula.
- Splitting a uniform load wrongly between supports. Its resultant acts at the centre of the loaded length.
