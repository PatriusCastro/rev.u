subject: math
area: Probability
name: Counting and probability
minutes: 12
order: 3

## Counting
If one choice can be made in $m$ ways and a second in $n$ ways, both together can be made in $mn$ ways.

Order matters (arrangements, rankings, codes): permutations. Order does not matter (committees, hands of cards): combinations.

$$P(n, r) = \frac{n!}{(n-r)!} \qquad C(n, r) = \frac{n!}{r!\,(n-r)!}$$

To arrange $n$ items where some repeat, divide by the factorial of each repeat count. For example, BOOK has $\dfrac{4!}{2!} = 12$ arrangements.

## Probability of an event
When every outcome is equally likely,

$$P(E) = \frac{\text{outcomes in } E}{\text{all outcomes}}$$

The chance that $E$ does not happen is $1 - P(E)$. This is often the easier side to count, as in "at least one".

## Conditional probability and Bayes
The chance of $A$ given that $B$ happened is

$$P(A \mid B) = \frac{P(A \text{ and } B)}{P(B)}$$

When an item can come from several sources and you are told the result (for example, it is defective), find the share of that result coming from each source. That is Bayes' theorem.

## Binomial and Poisson
With $n$ independent trials, each a success with probability $p$, the chance of exactly $k$ successes is

$$P(k) = C(n, k)\,p^k (1-p)^{n-k}$$

with mean $np$ and standard deviation $\sqrt{np(1-p)}$.

When events happen at an average rate $\lambda$ in an interval, the chance of exactly $k$ in that interval is

$$P(k) = \frac{\lambda^k e^{-\lambda}}{k!}$$

Scale $\lambda$ to the interval asked about first.

## Expected value
Multiply each outcome by its probability and add: $E = \sum x\,P(x)$. Count losses as negative.

## Normal distribution
Turn a value into a z-score, $z = \dfrac{x - \mu}{\sigma}$, then read the area from a standard normal table or your calculator.

## Worked example
A bag holds 5 red and 3 blue marbles. Two are drawn without replacing. What is the chance both are red?

- First red: $\dfrac{5}{8}$. Second red, given the first was red: $\dfrac{4}{7}$.
- $P = \dfrac{5}{8} \times \dfrac{4}{7} = \dfrac{20}{56} = \dfrac{5}{14}$.

## Common slips
- Using permutations for a committee. Members of a committee have no order.
- Forgetting that drawing without replacing changes the second probability.
- Using the Poisson rate for the wrong interval length.
