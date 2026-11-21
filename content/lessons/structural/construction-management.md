subject: struct
area: Construction
name: Estimating, scheduling and engineering economy
minutes: 14
order: 8

## PERT durations
Each activity gets an optimistic time $a$, a most likely time $m$ and a pessimistic time $b$.

$$t_e = \dfrac{a + 4m + b}{6} \qquad \sigma^2 = \left(\dfrac{b - a}{6}\right)^2$$

For the project, add the $t_e$ and the variances of the critical activities. Then $\sigma = \sqrt{\sum \sigma^2}$ and

$$z = \dfrac{T - \sum t_e}{\sigma}$$

The chance of finishing by day $T$ is the normal table value at $z$.

## Float
Total float is the slack an activity has before it delays the project:

$$TF = LS - ES = LF - EF = LF - ES - d$$

Critical activities have zero float.

## Equipment and hauling
- Excavator output: $Q = \text{bucket} \times \text{fill factor} \times \text{cycles per hour} \times \text{efficiency}$. Cycles per hour $= 3600/\text{cycle time in seconds}$. A 50-minute hour is an efficiency of $50/60$.
- One truck hauls $\text{capacity} \times 60/\text{round trip in minutes}$ m³ per hour. Trucks needed $=$ excavator output ÷ one truck's output, rounded up.
- Cost per m³ $=$ hourly cost (equipment plus operator) ÷ actual output per hour.

## Quantities
- Rebar weight: $\dfrac{d^2}{162}$ kg/m with $d$ in mm. Multiply by the total bar length.
- Column formwork: perimeter × height for each column. Beam formwork: bottom plus two sides, $(b + 2h)L$, using the depth below the slab for the sides if a slab is cast with it.

## Engineering economy
- Simple interest: $F = P(1 + in)$.
- Compound interest: $F = P(1 + i)^n$.
- Present worth of a uniform end-of-period series: $P = A\,\dfrac{(1+i)^n - 1}{i(1+i)^n}$.
- Straight-line depreciation: $d = \dfrac{C - S}{n}$ per year, and book value after $m$ years is $C - m\,d$.
- Break-even quantity: $Q = \dfrac{\text{fixed cost}}{\text{price} - \text{variable cost per unit}}$.

## Worked example
A crane costs ₱3,000,000, lasts 10 years and is sold for ₱400,000. Find its book value after 4 years by straight line.

- $d = \dfrac{3{,}000{,}000 - 400{,}000}{10} = 260{,}000$ per year.
- Book value $= 3{,}000{,}000 - 4(260{,}000) =$ ₱1,960,000.

## Common slips
- Adding standard deviations instead of variances in PERT.
- Using all activities, not just the critical ones, for the project variance.
- Leaving out the fill factor or the efficiency in equipment output.
- Rounding the number of trucks down. A fraction of a truck means one more truck.
- Using the radius instead of the diameter in $d^2/162$.
- Forgetting the salvage value in depreciation, or using simple interest when the rate is compounded.
