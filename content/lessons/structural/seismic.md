subject: struct
area: Structural
name: Earthquake loads (NSCP 2015 static method)
minutes: 14
order: 5

## The static lateral force procedure
NSCP 2015 Section 208 treats the shaking as one horizontal force at the base, the design base shear $V$, and then spreads it up the building. Board problems give you the coefficients, and your job is to use them in the right order. The coefficients and limits below follow NSCP 2015. Always check them against the current code edition.

- $Z$: seismic zone factor. Most of the Philippines is Zone 4, $Z = 0.4$.
- $C_a$, $C_v$: seismic coefficients from the soil profile (SA to SE) and, in Zone 4, the near-source factors $N_a$ and $N_v$.
- $I$: importance factor. It is 1.0 for ordinary buildings and higher for schools, hospitals and similar buildings.
- $R$: response modification factor of the structural system.
- $W$: seismic weight, the total dead load plus partitions (and part of any storage load).

## Fundamental period (Method A)
$$T = C_t\,h_n^{3/4}$$

$h_n$ is the height in metres from the base to the roof. $C_t = 0.0853$ for steel moment frames, $0.0731$ for concrete moment frames and eccentric braced frames, and $0.0488$ for all other buildings.

## Design base shear and its limits
$$V = \dfrac{C_v I}{R\,T}\,W$$

Then check the limits:

- Upper limit: $V \le \dfrac{2.5\,C_a I}{R}\,W$
- Lower limit: $V \ge 0.11\,C_a I W$
- Zone 4 only, also: $V \ge \dfrac{0.8\,Z N_v I}{R}\,W$

Start from the formula value. If it is above the upper limit, use the upper limit. If it is below the larger of the lower limits, use that lower limit. In short, stiff buildings of 2 to 5 storeys, the upper limit usually governs.

## Vertical distribution
$$F_x = \dfrac{(V - F_t)\,w_x h_x}{\sum w_i h_i}$$

$w_x$ and $h_x$ are the weight of level $x$ and its height above the base. There is also an extra force at the top:

$$F_t = 0.07\,T V \le 0.25 V \quad\text{when } T > 0.7\text{ s}, \qquad F_t = 0 \text{ when } T \le 0.7\text{ s}$$

$F_t$ is added to the roof force. All the level forces plus $F_t$ add back up to $V$.

## Storey shear and overturning
- The shear in a storey is the sum of all the forces at the levels above it, including $F_t$.
- Overturning moment at the base: $M = F_t h_n + \sum F_x h_x$.

## Worked example
A 3-storey concrete moment frame in Zone 4 stands on soil profile SD. Its level weights are $w_1 = 1600$ kN at 3.5 m, $w_2 = 1600$ kN at 7.0 m and $w_3 = 1100$ kN (roof) at 10.5 m. Use $C_a = 0.44$, $C_v = 0.64$, $N_v = 1.0$, $I = 1.0$, $R = 8.5$.

- $W = 1600 + 1600 + 1100 = 4300$ kN.
- $T = 0.0731(10.5)^{3/4} = 0.426$ s, which is below 0.7 s, so $F_t = 0$.
- Formula: $V = \dfrac{0.64(1.0)(4300)}{8.5(0.426)} = 759.3$ kN.
- Upper limit: $\dfrac{2.5(0.44)(1.0)(4300)}{8.5} = 556.5$ kN. The formula value is higher, so the upper limit caps $V$. Both lower limits (208.1 kN and 161.9 kN) are smaller, so $V = 556.5$ kN.
- $\sum w_i h_i = 1600(3.5) + 1600(7.0) + 1100(10.5) = 28\,350$ kN·m.
- $F_1 = 556.5 \times \dfrac{5600}{28\,350} = 109.9$ kN, $F_2 = 219.8$ kN and $F_3 = 226.7$ kN. They add up to 556.5 kN.

## Common slips
- Using the formula value of $V$ without checking the upper limit.
- Taking the wrong $C_t$. Steel and concrete moment frames use different values.
- Forgetting $F_t$ when $T > 0.7$ s, or adding it at the roof without first subtracting it from $V$.
- Distributing the force by weight alone instead of by $w_x h_x$.
- Using the total height $h_n$ for every level instead of each level's own height.
- Adding the wrong forces for a storey shear. A storey carries the forces of all the levels above it, not the ones below.
