subject: math
area: Surveying
name: Taping, leveling and stadia
minutes: 14
order: 8

## Tape corrections
Each correction is added to the measured length. Its sign tells you whether the tape reads short or long.

- Temperature: $C_t = \alpha L (T - T_s)$, with $\alpha = 0.0000116$/°C for steel. Hotter than standard means positive.
- Pull: $C_p = \dfrac{(P - P_s)L}{AE}$. More pull than standard means positive.
- Sag (tape held only at its ends): $C_s = -\dfrac{w^2L^3}{24P^2}$, with $w$ in N/m. Always negative.
- Standardization: if the tape is actually longer than marked, every reading is too small, so the correction is positive.

Only use a correction when the problem gives a reason for it: a temperature away from standard, a pull away from standard, or a tape held in the air.

## A tape that is too long or too short
$$\text{true length} = \text{measured length} \times \dfrac{\text{actual tape length}}{\text{nominal tape length}}$$

To lay out a required distance, turn it around: tape reading $= \text{required} \times \dfrac{\text{nominal}}{\text{actual}}$.

## Differential leveling
$$\text{HI} = \text{elevation} + \text{BS}, \qquad \text{next elevation} = \text{HI} - \text{FS}$$

For a whole run: $\text{last elevation} = \text{first elevation} + \Sigma\text{BS} - \Sigma\text{FS}$.

## Reciprocal leveling
Set up near each end and read both rods. Let $d_1$ and $d_2$ be the two apparent differences.

$$\text{true difference} = \dfrac{d_1 + d_2}{2}, \qquad \text{error} = \dfrac{d_1 - d_2}{2}$$

## Curvature and refraction
$$h = 0.0675K^2 \quad (h \text{ in m}, K \text{ in km})$$

For a sight just grazing the sea or ground between two heights, add the two distances: $K = \sqrt{h_1/0.0675} + \sqrt{h_2/0.0675}$.

## Stadia
With stadia constant $K = 100$, $C = 0$ and rod intercept $s$:

- Horizontal sight: $D = Ks$.
- Inclined sight at angle $\theta$: $H = Ks\cos^2\theta$, $V = \tfrac{1}{2}Ks\sin 2\theta$.
- Elevation of rod point $=$ station elevation $+$ HI $+ V -$ middle hair reading.

## Repeated measurements
- Probable error of one measurement: $E = 0.6745\sqrt{\dfrac{\Sigma v^2}{n-1}}$.
- Probable error of the mean: $E_m = 0.6745\sqrt{\dfrac{\Sigma v^2}{n(n-1)}}$.
- Weighted mean: weights proportional to the number of trials, or to $1/E^2$.

## Pacing
Pace factor $=$ known course length $\div$ average number of paces. Distance $=$ average paces $\times$ pace factor.

## Worked example
A 30 m tape is found to be 29.985 m long. A line measured with it reads 214.60 m. Find the true length.

- The tape is short, so every reading is too big.
- True length $= 214.60 \times \dfrac{29.985}{30} = 214.49$ m.

## Common slips
- Using the measured temperature instead of the difference $T - T_s$.
- Flipping the ratio for a long or short tape. A long tape reads too little; a short tape reads too much.
- Using the standard pull in the sag formula. Use the pull actually applied.
- Writing $V = Ks\sin\theta$ or forgetting the $\tfrac{1}{2}$ in $\tfrac{1}{2}Ks\sin 2\theta$.
- Using $n$ instead of $n(n-1)$ under the root for the probable error of the mean.
