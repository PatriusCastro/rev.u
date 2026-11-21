subject: math
area: Differential equations
name: Differential equations and growth
minutes: 12
order: 7

## Order and degree
The **order** is the highest derivative in the equation. The **degree** is the power of that highest derivative, once the equation is free of radicals and fractions in the derivatives.

$$\left(\dfrac{d^2y}{dx^2}\right)^3 + \dfrac{dy}{dx} = x \quad\text{has order 2, degree 3.}$$

## Eliminating arbitrary constants
A family with $n$ constants gives a DE of order $n$. Differentiate $n$ times, then eliminate the constants. A shortcut for exponentials:

$$y = Ae^{ax} + Be^{bx} \;\Rightarrow\; y'' - (a+b)y' + ab\,y = 0$$

## Separable equations
Move every $y$ to one side and every $x$ to the other, then integrate both sides. Add one constant.

$$\dfrac{dy}{dx} = f(x)g(y) \;\Rightarrow\; \int \dfrac{dy}{g(y)} = \int f(x)\,dx$$

## First-order linear equations
Write it as $y' + P(x)y = Q(x)$. Multiply by the integrating factor $\mu = e^{\int P\,dx}$:

$$y\,\mu = \int Q\,\mu\,dx + C$$

## Growth, decay and cooling
- Growth or decay: $\dfrac{dN}{dt} = kN$ gives $N = N_0e^{kt}$. Half-life: $t_{1/2} = \dfrac{\ln 2}{|k|}$.
- Newton's law of cooling, surroundings at $T_s$: $T - T_s = (T_0 - T_s)e^{-kt}$.
- Find $k$ from one known reading, then use it for the question.

## Mixing tank
Let $Q$ be the amount of salt. Then

$$\dfrac{dQ}{dt} = (\text{rate in}) - (\text{rate out}) = c_{in}r_{in} - \dfrac{Q}{V}r_{out}$$

When the flows in and out are equal, the volume $V$ stays fixed and the equation is linear.

## Second-order, constant coefficients
For $ay'' + by' + cy = 0$, solve $ar^2 + br + c = 0$.
- Distinct real roots: $y = C_1e^{r_1x} + C_2e^{r_2x}$
- Repeated root $r$: $y = (C_1 + C_2x)e^{rx}$
- Complex roots $\alpha \pm \beta i$: $y = e^{\alpha x}(C_1\cos\beta x + C_2\sin\beta x)$

To go backwards, build the quadratic from the roots: $r^2 - (r_1 + r_2)r + r_1r_2 = 0$.

## Worked example
A bacteria culture grows from 400 to 1000 in 3 hours. How long until it reaches 5000?

- $1000 = 400e^{3k}$, so $k = \dfrac{\ln 2.5}{3} = 0.3054$ per hour.
- $5000 = 400e^{kt}$, so $t = \dfrac{\ln 12.5}{0.3054} = 8.27$ hours.

## Common slips
- Mixing up order and degree. Order is which derivative; degree is its power.
- Forgetting the constant of integration, or adding it only after solving for $y$.
- In Newton's law, using $T$ instead of $T - T_s$ in the exponential.
- In a mixing tank, using the starting volume when the flows in and out differ.
- For complex roots, putting $\beta$ in the exponential and $\alpha$ in the cosine.
