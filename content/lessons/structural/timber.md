subject: struct
area: Structural
name: Timber design
minutes: 12
order: 3

## Allowable stress design
NSCP 2015 Chapter 6 designs timber by allowable stresses: the actual stress under service loads must not exceed the allowable value for the species and grade (apitong, yakal, tanguile and so on). Board problems give you $F_b$, $F_v$, $F_c$, $F_{c\perp}$ and $E$, so read them off the problem.

## Use dressed sizes
A "100 × 300" member is a nominal size. After planing it is smaller, such as 90 × 290 mm. When the problem gives a dressed size, use it for $b$, $d$, area, $S$ and $I$.

## Bending, shear and deflection
For a rectangular section of width $b$ and depth $d$:

$$f_b = \frac{6M}{bd^2} \qquad f_v = \frac{3V}{2bd}$$

For a simple span with uniform load, $M = \dfrac{wL^2}{8}$, $V = \dfrac{wL}{2}$ and

$$\Delta = \frac{5wL^4}{384EI} \le \frac{L}{360}$$

The safe uniform load is the smallest of the loads from bending, shear and deflection.

## Notched beams
A notch on the tension face at a support raises the shear stress. With remaining depth $d_n$:

$$f_v = \frac{3V}{2bd_n}\left(\frac{d}{d_n}\right)$$

## Columns
Slenderness is $L_e/d$, with $d$ the least dressed dimension, and must not exceed 50. With $K = 0.671\sqrt{E/F_c}$:

- Short, $L_e/d \le 11$: $F_c' = F_c$
- Intermediate, $11 < L_e/d \le K$: $F_c' = F_c\left[1 - \dfrac{1}{3}\left(\dfrac{L_e/d}{K}\right)^4\right]$
- Long, $K < L_e/d \le 50$: $F_c' = \dfrac{0.3E}{(L_e/d)^2}$

Capacity is $P = F_c' A$.

## Bearing and load at an angle
Bearing on a support works across the grain: required bearing length $= \dfrac{R}{F_{c\perp} b}$.

When the load is at angle $\theta$ to the grain, use Hankinson's formula:

$$F_n = \frac{F_c F_{c\perp}}{F_c \sin^2\theta + F_{c\perp}\cos^2\theta}$$

## Fasteners
A bolted or nailed joint carries (number of fasteners) × (value per fastener). For a required number, divide and round up.

## Worked example
A tanguile beam, dressed 75 mm × 200 mm, spans 3.6 m simply supported and carries 3.2 kN/m. $F_b = 11$ MPa and $F_v = 0.9$ MPa. Is it safe?

- $M = \dfrac{3.2(3.6)^2}{8} = 5.184$ kN·m, so $f_b = \dfrac{6(5.184 \times 10^6)}{75(200)^2} = 10.37$ MPa $< 11$ MPa.
- $V = \dfrac{3.2(3.6)}{2} = 5.76$ kN, so $f_v = \dfrac{3(5760)}{2(75)(200)} = 0.576$ MPa $< 0.9$ MPa.
- Safe in bending and shear.

## Common slips
- Using the nominal size when the dressed size is given.
- Swapping $b$ and $d$. The depth is the dimension in the direction of the load, and it is the one squared.
- Swapping $\sin^2$ and $\cos^2$ in Hankinson's formula. At $\theta = 0$ you must get $F_c$.
- Rounding a fastener count down.
- Stopping at the bending check when deflection or shear governs.
