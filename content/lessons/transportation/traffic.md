subject: math
area: Transportation
name: Traffic flow, safety and pavements
minutes: 14
order: 11

## Flow, speed and density
Flow $q$ (veh/h) equals density $k$ (veh/km) times space mean speed $v$ (km/h).

$$q = kv$$

Average headway is $h = \dfrac{3600}{q}$ seconds. Average spacing is $s = \dfrac{1000}{k}$ metres.

## Greenshields model
Speed falls in a straight line as density rises:

$$v = v_f\left(1 - \dfrac{k}{k_j}\right)$$

$v_f$ is the free-flow speed and $k_j$ the jam density. At capacity, $k = \dfrac{k_j}{2}$ and $v = \dfrac{v_f}{2}$, so

$$q_{max} = \dfrac{v_f k_j}{4}$$

## Time-mean and space-mean speed
From a list of $n$ spot speeds: time-mean speed is the ordinary average, space-mean speed is the harmonic mean.

$$v_t = \dfrac{\sum v_i}{n} \qquad v_s = \dfrac{n}{\sum \frac{1}{v_i}}$$

Space-mean speed is always the smaller of the two. Use $v_s$ in $q = kv$.

## Peak hour factor
With four 15-minute counts in the peak hour:

$$PHF = \dfrac{V_{hour}}{4\,V_{15,max}}$$

It is never above 1.

## Accident rates
Intersection, per million entering vehicles ($V$ = total entering ADT, $T$ = years):

$$R = \dfrac{A \times 10^6}{365\,T\,V}$$

Road segment of length $L$ km, per 100 million vehicle-km:

$$R = \dfrac{A \times 10^8}{365\,T\,V L}$$

Severity ratio $= \dfrac{\text{fatal} + \text{injury accidents}}{\text{total accidents}}$.

## Pavements
Rigid, corner load (Goldbeck): $t = \sqrt{\dfrac{3W}{f}}$, with $W$ in N, $f$ the allowable flexural stress in MPa, $t$ in mm.

Flexible, CBR formula (SI form): $t = \sqrt{P\left(\dfrac{17.8}{CBR} - \dfrac{1}{\pi p}\right)}$, with wheel load $P$ in N, tyre pressure $p$ in MPa, $t$ in mm above the layer of that CBR.

Equivalent single axle loads: $ESAL = \sum (\text{axles} \times LEF)$ per day, times 365 times the design years.

## Webster's optimum cycle
$$C_o = \dfrac{1.5L + 5}{1 - Y}$$

$L$ is the total lost time per cycle in seconds. $Y$ is the sum of the critical flow ratios $y = \dfrac{q}{s}$, one per phase.

## Worked example
A lane follows $v = 70\left(1 - \dfrac{k}{140}\right)$ km/h. Find the capacity and the speed at capacity.

- $v_f = 70$ km/h, $k_j = 140$ veh/km.
- $q_{max} = \dfrac{70(140)}{4} = 2450$ veh/h.
- Speed at capacity $= \dfrac{70}{2} = 35$ km/h, at $k = 70$ veh/km. Check: $70 \times 35 = 2450$.

## Common slips
- Averaging spot speeds and calling it space-mean speed. That is the time-mean speed.
- Using $\dfrac{v_f k_j}{2}$ for capacity. Both speed and density are halved, so divide by 4.
- Putting the lowest 15-minute count in the PHF. Use the highest, or the PHF comes out above 1.
- Forgetting the 365 or the number of years in accident rates, or leaving out the length for a road segment.
- Adding the flow ratios of every movement in Webster's formula. Use only the critical one per phase.
