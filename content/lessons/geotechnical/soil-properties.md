subject: hgeo
area: Geotechnical
name: Soil properties, permeability and stress
minutes: 14
order: 3

## Phase relationships
A soil is solids, water and air. Name the volumes $V_s$, $V_w$, $V_v$ (voids) and $V$ (total), and the weights $W_s$, $W_w$.

- Void ratio $e = \dfrac{V_v}{V_s}$, porosity $n = \dfrac{V_v}{V} = \dfrac{e}{1+e}$
- Water content $w = \dfrac{W_w}{W_s}$ (divide by the dry weight, not the wet weight)
- Degree of saturation $S = \dfrac{V_w}{V_v}$

The one link to remember:

$$Se = wG_s$$

## Unit weights
Use $\gamma_w = 9.81$ kN/m³.

$$\gamma = \dfrac{(G_s + Se)\gamma_w}{1+e} \qquad \gamma_d = \dfrac{G_s\gamma_w}{1+e} = \dfrac{\gamma}{1+w} \qquad \gamma_{sat} = \dfrac{(G_s + e)\gamma_w}{1+e}$$

Buoyant unit weight: $\gamma' = \gamma_{sat} - \gamma_w$.

## Relative density and Atterberg limits
$$D_r = \dfrac{e_{max} - e}{e_{max} - e_{min}}$$

- Plasticity index $PI = LL - PL$
- Liquidity index $LI = \dfrac{w - PL}{PI}$. Near 0 the soil is stiff; near 1 it is close to liquid.

## Permeability tests
Darcy: $q = kiA$, with $i = \dfrac{\Delta h}{L}$.

- Constant head: $k = \dfrac{QL}{Aht}$
- Falling head: $k = \dfrac{aL}{At}\ln\dfrac{h_1}{h_2}$, where $a$ is the standpipe area and $A$ the sample area

Darcy velocity is $v = ki$. Water actually moves through the voids only, so the seepage velocity is $v_s = \dfrac{v}{n}$.

## Effective stress
$$\sigma' = \sigma - u$$

- Total stress $\sigma$: add $\gamma h$ of every layer above the point. Use $\gamma_{sat}$ below the water table.
- Pore pressure $u = \gamma_w h_w$, with $h_w$ measured from the water table, not the ground surface.

## Quick condition and flow nets
Upward flow makes the effective stress zero when

$$i_{cr} = \dfrac{\gamma'}{\gamma_w} = \dfrac{G_s - 1}{1+e}$$

For a flow net, the seepage per metre of length is

$$q = kH\dfrac{N_f}{N_d}$$

where $H$ is the head loss, $N_f$ the number of flow channels and $N_d$ the number of equipotential drops.

## Worked example
A sand layer from 0 to 4 m has the water table at 1.5 m. Above it, $\gamma = 17.0$ kN/m³; below, $\gamma_{sat} = 19.5$ kN/m³. Find $\sigma'$ at 4 m.

- $\sigma = 17.0(1.5) + 19.5(2.5) = 25.5 + 48.75 = 74.25$ kPa
- $u = 9.81(2.5) = 24.53$ kPa
- $\sigma' = 74.25 - 24.53 = 49.73$ kPa

## Common slips
- Dividing water weight by the wet weight. Water content uses the dry weight.
- Mixing up $e$ and $n$. Seepage velocity divides by $n$; $Se = wG_s$ uses $e$.
- Measuring pore pressure depth from the ground surface instead of the water table.
- Using $\log_{10}$ in the falling-head formula. It is the natural log.
- Swapping $N_f$ and $N_d$. There are usually fewer flow channels than drops, so $N_f/N_d$ is below 1.
