subject: struct
area: Structural
name: Concrete, steel and construction basics
minutes: 15
order: 2

## Factored loads
Strength design per NSCP 2015 (which follows ACI 318) multiplies service loads by load factors. The usual combination for dead and live load is

$$w_u = 1.2D + 1.6L$$

For a simply supported beam or a 1 m slab strip, $M_u = \dfrac{w_u L^2}{8}$. Include the slab's own weight in $D$: thickness × 24 kN/m³.

## Singly reinforced rectangular beam
The Whitney block has depth $a = \beta_1 c$, with $\beta_1 = 0.85$ for $f'_c \le 28$ MPa.

$$a = \dfrac{A_s f_y}{0.85 f'_c b} \qquad M_n = A_s f_y\left(d - \dfrac{a}{2}\right) \qquad M_u \le \phi M_n$$

Use $\phi = 0.90$ when the section is tension-controlled (steel strain at least 0.005, which is $c/d \le 0.375$).

## Steel ratio limits
$$\rho_b = \dfrac{0.85\beta_1 f'_c}{f_y}\cdot\dfrac{600}{600 + f_y} \qquad A_{s,\min} = \dfrac{1.4}{f_y}\,b\,d$$

## Short tied column
$$\phi P_n = 0.65(0.80)\left[0.85f'_c(A_g - A_{st}) + f_y A_{st}\right]$$

## Steel members (LRFD)
- Tension yielding: $\phi P_n = 0.90 F_y A_g$.
- Compact, fully braced beam: $M_p = F_y Z_x$ and $\phi M_n = 0.90 F_y Z_x$.

## Construction quantities
- Concrete volume: length × width × thickness, times the number of pieces.
- Cement: volume × bags per m³ for the class of mix (for example 9.0 bags of 40 kg for Class A). Round bags up.
- Concrete hollow blocks: about 12.5 blocks per m² of net wall area (deduct doors and windows). Round up.
- CPM: list every path from start to finish and add the durations. The longest path is the critical path, and its length is the project duration.

## Worked example
A beam has $b = 250$ mm, $d = 450$ mm, $A_s = 1200$ mm², $f'_c = 21$ MPa, $f_y = 414$ MPa. Find $\phi M_n$.

- $a = \dfrac{1200(414)}{0.85(21)(250)} = 111.3$ mm, so $c = 111.3/0.85 = 130.9$ mm.
- $c/d = 0.29 \le 0.375$: tension-controlled, $\phi = 0.90$.
- $M_n = 1200(414)(450 - 55.6) = 195.9$ kN·m, so $\phi M_n = 176.3$ kN·m.

## Common slips
- Forgetting the slab or beam self-weight in $D$.
- Using $d - a$ instead of $d - a/2$ for the lever arm.
- Dropping the 0.80 factor on a tied column, or not subtracting $A_{st}$ from $A_g$.
- Using the gross wall area for hollow blocks, or rounding bags and blocks down.
- Taking the shortest path in CPM. The project cannot finish before the longest path does.
