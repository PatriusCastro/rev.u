subject: hgeo
area: Geotechnical
name: Soil classification and compaction
minutes: 12
order: 7

## Grain size
Read three sizes off the gradation curve: $D_{10}$, $D_{30}$ and $D_{60}$, the sizes that 10%, 30% and 60% of the soil is finer than. $D_{10}$ is the effective size.

$$C_u = \dfrac{D_{60}}{D_{10}} \qquad C_c = \dfrac{D_{30}^2}{D_{60}D_{10}}$$

USCS calls a soil well graded when $1 \le C_c \le 3$ and $C_u \ge 4$ for gravel or $C_u \ge 6$ for sand. Fail either test and it is poorly graded.

## USCS group symbol
- 50% or more passing the 0.075 mm (No. 200) sieve: fine grained. Otherwise coarse grained.
- Coarse: G if more than half the coarse fraction is retained on the 4.75 mm sieve, S if not. Under 5% fines, add W or P from the gradation. Over 12% fines, add M or C from the fines.
- Fine: L if $LL < 50$, H if $LL \ge 50$. Clay (C) if the point plots above the A-line, silt (M) if below.

$$\text{A-line: } PI = 0.73(LL - 20)$$

## AASHTO group index
With $F$ the percent passing the 0.075 mm sieve:

$$GI = (F - 35)[0.2 + 0.005(LL - 40)] + 0.01(F - 15)(PI - 10)$$

Round to a whole number. A negative result is taken as 0. A higher GI means a poorer subgrade.

## Proctor test
Weigh the wet soil in a mould of known volume, then dry a sample for water content.

$$\rho = \dfrac{m}{V} \qquad \rho_d = \dfrac{\rho}{1+w} \qquad \gamma_d = \rho_d\, g$$

The zero-air-voids curve is the dry unit weight at full saturation. No compaction point can lie above it.

$$\gamma_{zav} = \dfrac{G_s\gamma_w}{1 + wG_s}$$

## Field control
Relative compaction compares the field dry unit weight with the Proctor maximum:

$$RC = \dfrac{\gamma_{d,field}}{\gamma_{d,max}} \times 100\%$$

Sand cone: the mass of sand in the hole is the sand that left the jar minus the sand that fills the cone. Divide by the calibrated sand density to get the hole volume.

## Shrinkage limit
Below the shrinkage limit, drying no longer reduces volume. From a wet pat (mass $m_1$, volume $V_1$) and its oven-dry state (mass $m_2$, volume $V_2$):

$$SL = \dfrac{(m_1 - m_2) - (V_1 - V_2)\rho_w}{m_2} \times 100\%$$

## Worked example
A 944 cm³ Proctor mould holds 1.920 kg of wet soil at $w = 10.5\%$. Use $g = 9.81$ m/s² and $G_s = 2.70$.

- $\rho = 1920/944 = 2.034$ g/cm³
- $\rho_d = 2.034/1.105 = 1.841$ g/cm³, so $\gamma_d = 1.841(9.81) = 18.06$ kN/m³
- $\gamma_{zav} = \dfrac{2.70(9.81)}{1 + 0.105(2.70)} = 20.64$ kN/m³, so the point sits safely below the curve

## Common slips
- Using wet density as dry density. Divide by $1 + w$.
- Forgetting to subtract the sand left in the cone.
- Swapping $D_{60}$ and $D_{30}$ in $C_c$. Only $D_{30}$ is squared.
- Judging gradation on $C_u$ alone. $C_c$ must also be between 1 and 3.
- Comparing LL with the A-line. The A-line gives a PI value to compare with the soil's PI.
