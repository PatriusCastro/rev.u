subject: struct
area: Structural
name: Steel members and connections
minutes: 15
order: 7

## LRFD in one line
NSCP 2015 follows AISC 360. Each limit state gives a nominal strength $R_n$, and the design strength is $\phi R_n$. Check every limit state and keep the smallest. Take $E = 200{,}000$ MPa.

## Tension members
- Yielding of the gross section: $\phi P_n = 0.90 F_y A_g$.
- Rupture of the effective net section: $\phi P_n = 0.75 F_u A_e$, with $A_e = U A_n$.
- Net area: deduct each hole across the failure line. Take the hole as $d + 2$ mm unless the problem says otherwise, so $A_n = A_g - n(d+2)t$.

## Block shear rupture
A block tears out along shear planes and a tension plane:

$$\phi R_n = 0.75\left[0.6F_u A_{nv} + U_{bs}F_u A_{nt}\right] \le 0.75\left[0.6F_y A_{gv} + U_{bs}F_u A_{nt}\right]$$

Use $U_{bs} = 1.0$ for uniform tension stress.

## Compression members
$$F_e = \dfrac{\pi^2 E}{(KL/r)^2}$$

- If $KL/r \le 4.71\sqrt{E/F_y}$ (inelastic): $F_{cr} = 0.658^{F_y/F_e}\,F_y$.
- If $KL/r > 4.71\sqrt{E/F_y}$ (elastic): $F_{cr} = 0.877F_e$.
- $\phi_c P_n = 0.90F_{cr}A_g$. Use the largest $KL/r$ of the two axes.

## Bolts and welds
- Bolt shear: $\phi R_n = 0.75F_{nv}A_b$ per bolt per shear plane, $A_b = \pi d^2/4$ from the nominal bolt diameter.
- Bearing at a hole: $\phi R_n = 0.75(2.4\,d\,t\,F_u)$ per bolt, with $d$ the bolt diameter and $t$ the plate thickness.
- Fillet weld: $\phi R_n = 0.75(0.60F_{EXX})(0.707w)L$, where $0.707w$ is the throat.

## Beams
- Compact, fully braced: $\phi M_n = 0.90F_yZ_x$.
- Shear of a rolled I-shape web: $\phi V_n = 1.0(0.6F_y\,d\,t_w)$, with $\phi = 1.0$.

## Worked example
A column has $A_g = 7600$ mm², $r_{\min} = 55$ mm, $KL = 4.0$ m and $F_y = 248$ MPa. Find $\phi_c P_n$.

- $KL/r = 4000/55 = 72.7$. Limit $= 4.71\sqrt{200{,}000/248} = 133.8$, so inelastic.
- $F_e = \dfrac{\pi^2(200{,}000)}{72.7^2} = 373.2$ MPa.
- $F_{cr} = 0.658^{248/373.2}(248) = 187.8$ MPa.
- $\phi_c P_n = 0.90(187.8)(7600) = 1284$ kN.

## Common slips
- Using $A_g$ for rupture, or forgetting $U$.
- Taking the hole as the bolt diameter instead of $d + 2$ mm in the net area.
- Using the strong-axis $r$ when the weak axis has the larger $KL/r$.
- Using the elastic formula below the $4.71\sqrt{E/F_y}$ limit, or the reverse.
- Counting one shear plane when the bolt is in double shear.
- Using the leg size $w$ instead of the throat $0.707w$ for a fillet weld.
- Leaving out $\phi$, or using 0.90 for beam shear of rolled shapes.
