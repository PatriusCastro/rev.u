subject: hgeo
area: Hydraulics
name: Relative equilibrium, momentum and unsteady flow
minutes: 14
order: 5

## Horizontal acceleration
A tank moving with constant horizontal acceleration $a$ has a sloping, flat water surface. The water rises at the rear and drops at the front.

$$\tan\theta = \dfrac{a}{g}$$

For a tank of length $L$, the surface rises $\dfrac{L}{2}\tan\theta$ at the rear wall above the original level, since the volume stays the same. If the rear depth goes past the wall height, water spills until the surface passes through the top of the rear wall.

## Vertical acceleration
Accelerating up at $a$ makes the water feel heavier; down makes it lighter.

$$p = \gamma h\left(1 \pm \dfrac{a}{g}\right)$$

Use $+$ for upward acceleration, $-$ for downward.

## Rotating open cylinder
At steady speed $\omega$ (rad/s) the surface is a paraboloid. Its height from vertex to wall, at radius $r$:

$$h = \dfrac{\omega^2 r^2}{2g}$$

- The paraboloid's volume is half the cylinder around it: $V = \tfrac{1}{2}\pi r^2 h$.
- With no spill and the bottom covered, the surface falls $h/2$ at the centre and rises $h/2$ at the wall.
- Convert speed: $\omega = \dfrac{2\pi N}{60}$, with $N$ in rpm.

## Jets on plates and vanes
Force equals the change in momentum per second.

- Fixed flat plate, normal to the jet: $F = \rho Q v = \rho A v^2$.
- Single flat plate moving away at $u$: $F = \rho A (v - u)^2$.
- A series of vanes (a wheel) catches the whole jet: $F = \rho A v (v - u)$.

## Pipe bends
Take the water in the bend as the free body. In each direction:

$$\sum F = \rho Q (v_{out} - v_{in})$$

Include the pressure force $pA$ at each end. The force on the bend is opposite to the force on the water.

## Water hammer
Closing a valve fast (in less than $2L/c$) raises the pressure by

$$\Delta p = \rho c v$$

where $c$ is the pressure wave speed and $v$ is the velocity destroyed.

## Unsteady flow through orifices
Time for a tank of constant area $A$ to fall from head $h_1$ to $h_2$ through an orifice of area $a$:

$$t = \dfrac{2A\left(\sqrt{h_1} - \sqrt{h_2}\right)}{C_d\,a\sqrt{2g}}$$

To drain fully, $h_2 = 0$. For two tanks joined by a submerged orifice, use the head difference $H$ and an equivalent area:

$$t = \dfrac{2A_e\left(\sqrt{H_1} - \sqrt{H_2}\right)}{C_d\,a\sqrt{2g}}, \qquad A_e = \dfrac{A_1A_2}{A_1 + A_2}$$

## Worked example
An open cylinder 0.6 m in diameter turns at 120 rpm. Find the paraboloid height.

- $\omega = \dfrac{2\pi(120)}{60} = 12.566$ rad/s
- $h = \dfrac{(12.566)^2(0.3)^2}{2(9.81)} = 0.724$ m

## Common slips
- Using the full tank length for the surface rise instead of half of it.
- Leaving $\omega$ in rpm, or using the diameter for $r$.
- Using $\rho A v(v-u)$ for a single moving plate; that is for a series of vanes.
- Forgetting the $pA$ terms on a pipe bend.
- Dropping the 2 in the draining-time formula, or using $h$ instead of $\sqrt{h}$.
