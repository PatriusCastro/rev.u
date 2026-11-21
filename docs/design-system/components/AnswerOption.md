# AnswerOption

One choice in a multiple-choice problem. A problem shows four, stacked with an 8px gap.

## Anatomy

A 24px round letter badge, the answer text, and a state icon on the right that appears only after answering.

## States

- **Default**: `surface` fill, 1px `line-strong` border, badge on `bg` with the letter in `ink-2`.
- **Correct**: `green` border, `green-soft` fill, semi-bold `green` text, badge filled `green`, a check icon. The badge pops once.
- **Wrong** (the one the reviewer picked): `red` border, `red-soft` fill, semi-bold `red` text, badge filled `red`, a cross icon. The option shakes once.
- **Locked**: after any answer, all four stop responding. The correct option is always shown, even when the reviewer picked a wrong one.

## Rules

- Height is `control-height` (48px) or taller if the answer wraps. Corners are `radius-md`.
- Keep the unit in the answer text: "34.64 m".
- The state icon carries the meaning for people who cannot tell red from green. Do not remove it.

## You provide

The letter, the answer text, whether it is the correct one, and what happens when it is picked.
