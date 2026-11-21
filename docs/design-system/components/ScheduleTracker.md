# ScheduleTracker

Shows where a missed problem is in its repeat schedule: 1 day, 3 days, 7 days, then cleared.

## Anatomy

Four stops on a line. Each stop is a 12px marker with a `caption` label under it. The current stop is filled `amber` with an `amber-soft` halo and a semi-bold label in `ink`. The other stops are hollow with a `line-strong` outline.

## Behaviour

- A correct answer moves the marker one stop to the right.
- A correct answer at 7 days moves it to Cleared.
- A wrong answer at any stop sends it back to 1 day.
- When the marker moves, it pops once (400ms).

## Rules

- Show it on the problem screen under the answers, inside a card with the label "Repeat schedule".
- In the notebook list, use the compact form: three 8px dots filled `green` up to the current stop, with the interval as a caption.
- The stop labels are always written out. The marker colour alone does not carry the meaning.

## You provide

The current stop.
