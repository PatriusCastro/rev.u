subject: hgeo
area: Geotechnical
name: Settlement, shear strength and bearing capacity
minutes: 15
order: 4

## Effective stress first
Settlement and strength depend on effective stress. Below the water table use the buoyant unit weight $\gamma' = \gamma_{sat} - 9.81$ kN/m³. Take the stress at the middle of a clay layer.

## Primary consolidation settlement
Normally consolidated clay:

$$S = \dfrac{C_c H}{1 + e_0}\log\dfrac{\sigma'_0 + \Delta\sigma}{\sigma'_0}$$

Overconsolidated clay with preconsolidation pressure $\sigma'_c$:

- If $\sigma'_0 + \Delta\sigma \le \sigma'_c$: use $C_s$ in place of $C_c$.
- If $\sigma'_0 + \Delta\sigma > \sigma'_c$: $S = \dfrac{H}{1+e_0}\left[C_s\log\dfrac{\sigma'_c}{\sigma'_0} + C_c\log\dfrac{\sigma'_0+\Delta\sigma}{\sigma'_c}\right]$

## Time rate of consolidation
$$t = \dfrac{T_v H_{dr}^2}{c_v}$$

$H_{dr}$ is half the layer thickness when sand lies above and below (double drainage), and the full thickness when one face is impervious. Common values: $T_v = 0.197$ for $U = 50\%$, $T_v = 0.848$ for $U = 90\%$.

## Shear strength
Mohr–Coulomb: $\tau_f = c + \sigma\tan\phi$.

- Direct shear: two tests give two points $(\sigma, \tau)$. The slope is $\tan\phi$, the intercept is $c$.
- Triaxial, $c = 0$: $\sin\phi = \dfrac{\sigma_1 - \sigma_3}{\sigma_1 + \sigma_3}$, where $\sigma_1 = \sigma_3 + $ deviator stress.

## Terzaghi bearing capacity
With $q = \gamma D_f$:

- Strip: $q_u = cN_c + qN_q + 0.5\gamma B N_\gamma$
- Square: $q_u = 1.3cN_c + qN_q + 0.4\gamma B N_\gamma$
- Circular: $q_u = 1.3cN_c + qN_q + 0.3\gamma B N_\gamma$

Allowable pressure $q_a = q_u / FS$. Allowable load = $q_a \times$ footing area.

## Rankine earth pressure
$K_a = \tan^2(45° - \phi/2)$, $K_p = \tan^2(45° + \phi/2)$.

- Active thrust on a wall of height $H$: $P_a = \tfrac{1}{2}K_a\gamma H^2$ at $H/3$ above the base.
- A uniform surcharge $q$ adds $K_a q H$ acting at $H/2$.
- Passive with cohesion: $P_p = \tfrac{1}{2}K_p\gamma H^2 + 2c\sqrt{K_p}\,H$.

## Stress increase by the 2:1 method
The load spreads 1 horizontal to 2 vertical on each side, so at depth $z$ below a $B \times L$ footing:

$$\Delta\sigma = \dfrac{P}{(B + z)(L + z)}$$

## Worked example
A 3 m clay layer lies under 2 m of sand ($\gamma = 18$ kN/m³) with the water table at the top of the clay. Clay: $\gamma_{sat} = 19$ kN/m³, $e_0 = 1.0$, $C_c = 0.30$. A building adds 40 kPa at mid-clay. Find the settlement.

- $\sigma'_0 = 2(18) + 1.5(19 - 9.81) = 49.79$ kPa.
- $S = \dfrac{0.30(3)}{2.0}\log\dfrac{89.79}{49.79} = 0.45(0.2561) = 0.115$ m.
- Settlement is about 115 mm.

## Common slips
- Using total unit weight below the water table instead of buoyant unit weight.
- Dividing by $e_0$ instead of $1 + e_0$, or using $\ln$ instead of $\log$.
- Taking the full layer as $H_{dr}$ when the clay drains at both faces.
- Using strip footing factors (0.5 on the $\gamma$ term) for a square footing.
- Forgetting to multiply the allowable pressure by the footing area.
- Placing the surcharge thrust at $H/3$; a uniform pressure acts at $H/2$.
