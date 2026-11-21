# RepeatsCard

The main card on Today. It tells the reviewer that repeats are due, what the work is, and starts the set.

## Anatomy

1. **Top row**: a chip with the stop number ("Stop 1 of 3") and the estimated time with a clock icon.
2. **Title**: the count, in `screen-title` ("6 repeats due").
3. **Supporting line**: one sentence in `on-green` saying why these matter.
4. **Age breakdown**: three equal columns showing how many repeats come from 1, 3 and 7 days ago.
5. **Button**: one inverse button, full width, "Start repeats" with an arrow.

## Rules

- It is always the first thing on Today, above statistics.
- It is the only gradient in the product: `green` to `green-deep` at 135 degrees, with two faint arcs in the top right corner.
- Padding is `space-5`, corners are `radius-xl`, and groups inside are 16px apart.
- When a set has been started, the button reads "Continue repeats" and the title shows what is left, for example "4 repeats left".
- When nothing is due, do not show an empty green card. Replace it with a plain card that says "No repeats due today" and promote the next stop of the route to the main action.

## You provide

The number due, the estimated minutes, the three age counts, the stop number, and the action that starts the set.
