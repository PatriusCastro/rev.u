subject: hgeo
area: Hydraulics
name: Pipe and open-channel flow
minutes: 14
order: 2

## Continuity
Water is incompressible, so the flow rate is the same at every section.

$$Q = A_1V_1 = A_2V_2$$

For a circular pipe, $A = \dfrac{\pi D^2}{4}$.

## Energy equation
Total head at section 1, plus pump head, equals total head at section 2 plus losses and turbine head.

$$\dfrac{p_1}{\gamma} + \dfrac{V_1^2}{2g} + z_1 + h_p = \dfrac{p_2}{\gamma} + \dfrac{V_2^2}{2g} + z_2 + h_L + h_t$$

Power from head: $P = \gamma Q H$. A pump needs $P_{in} = \dfrac{\gamma Q h_p}{\eta}$; a turbine gives $P_{out} = \eta\,\gamma Q h_t$.

## Head loss in pipes
Darcy–Weisbach, with friction factor $f$:

$$h_f = f\dfrac{L}{D}\dfrac{V^2}{2g} = \dfrac{0.0826\,fLQ^2}{D^5}$$

Hazen–Williams (SI, $Q$ in m³/s, $D$ and $L$ in m):

$$h_f = \dfrac{10.67\,L\,Q^{1.852}}{C^{1.852}D^{4.87}}$$

Manning for a full pipe: $h_f = \dfrac{10.29\,n^2LQ^2}{D^{16/3}}$.

## Series and parallel pipes
- Series: same $Q$ in each pipe, head losses add.
- Parallel: same head loss in each branch, flows add. With Darcy, $h_f = kQ^2$, so each branch carries $Q_i \propto 1/\sqrt{k_i}$.

## Orifices
$$Q = C_d A\sqrt{2gh}, \qquad C_d = C_c C_v$$

$C_c$ shrinks the jet area, $C_v$ cuts the jet speed.

## Open channels: Manning
$$Q = \dfrac{1}{n}AR^{2/3}S^{1/2}, \qquad R = \dfrac{A}{P}$$

- Rectangle, width $b$, depth $y$: $A = by$, $P = b + 2y$.
- Trapezoid, side slope $z$ horizontal to 1 vertical: $A = (b + zy)y$, $P = b + 2y\sqrt{1 + z^2}$.
- Most efficient rectangle: $b = 2y$, so $R = y/2$.

## Specific energy and critical depth
$E = y + \dfrac{V^2}{2g}$. For a rectangular channel with $q = Q/b$:

$$y_c = \left(\dfrac{q^2}{g}\right)^{1/3}, \qquad E_{min} = \tfrac{3}{2}y_c$$

## Weirs
Sharp-crested rectangular weir, Francis formula (SI): $Q = 1.84\,L'H^{3/2}$, with $L' = L - 0.1nH$ for $n$ end contractions.

## Worked example
A 200 mm pipe, 500 m long, $f = 0.02$, carries 40 L/s. Find the head loss.

- $h_f = \dfrac{0.0826(0.02)(500)(0.04)^2}{0.2^5} = \dfrac{0.0013216}{0.00032}$
- $h_f \approx 4.13$ m.

## Common slips
- Using diameter where the formula wants area, or radius where it wants diameter.
- Forgetting the 2 in $V^2/2g$.
- Wetted perimeter of a channel: count the bed and both sides, never the free surface.
- In parallel pipes, splitting the flow in proportion to $k$ instead of $1/\sqrt{k}$.
- Using $Q$ instead of $q = Q/b$ in the critical depth formula.
- Dividing by pump efficiency for a turbine, or multiplying for a pump.
